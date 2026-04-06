import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Provider } from 'react-redux'
import store from './store/store.js'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

const appTree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {appTree}
        </GoogleOAuthProvider>
      ) : (
        appTree
      )}
    </Provider>
  </StrictMode>,
)
