import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import ForgetPassword from "../features/auth/pages/ForgetPassword.jsx";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import Layout from "../features/chat/components/Layout.jsx";
import Home from "../features/home/Home.jsx";
import Chat from "../features/chat/pages/Chat.jsx";
import Protected from "../features/auth/components/Protected.jsx";

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
    path: "/forgot-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    // Protected layout with persistent sidebar
    element: (
      <Protected>
        <Layout />
      </Protected>
    ),
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/chat/:chatId?",
        element: <Chat />,
      },
    ],
  },
]);
