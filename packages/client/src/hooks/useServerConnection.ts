import { useEffect, useRef } from 'react';
import { wsClient } from '../api/subscription-client';
import { useNotifications } from './useNotifications';

export const useServerConnection = () => {
  const { success, error, info } = useNotifications();
  const isConnected = useRef(false);

  useEffect(() => {
    // Subscribe to client status events
    const unsubscribeConnected = wsClient.on('connected', () => {
      if (!isConnected.current) {
        isConnected.current = true;
        success('Connected to server stream');
      }
    });

    const unsubscribeClosed = wsClient.on('closed', () => {
      if (isConnected.current) {
        isConnected.current = false;
        error('Connection to server lost');
      }
    });

    const unsubscribeError = wsClient.on('error', () => {
      // error('Connection error');
      // Silent error or retry logic usually handles this, 'closed' is clearer for lost connection
    });

    // Start a heartbeat subscription to verify data flow and keep connection alive
    const unsubscribeSubscription = wsClient.subscribe(
      {
        query: 'subscription { systemNotification }',
      },
      {
        next: () => {
          // Heartbeat received - connection is alive
        },
        error: (err) => {
          console.error('Subscription error:', err);
        },
        complete: () => {},
      }
    );

    return () => {
      unsubscribeConnected();
      unsubscribeClosed();
      unsubscribeError();
      unsubscribeSubscription();
    };
  }, [success, error, info]);
};
