import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "./components"
import AppRouter from "./route"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { WebSocketProvider } from './services/WebSocketProvider'

function App() {

  window.env = import.meta.env;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  })

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <ThemeProvider defaultTheme="dark" >
            <AppRouter />
          </ThemeProvider>
        </WebSocketProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

export default App
