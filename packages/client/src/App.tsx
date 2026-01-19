import { useState, useEffect } from 'react'
import { API_ROUTES, type ApiResponse } from '@alle/shared'
import { container } from './container'

// Get API URL from config provider (no more direct import.meta.env access)
const API_URL = container.config.get('VITE_API_URL', 'http://localhost:4000')

/**
 * Main App component
 *
 * Simple hello world that demonstrates client-server communication
 * Fetches a message from the Bun API server on mount
 */
function App() {
  const [message, setMessage] = useState<string>('Loading...')

  // Fetch message from server on component mount
  useEffect(() => {
    // Test with type-safe health endpoint
    fetch(`${API_URL}${API_ROUTES.HEALTH}`)
      .then(res => res.json())
      .then((data: ApiResponse<{ status: string }>) => {
        setMessage(`Hello from Bun Server! Health: ${data.data.status}`)
      })
      .catch(() => setMessage('Hello from Client! (Server not running)'))
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1>Alle - Todo App</h1>
      <p>{message}</p>
    </div>
  )
}

export default App
