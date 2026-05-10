import { createBrowserRouter } from "react-router";
import Home from "../features/home/Home.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import ForgetPassword from "../features/auth/pages/ForgetPassword.jsx";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import Dashboard from "../features/chat/pages/Dashboard.jsx";
import Protected from "../features/auth/components/protected.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home",
    element: <Protected><Home /></Protected>
  },
  {
    path: "/forgot-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,

  },
]);
