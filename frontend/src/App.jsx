import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { reset } from './store/slices/authSlice'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import TeamPage from './pages/TeamPage'
import CalendarPage from './pages/CalendarPage'
import AnalyticsPage from './pages/AnalyticsPage'
import TimeTrackingPage from './pages/TimeTrackingPage'
import AIPage from './pages/AIPage'
import ForbiddenPage from './pages/ForbiddenPage'
import AdminPage from './pages/AdminPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth)
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

const AdminRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth)
    if (!user || (user.systemRole !== 'admin' && user.systemRole !== 'superadmin')) {
        return <Navigate to="/forbidden" replace />
    }
    return children
}

function App() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    // Reset auth state on mount
    useEffect(() => {
        dispatch(reset())
    }, [dispatch])

    // ── Apply saved theme on boot ──────────────────────────────────
    useEffect(() => {
        const applyTheme = (theme) => {
            const root = document.documentElement
            if (theme === 'dark') {
                root.classList.add('dark')
            } else if (theme === 'light') {
                root.classList.remove('dark')
            } else {
                // system
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                root.classList.toggle('dark', prefersDark)
            }
        }

        const saved = localStorage.getItem('theme') || 'system'
        applyTheme(saved)

        // Listen for OS theme changes when in system mode
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => {
            if ((localStorage.getItem('theme') || 'system') === 'system') applyTheme('system')
        }
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    return (
        <div className="min-h-screen">
            <Routes>
                {/* Landing Root */}
                <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Dashboard Routes (Auth Required) */}
                <Route element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/time" element={<TimeTrackingPage />} />
                    <Route path="/ai" element={<AIPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    } />
                </Route>

                {/* Global Routes */}
                <Route path="/forbidden" element={<ForbiddenPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    )
}

export default App
