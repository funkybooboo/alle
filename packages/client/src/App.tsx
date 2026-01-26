import { API_ROUTES, type ApiResponse } from '@alle/shared';
import { useEffect, useState } from 'react';
import { container } from './container';

/**
 * Main App component
 *
 * Simple hello world that demonstrates client-server communication
 * Fetches a message from the Bun API server on mount
 *
 * Now uses the HTTP client adapter instead of fetch directly.
 * This makes it easy to swap implementations (axios, ky, etc.)
 * by changing one line in the container.
 */
function App(): React.JSX.Element {
    const [message, setMessage] = useState<string>('Loading...');

    // Fetch message from server on component mount using HTTP client adapter
    useEffect(() => {
        const httpClient = container.httpClient;

        // Type-safe health endpoint fetch
        httpClient
            .get<ApiResponse<{ status: string }>>(API_ROUTES.HEALTH)
            .then(data => {
                setMessage(`Hello from Bun Server! Health: ${data.data.status}`);
            })
            .catch(() => setMessage('Hello from Client! (Server not running)'));
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'system-ui, sans-serif',
                flexDirection: 'column',
                gap: '1rem',
            }}
        >
            <h1>Alle - Task App</h1>
            <p>{message}</p>
        </div>
    );
}

export default App;
