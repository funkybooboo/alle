# API Abstraction

This document explains how to wrap third-party APIs and services with custom interfaces, ensuring flexibility, maintainability, and independence from vendor implementations.

## Philosophy

Our API abstraction approach prioritizes:

- **Design the API you wish they had** — don't let vendor limitations dictate your domain
- **Provider independence** — never lock into a single vendor
- **Consistent interfaces** — same patterns across all external services
- **Easy provider switching** — change vendors with minimal code changes
- **Testability** — simple to create test implementations

---

## Core Principle: Design the Perfect Interface First

**RULE**: NEVER let third-party API limitations dictate your domain design.

### Process

1. **Design your ideal interface** — ignore vendor quirks
2. **Define the contract** — what YOUR application needs
3. **Create adapter implementations** — translate to vendor APIs
4. **Add multiple providers** — for flexibility and redundancy

❌ **BAD** — Let vendor API dictate your interface:
```typescript
// Tightly coupled to Stripe
async function createPayment(
  amount: number,
  currency: string,
  source: string,  // Stripe-specific
  metadata: StripeMetadata  // Stripe-specific type
): Promise<StripeCharge> {  // Stripe-specific return type
  return stripe.charges.create({
    amount,
    currency,
    source,
    metadata
  });
}
```

✅ **GOOD** — Design perfect interface, adapt to vendors:
```typescript
// Your perfect interface
interface PaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

// Domain types (yours, not vendor's)
interface PaymentRequest {
  amount: number;
  currency: Currency;
  customer: CustomerInfo;
  description: string;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  createdAt: string;
}
```

---

## Payment Service Abstraction Example

### Step 1: Define Perfect Interface

```typescript
/**
 * Payment service abstraction for processing payments.
 *
 * Implementations handle provider-specific details.
 */
export interface PaymentService {
  /**
   * Process a payment.
   *
   * @param request - Payment details
   * @returns Payment result with ID and status
   * @throws {PaymentError} If payment fails
   */
  processPayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Refund a payment partially or fully.
   *
   * @param request - Refund details
   * @returns Refund result with ID and status
   * @throws {RefundError} If refund fails
   */
  refundPayment(request: RefundRequest): Promise<RefundResult>;

  /**
   * Capture a previously authorized payment.
   *
   * @param request - Capture details
   * @returns Capture result
   * @throws {CaptureError} If capture fails
   */
  capturePayment(request: CaptureRequest): Promise<CaptureResult>;

  /**
   * Create or update a customer profile.
   *
   * @param customer - Customer details
   * @returns Customer ID
   */
  createCustomer(customer: CustomerData): Promise<string>;

  /**
   * Verify webhook signature for security.
   *
   * @param payload - Webhook payload
   * @param signature - Webhook signature
   * @returns True if signature is valid
   */
  verifyWebhook(payload: string, signature: string): Promise<boolean>;

  /**
   * Get features supported by this provider.
   *
   * @returns Feature support matrix
   */
  supportedFeatures(): PaymentFeatures;

  /**
   * Get countries supported by this provider.
   *
   * @returns Array of country codes
   */
  supportedCountries(): string[];

  /**
   * Get currencies supported by this provider.
   *
   * @returns Array of currency codes
   */
  supportedCurrencies(): Currency[];
}
```

### Step 2: Define Domain Types

```typescript
export interface PaymentRequest {
  amount: number;
  currency: Currency;
  customer: CustomerInfo;
  description: string;
  captureMethod?: 'automatic' | 'manual';
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  customer: CustomerInfo;
  createdAt: string;
  metadata?: Record<string, string>;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

export interface CustomerInfo {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;  // Undefined = full refund
  reason?: string;
}

export interface PaymentFeatures {
  supportsRecurring: boolean;
  supportsPartialRefunds: boolean;
  supportsDisputes: boolean;
  supportsMultiCurrency: boolean;
  supportsPaymentMethods: PaymentMethod[];
}

export type PaymentMethod =
  | 'card'
  | 'bank_transfer'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay';
```

### Step 3: Create Stripe Adapter

```typescript
import Stripe from 'stripe';

export class StripePaymentService implements PaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Translate YOUR types → Stripe types
      const stripeCharge = await this.stripe.charges.create({
        amount: Math.round(request.amount * 100),  // Stripe uses cents
        currency: request.currency.toLowerCase(),
        source: request.customer.id ?? 'tok_visa',  // Stripe requires token
        description: request.description,
        metadata: request.metadata ?? {},
      });

      // Translate Stripe types → YOUR types
      return {
        id: stripeCharge.id,
        status: this.mapStripeStatus(stripeCharge.status),
        amount: stripeCharge.amount / 100,  // Convert from cents
        currency: stripeCharge.currency.toUpperCase() as Currency,
        customer: request.customer,
        createdAt: new Date(stripeCharge.created * 1000).toISOString(),
        metadata: stripeCharge.metadata,
      };
    } catch (error) {
      throw new PaymentError('Stripe payment failed', { cause: error });
    }
  }

  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    const stripeRefund = await this.stripe.refunds.create({
      charge: request.paymentId,
      amount: request.amount ? Math.round(request.amount * 100) : undefined,
      reason: request.reason as Stripe.RefundCreateParams.Reason,
    });

    return {
      id: stripeRefund.id,
      paymentId: stripeRefund.charge as string,
      amount: stripeRefund.amount / 100,
      status: stripeRefund.status === 'succeeded' ? 'succeeded' : 'failed',
      createdAt: new Date(stripeRefund.created * 1000).toISOString(),
    };
  }

  supportedFeatures(): PaymentFeatures {
    return {
      supportsRecurring: true,
      supportsPartialRefunds: true,
      supportsDisputes: true,
      supportsMultiCurrency: true,
      supportsPaymentMethods: ['card', 'apple_pay', 'google_pay'],
    };
  }

  supportedCountries(): string[] {
    return ['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'JP', /* 40+ more */];
  }

  supportedCurrencies(): Currency[] {
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  }

  private mapStripeStatus(status: string): PaymentStatus {
    const mapping: Record<string, PaymentStatus> = {
      'succeeded': 'succeeded',
      'pending': 'pending',
      'failed': 'failed',
    };
    return mapping[status] ?? 'failed';
  }
}
```

### Step 4: Create PayPal Adapter

```typescript
import paypal from '@paypal/checkout-server-sdk';

export class PayPalPaymentService implements PaymentService {
  private client: paypal.core.PayPalHttpClient;

  constructor(clientId: string, clientSecret: string, environment: 'sandbox' | 'production') {
    const env = environment === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.client = new paypal.core.PayPalHttpClient(env);
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Create PayPal order
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.prefer('return=representation');
    orderRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: request.currency,
          value: request.amount.toFixed(2),  // PayPal uses string decimals
        },
        description: request.description,
      }],
    });

    const orderResponse = await this.client.execute(orderRequest);

    // Translate PayPal → YOUR types
    return {
      id: orderResponse.result.id,
      status: this.mapPayPalStatus(orderResponse.result.status),
      amount: request.amount,
      currency: request.currency,
      customer: request.customer,
      createdAt: orderResponse.result.create_time,
      metadata: request.metadata,
    };
  }

  supportedFeatures(): PaymentFeatures {
    return {
      supportsRecurring: true,
      supportsPartialRefunds: true,
      supportsDisputes: true,
      supportsMultiCurrency: true,
      supportsPaymentMethods: ['paypal', 'card'],
    };
  }

  supportedCountries(): string[] {
    return ['US', 'CA', 'GB', 'DE', 'FR', 'AU', /* 200+ countries */];
  }

  private mapPayPalStatus(status: string): PaymentStatus {
    const mapping: Record<string, PaymentStatus> = {
      'CREATED': 'pending',
      'APPROVED': 'processing',
      'COMPLETED': 'succeeded',
      'VOIDED': 'canceled',
    };
    return mapping[status] ?? 'failed';
  }
}
```

### Step 5: Use via Dependency Injection

```typescript
// Configuration determines provider
const paymentService: PaymentService = config.get('PAYMENT_PROVIDER') === 'stripe'
  ? new StripePaymentService(config.get('STRIPE_API_KEY'))
  : new PayPalPaymentService(
      config.get('PAYPAL_CLIENT_ID'),
      config.get('PAYPAL_CLIENT_SECRET'),
      config.get('PAYPAL_ENV') as 'sandbox' | 'production'
    );

// Business logic doesn't know or care which provider
const result = await paymentService.processPayment({
  amount: 99.99,
  currency: 'USD',
  customer: {
    email: 'user@example.com',
    name: 'John Doe',
  },
  description: 'Premium subscription',
});
```

---

## Email Service Abstraction Example

### Perfect Interface

```typescript
export interface EmailService {
  sendTemplatedEmail(request: TemplatedEmailRequest): Promise<EmailResult>;
  sendBulkEmails(requests: BulkEmailRequest[]): Promise<BulkEmailResult>;
  createTemplate(template: EmailTemplate): Promise<string>;
  scheduleEmail(request: ScheduledEmailRequest): Promise<string>;
  getEmailAnalytics(request: AnalyticsRequest): Promise<EmailAnalytics>;
  validateEmailAddress(email: string): Promise<boolean>;
  manageSuppressedEmails(action: 'add' | 'remove', emails: string[]): Promise<void>;
  setupWebhook(events: EmailEvent[], callbackUrl: string): Promise<void>;
}

export interface TemplatedEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: EmailAddress;
  replyTo?: EmailAddress;
  subject: string;
  templateId: string;
  templateData: Record<string, unknown>;
  attachments?: Attachment[];
}

export interface EmailAddress {
  email: string;
  name?: string;
}
```

### SendGrid Adapter

```typescript
import sgMail from '@sendgrid/mail';

export class SendGridEmailService implements EmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendTemplatedEmail(request: TemplatedEmailRequest): Promise<EmailResult> {
    const msg = {
      to: request.to,
      from: request.from.email,
      subject: request.subject,
      templateId: request.templateId,
      dynamicTemplateData: request.templateData,
    };

    const response = await sgMail.send(msg);

    return {
      id: response[0].headers['x-message-id'] as string,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };
  }

  // Other method implementations...
}
```

### AWS SES Adapter

```typescript
import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';

export class AWSEmailService implements EmailService {
  private client: SESClient;

  constructor(region: string) {
    this.client = new SESClient({ region });
  }

  async sendTemplatedEmail(request: TemplatedEmailRequest): Promise<EmailResult> {
    const command = new SendTemplatedEmailCommand({
      Source: request.from.email,
      Destination: {
        ToAddresses: request.to,
      },
      Template: request.templateId,
      TemplateData: JSON.stringify(request.templateData),
    });

    const response = await this.client.send(command);

    return {
      id: response.MessageId!,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };
  }

  // Other method implementations...
}
```

---

## Benefits of API Abstraction

### 1. Provider Flexibility

Switch providers without changing business logic:

```typescript
// Start with SendGrid
let emailService: EmailService = new SendGridEmailService(apiKey);

// Switch to AWS SES (one line change)
emailService = new AWSEmailService(region);

// Business logic unchanged
await emailService.sendTemplatedEmail(request);
```

### 2. Cost Optimization

Choose cheapest provider per region or volume:

```typescript
function selectPaymentProvider(country: string): PaymentService {
  if (country === 'US') {
    return new StripePaymentService(stripeKey);  // Best rates in US
  }
  if (country === 'DE') {
    return new PayPalPaymentService(ppId, ppSecret);  // Better in EU
  }
  return new SquarePaymentService(squareKey);  // Default
}
```

### 3. Redundancy and Failover

Use multiple providers for reliability:

```typescript
class FallbackPaymentService implements PaymentService {
  constructor(
    private primary: PaymentService,
    private fallback: PaymentService
  ) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      return await this.primary.processPayment(request);
    } catch (error) {
      logger.warn('Primary payment failed, trying fallback', { error });
      return await this.fallback.processPayment(request);
    }
  }
}

const paymentService = new FallbackPaymentService(
  new StripePaymentService(stripeKey),
  new PayPalPaymentService(ppId, ppSecret)
);
```

### 4. Testing Simplicity

Create test implementations easily:

```typescript
export class TestPaymentService implements PaymentService {
  private payments: Map<string, PaymentResult> = new Map();

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const payment: PaymentResult = {
      id: crypto.randomUUID(),
      status: 'succeeded',
      amount: request.amount,
      currency: request.currency,
      customer: request.customer,
      createdAt: new Date().toISOString(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  // No real API calls, instant tests
}
```

### 5. Feature Evolution

Add capabilities incrementally:

```typescript
// Start with basic features
interface PaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
}

// Add refunds later
interface PaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;  // Added
}

// Add subscriptions even later
interface PaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;
  createSubscription(request: SubscriptionRequest): Promise<Subscription>;  // Added
}
```

---

## Summary: Key Rules

✅ **DO**:
- Design your perfect interface first
- Use domain types, not vendor types
- Create adapter per provider
- Handle vendor quirks in adapters
- Make switching providers easy

❌ **NEVER**:
- Expose vendor types in public API
- Couple business logic to specific provider
- Skip the abstraction layer
- Let vendor limitations dictate design
- Use vendor SDKs directly in business logic

---

## Alle's Future Implementation

Apply this pattern to:

- Payment processing (Stripe, PayPal, Square)
- Email services (SendGrid, AWS SES, Mailgun)
- SMS services (Twilio, AWS SNS, MessageBird)
- File storage (AWS S3, Google Cloud Storage, Azure Blob)
- Authentication (Auth0, Firebase, custom OAuth)

**Result**: Never locked into a single vendor, always flexible, always testable.
