import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects } from '../store/slices/projectSlice'
import { getOrganizations } from '../store/slices/orgSlice'
import OrganizationModal from '../components/OrganizationModal'
import axios from 'axios'
import {
    BarChart3,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Briefcase,
    ListTodo,
    ChevronRight,
    Sparkles,
} from 'lucide-react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
)

const StatCard = ({ label, value, trend, trendUp, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium group relative overflow-hidden"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-700 ${color}`} />
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 shadow-inner`}>
                <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'}`}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {trend}
            </div>
        </div>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{value}</h3>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </motion.div>
)

const DashboardPage = () => {
    const dispatch = useDispatch()
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false)
    const { user, token } = useSelector((state) => state.auth)
    const { projects } = useSelector((state) => state.projects)
    const { activeOrganization } = useSelector((state) => state.orgs)

    const [stats, setStats] = useState(null)
    const [loadingStats, setLoadingStats] = useState(true)

    useEffect(() => {
        dispatch(getOrganizations())
    }, [dispatch])

    useEffect(() => {
        const fetchStats = async () => {
            if (!activeOrganization) return
            setLoadingStats(true)
            try {
                const res = await axios.get(`/api/v1/tasks/dashboard/${activeOrganization._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setStats(res.data.data)
            } catch (err) {
                console.error('Failed to fetch stats', err)
            } finally {
                setLoadingStats(false)
            }
        }

        if (activeOrganization) {
            dispatch(getProjects(activeOrganization._id))
            fetchStats()
        }
    }, [dispatch, activeOrganization, token])

    const barData = {
        labels: stats?.activityHistory?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Tasks Created',
            data: stats?.activityHistory?.data || [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#8b5cf6',
            borderRadius: 12,
            barThickness: 15,
        }]
    }

    const doughnutData = {
        labels: ['Todo', 'Doing', 'Done'],
        datasets: [{
            data: [
                stats?.statusMap?.todo || 0,
                stats?.statusMap?.in_progress || 0,
                stats?.statusMap?.done || 0
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
            borderWidth: 0,
            hoverOffset: 12,
        }]
    }

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto px-4 md:px-10 animate-fade-in pb-20 relative z-10">
            {/* Dynamic Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                        <Sparkles className="w-3 h-3" /> AI Summary Available
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Welcome back, <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">{user?.name}</span> 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                        {activeOrganization ? (
                            <>You have <span className="text-primary-600 font-black italic">{projects.length} active projects</span> in {activeOrganization.name} workspace this week.</>
                        ) : (
                            "Please select or create an organization to get started."
                        )}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-premium border border-slate-100 dark:border-slate-800">
                    <div className="flex -space-x-3 px-4 py-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black shadow-lg">
                                U{i}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setIsOrgModalOpen(true)}
                            className="flex-1 sm:flex-none px-6 py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.5rem] text-sm font-black border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all text-center"
                        >
                            + Org
                        </button>
                        <Link to="/projects" className="flex-1 sm:flex-none px-10 py-4 bg-primary-600 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-95 transition-all text-center">
                            Launch Project
                        </Link>
                    </div>
                </div>
            </div>

            {/* Hyper-Visual Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Live Projects" value={projects.length} trend="+3.2%" trendUp={true} icon={Briefcase} color="bg-blue-600" />
                <StatCard label="Active Tasks" value={stats?.totalTasks || 0} trend="+12.5%" trendUp={true} icon={ListTodo} color="bg-primary-600" />
                <StatCard label="Completion Rate" value={`${stats?.completionRate || 0}%`} trend="-2.4%" trendUp={false} icon={CheckCircle2} color="bg-emerald-600" />
                <StatCard label="Overdue Alert" value={stats?.overdueTasks || 0} trend="+1.2%" trendUp={true} icon={AlertCircle} color="bg-rose-600" />
            </div>

            {/* Analytics Dashboard Section */}
            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-10">
                <div className="2xl:col-span-2 space-y-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><TrendingUp className="w-64 h-64" /></div>
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <BarChart3 className="w-6 h-6 text-primary-600" />
                                    Productivity Index
                                </h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Real-time engagement tracking</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary-600 transition-colors">Daily</button>
                                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20">Weekly</button>
                            </div>
                        </div>
                        <div className="h-[350px] relative z-10">
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    barPercentage: 1,
                                    categoryPercentage: 1,
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.02)', borderColor: 'transparent' }, ticks: { font: { size: 10, weight: '900' } } },
                                        x: { grid: { display: false }, ticks: { font: { size: 10, weight: '900' } } }
                                    },
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium">
                            <h3 className="font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white text-lg">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                Work Distribution
                            </h3>
                            <div className="h-[250px] flex justify-center">
                                <Doughnut data={doughnutData} options={{ cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 25, font: { size: 11, weight: 'bold' } } } } }} />
                            </div>
                        </div>
                        <div className={`p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group ${activeOrganization?.subscription?.plan !== 'free' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-primary-600 to-indigo-700'}`}>
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                                {activeOrganization?.subscription?.plan !== 'free' ? <CheckCircle2 className="w-24 h-24 text-white" /> : <Sparkles className="w-24 h-24 text-white" />}
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-8">
                                    <h3 className="text-3xl font-black text-white mb-4">
                                        {activeOrganization?.subscription?.plan !== 'free' ? 'Pro Workspace' : 'Master TaskNest'}
                                    </h3>
                                    <p className="text-primary-100 text-sm font-medium leading-relaxed opacity-90">
                                        {activeOrganization?.subscription?.plan !== 'free'
                                            ? "Your premium ecosystem is fully active. Enjoy unlimited velocity tracking and elite AI orchestration."
                                            : "Unlock advanced AI workflow automation and team velocity metrics with our Pro ecosystem."}
                                    </p>
                                </div>
                                {activeOrganization?.subscription?.plan === 'free' ? (
                                    <Link to="/settings" className="mt-auto w-full bg-white text-primary-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-center">
                                        Upgrade Workspace
                                    </Link>
                                ) : (
                                    <Link to="/analytics" className="mt-auto w-full bg-white text-emerald-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-center">
                                        View Analytics
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Stream / Activity Sidebar */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <div>
                            <h2 className="font-black flex items-center gap-3 text-slate-900 dark:text-white text-lg">
                                <Clock className="w-5 h-5 text-primary-600" />
                                Live Stream
                            </h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Organization Activity</p>
                        </div>
                        <Link to="/analytics" className="text-primary-600 text-[10px] font-black uppercase tracking-widest hover:underline bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">History</Link>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto max-h-[850px] scrollbar-hide space-y-4">
                        {stats?.activities?.length > 0 ? stats.activities.map((act) => (
                            <div key={act._id} className="flex gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 rounded-3xl transition-all cursor-pointer group">
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center font-black text-indigo-600 text-sm border-2 border-white dark:border-slate-800 shadow-md overflow-hidden">
                                        {act.actor?.avatar?.url ? <img src={act.actor.avatar.url} className="w-full h-full object-cover" /> : act.actor?.name?.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-lg flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-900 dark:text-gray-200 leading-tight">
                                        <span className="text-primary-600 italic">{act.actor?.name}</span> {act.description} <span className="underline decoration-indigo-500/30 decoration-4">{act.task?.title || act.project?.name}</span>
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{act.type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-30">
                                <Clock className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest">No activity found</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 mt-auto">
                        <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                            <span>Connected Users</span>
                            <span className="text-emerald-500">12 Online</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals */}
            <OrganizationModal isOpen={isOrgModalOpen} onClose={() => setIsOrgModalOpen(false)} />
        </div>
    )
}

export default DashboardPage
