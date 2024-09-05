import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react'
import Dashboard from './routes/Dashboard.tsx';
import Repl from './routes/Repl.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: '/dashboard',
    element: <Dashboard/>
  },
  {
    path: "/repl/:replID/:type",
    element: <Repl/>,
    loader: ({ params }: any) => {return [params.replID, params.type]}
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/dashboard">
    <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
)
