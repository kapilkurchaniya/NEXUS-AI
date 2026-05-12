import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { useAuth } from "../features/auth/hook/useAuth.js"
import { useEffect } from "react"
import Toast from "../features/auth/components/Toast.jsx"

function App() { 
  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
  }, [handleGetMe])

  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  )
}

export default App
