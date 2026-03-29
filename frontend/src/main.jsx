import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import store from './store'
import App from './App'
import { SocketProvider } from './context/SocketContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SocketProvider>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#0f172a',
                                color: '#fff',
                                borderRadius: '12px',
                                padding: '16px',
                                fontWeight: 'semibold',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            },
                        }}
                    />
                </SocketProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
)
