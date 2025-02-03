import { ThemeProvider } from "./components"
import AppRouter from "./route"

function App() {

  return (
    <ThemeProvider defaultTheme="dark" >
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
