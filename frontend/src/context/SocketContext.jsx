import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { Bell, Zap } from 'lucide-react'
import { addNotification } from '../store/slices/notificationSlice'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null)
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (user) {
            const newSocket = io(window.location.origin.includes('localhost') ? 'http://127.0.0.1:5000' : window.location.origin, {
                withCredentials: true,
                transports: ['websocket']
            })

            newSocket.on('connect', () => {
                console.log('🔌 Connected to TaskNest Real-time Engine')
                newSocket.emit('join_user', user._id)
            })

            newSocket.on('new_notification', (notification) => {
                console.log('🔔 New Notification:', notification)

                // Update Redux state
                dispatch(addNotification(notification))

                // Show Toast
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-primary-500/10`}>
                        <div className="flex-1 w-0 p-5">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-3xl p-4 flex items-center justify-center text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-500 focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ), { duration: 5000 })
            })

            setSocket(newSocket)

            return () => newSocket.close()
        }
    }, [user, dispatch])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
