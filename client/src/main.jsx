import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react';


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Auth0Provider
      domain="dev-8ptywct04vgjtup4.us.auth0.com"
      clientId="xAo62uLQ1I83yi4KnxNyYqFdRC9U4Dea"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
    
        <App />
      
    </Auth0Provider>
  // </React.StrictMode>
);