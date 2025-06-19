import { useState } from 'react'
import './App.css'
import Layout from './Layout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Form from './components/Form'
import {Toaster} from 'react-hot-toast'

import Profile from './components/Profile';
import Home from './components/Home';
import UserProfile from './components/UserProfile'

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <div>404 Not found</div>,
      children:[
        {path: "", element: <Home />,
          errorElement: <div>Page Not found</div>
        },
        {path: "profile", element: <Profile />,
          errorElement: <div>Page Not found</div>
        },
        {path: "createToken", element: <Form />,
          errorElement: <div>Page Not found</div>
        },
        {path: "account/:fid", element: <UserProfile />,
          errorElement: <div>Page Not found</div>
        }
      ]
    }
  ])

  return (
    <>
     <Toaster position="top-right" reverseOrder={false} />
     <RouterProvider router={router} />
    </>
   
  )
}

export default App
