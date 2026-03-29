import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import axios from 'axios'
import { getOrganizations, setActiveOrganization } from '../store/slices/orgSlice'
import { getProjects, setActiveProject } from '../store/slices/projectSlice'
import { getNotifications, markAsRead } from '../store/slices/notificationSlice'
import OrganizationModal from '../components/OrganizationModal'
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Calendar,
    Settings,
    LogOut,
    Search,
    Bell,
    Plus,
    Menu,
    X,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    Cpu,
    Building2,
    ChevronDown,
    Sparkles,
    Check,
    Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { canManageOrganization, ORG_ROLES } from '../utils/permissions'

const SidebarItem = ({ icon: Icon, label, path, badge }) => (
    <NavLink
        to={path}
        className={({ isActive }) => `
      flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive
                ? 'bg-primary-600/10 text-primary-600 font-semibold shadow-sm ring-1 ring-primary-600/10'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
    `}
    >
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
        </div>
        {badge && (
            <span className="px-2 py-0.5 text-[9px] font-black bg-primary-600 text-white rounded-full uppercase tracking-tighter">
                {badge}
            </span>
        )}
    </NavLink>
)

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024)
    const [searchFocused, setSearchFocused] = useState(false)
    const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
    const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] })
    const [isSearching, setIsSearching] = useState(false)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const { user, token } = useSelector((state) => state.auth)
    const { organizations, activeOrganization } = useSelector((state) => state.orgs)
    const { projects } = useSelector((state) => state.projects)
    const { notifications, unreadCount } = useSelector((state) => state.notifications)

    useEffect(() => {
        dispatch(getOrganizations())
        dispatch(getNotifications())
    }, [dispatch])

    useEffect(() => {
        if (activeOrganization) {
            dispatch(getProjects(activeOrganization._id))
        }
    }, [dispatch, activeOrganization])

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults({ tasks: [], projects: [] })
                return
            }
            setIsSearching(true)
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } }
                const res = await axios.get(`/api/v1/search?query=${searchQuery}&orgId=${activeOrganization?._id}`, config)
                setSearchResults(res.data.data)
            } catch (err) { }
            setIsSearching(false)
        }
        const timer = setTimeout(fetchSearchResults, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, activeOrganization, token])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    const selectOrg = (org) => {
        dispatch(setActiveOrganization(org))
        setOrgDropdownOpen(false)
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && window.innerWidth <= 1024 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[45]"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed lg:relative z-50 w-[280px] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl lg:shadow-none"
                    >
                        {/* Brand Header */}
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">TaskNest</h2>
                                </div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 ml-1">Orchestration Hub</p>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" />
                            <SidebarItem icon={Briefcase} label="Projects" path="/projects" />
                            <SidebarItem icon={Users} label="Team" path="/team" />
                            <SidebarItem icon={Calendar} label="Calendar" path="/calendar" />
                            <div className="px-4 py-8 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Insights</div>
                            <SidebarItem icon={TrendingUp} label="Analytics" path="/analytics" />
                            <SidebarItem icon={Clock} label="Time Metrics" path="/time" />
                            <SidebarItem icon={Cpu} label="AI Workflows" path="/ai" badge="New" />

                            {/* Organization Settings only for Owners/Admins */}
                            {canManageOrganization(user, activeOrganization) && (
                                <SidebarItem icon={Settings} label="Org Settings" path="/settings" />
                            )}

                            {(user?.systemRole === 'admin' || user?.systemRole === 'superadmin') && (
                                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="px-4 mb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin Hub</h3>
                                    <SidebarItem path="/admin" icon={Shield} label="System Admin" />
                                </div>
                            )}

                            {activeOrganization && projects.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <div className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                                        <span>Active Projects</span>
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[8px]">{projects.length}</span>
                                    </div>
                                    <div className="space-y-1 px-2">
                                        {projects.slice(0, 5).map(project => (
                                            <button
                                                key={project._id}
                                                onClick={() => {
                                                    dispatch(setActiveProject(project));
                                                    navigate(`/projects/${project._id}`);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-all group/project"
                                            >
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover/project:bg-primary-600 group-hover/project:text-white transition-colors">
                                                    {project.name?.charAt(0)}
                                                </div>
                                                <span className="truncate">{project.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </nav>

                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{user?.systemRole}</p>
                                </div>
                                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Center */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                <header className="h-20 shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-40 sticky top-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl hover:scale-105 active:scale-95 transition-all">
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Workspace Switcher in Header */}
                        <div className="relative">
                            <button
                                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                                className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all group"
                            >
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-600/20 group-hover:rotate-6 transition-transform">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Workspace</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none truncate max-w-[120px] flex items-center gap-2">
                                        {activeOrganization?.name || 'Select Org'}
                                        {activeOrganization?.subscription?.plan !== 'free' && (
                                            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 text-[8px] font-black uppercase tracking-tighter rounded-md border border-amber-200 dark:border-amber-800/50 shadow-sm animate-pulse-slow">
                                                {activeOrganization.subscription.plan === 'pro' ? 'Pro' : 'ENT'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {orgDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setOrgDropdownOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl py-4 z-50 overflow-hidden"
                                        >
                                            <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 mb-2">Switch Workspace</div>
                                            <div className="max-h-60 overflow-y-auto px-2 space-y-1">
                                                {organizations.map(org => (
                                                    <button
                                                        key={org._id}
                                                        onClick={() => { selectOrg(org); setOrgDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all ${activeOrganization?._id === org._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeOrganization?._id === org._id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                            {org.name?.charAt(0)}
                                                        </div>
                                                        <span className="truncate">{org.name}</span>
                                                        {activeOrganization?._id === org._id && <Check className="ml-auto w-4 h-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="mt-2 p-2 border-t border-slate-50 dark:border-slate-800">
                                                <button
                                                    onClick={() => { setIsOrgModalOpen(true); setOrgDropdownOpen(false); }}
                                                    className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    + Create New Org
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Search */}
                        <div className={`hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full max-w-sm transition-all relative ${searchFocused ? 'ring-2 ring-primary-500 bg-white dark:bg-slate-700 shadow-lg' : ''}`}>
                            <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-primary-600' : 'text-slate-400'}`} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                type="text"
                                placeholder="Universal search... (⌘K)"
                                className="bg-transparent border-none focus:outline-none text-sm font-medium w-full dark:text-white"
                            />

                            {searchFocused && searchQuery.length >= 2 && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-20 animate-slide-up">
                                    <div className="p-4 space-y-6">
                                        {searchResults.projects?.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-3">Projects</h3>
                                                <div className="space-y-1">
                                                    {searchResults.projects.map(p => (
                                                        <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-black text-xs">P</div>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{p.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {searchResults.tasks?.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-3">Tasks</h3>
                                                <div className="space-y-1">
                                                    {searchResults.tasks.map(t => (
                                                        <Link key={t._id} to={`/projects/${t.project._id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-black text-xs sm:w-8 sm:h-8">T</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.title}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">in {t.project.name}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {searchResults.tasks.length === 0 && searchResults.projects.length === 0 && !isSearching && (
                                            <div className="py-8 text-center">
                                                <p className="text-sm font-bold text-slate-400 italic">No results matched your query</p>
                                            </div>
                                        )}
                                        {isSearching && (
                                            <div className="py-4 flex justify-center">
                                                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent animate-spin rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="hidden xl:flex items-center gap-3 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            <Sparkles className="w-4 h-4" /> Premium
                        </button>
                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
                        <div className="relative">
                            <button
                                onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
                                className={`relative p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all group ${notifDrawerOpen ? 'ring-2 ring-primary-500' : ''}`}
                            >
                                <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary-600" />
                                {unreadCount > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse"></span>}
                            </button>

                            <AnimatePresence>
                                {notifDrawerOpen && (
                                    <>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotifDrawerOpen(false)} className="fixed inset-0 z-40 bg-transparent" />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-16 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl py-6 z-50 flex flex-col max-h-[500px]"
                                        >
                                            <div className="px-6 pb-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Inbox</h3>
                                                <span className="bg-primary-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto px-4 space-y-3 scrollbar-hide">
                                                {notifications.length > 0 ? notifications.map(n => (
                                                    <div key={n._id} onClick={() => dispatch(markAsRead(n._id))} className={`p-4 rounded-2xl transition-all cursor-pointer relative group ${n.isRead ? 'opacity-50' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100'}`}>
                                                        {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-full"></div>}
                                                        <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">{n.title}</h4>
                                                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{n.message}</p>
                                                        <div className="mt-2 flex justify-between items-center">
                                                            <span className="text-[9px] font-bold text-slate-400 capitalize">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {!n.isRead && <Check className="w-3 h-3 text-primary-500 opacity-0 group-hover:opacity-100" />}
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-10 opacity-30">
                                                        <Bell className="w-10 h-10 mx-auto mb-2" />
                                                        <p className="text-xs font-bold uppercase tracking-widest">Quiet for now</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <NavLink to="/profile" className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg hover:scale-105 transition-transform">
                            {user?.avatar?.url ? (<img src={user.avatar.url} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-500">{user?.name?.charAt(0)}</div>)}
                        </NavLink>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-1 relative z-10 scrollbar-hide">
                    <div className="min-h-full p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
            <OrganizationModal isOpen={isOrgModalOpen} onClose={() => setIsOrgModalOpen(false)} />
        </div>
    )
}

export default DashboardLayout
