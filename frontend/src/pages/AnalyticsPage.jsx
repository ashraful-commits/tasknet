import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts'
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Users,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Zap,
    Target as TargetIcon,
    Briefcase,
    BrainCircuit
} from 'lucide-react'
import { getOrgTasks } from '../store/slices/taskSlice'

const InsightMetric = ({ label, value, subtext, icon: Icon, color }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium relative overflow-hidden group"
    >
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-1000 ${color}`} />
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{value}</h3>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-xs text-slate-500 mt-4 font-medium italic opacity-70">"{subtext}"</p>
    </motion.div>
)

const AnalyticsPage = () => {
    const dispatch = useDispatch()
    const { activeOrganization } = useSelector((state) => state.orgs)
    const { tasks } = useSelector((state) => state.tasks)
    const { token } = useSelector((state) => state.auth)

    const [loadingAI, setLoadingAI] = useState(false)
    const [aiInsights, setAiInsights] = useState(null)

    useEffect(() => {
        if (activeOrganization) {
            dispatch(getOrgTasks(activeOrganization._id))
        }
    }, [dispatch, activeOrganization])

    const handleFetchAIInsights = async () => {
        if (!tasks.length) return toast.error('No tasks available for analysis')
        setLoadingAI(true)
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const res = await axios.post('/api/v1/ai/project-insights', { tasks }, config)
            if (res.data.success) {
                setAiInsights(res.data.data)
                toast.success('Strategy generated!')
            }
        } catch (e) {
            toast.error('AI Strategy service is offline')
        } finally {
            setLoadingAI(false)
        }
    }

    // Derived Data
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completedAt).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length

    const chartData = [
        { name: 'Total', value: totalTasks },
        { name: 'Completed', value: completedTasks },
        { name: 'Urgent', value: urgentTasks },
    ]

    const memberLeaderboard = activeOrganization?.members?.map(m => {
        const memberTasks = tasks.filter(t => t.assignees.includes(m.user?._id))
        const completed = memberTasks.filter(t => t.completedAt).length
        const score = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0
        return {
            name: m.user?.name || 'Unknown',
            role: m.role,
            score,
            initials: m.user?.name?.split(' ').map(n => n[0]).join('') || '?',
            color: 'bg-primary-500'
        }
    }).sort((a, b) => b.score - a.score).slice(0, 5) || []

    return (
        <div className="space-y-12 animate-fade-in relative z-10">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                        <TrendingUp className="w-3 h-3" /> System Intelligence
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Visual <span className="bg-gradient-to-r from-indigo-600 to-primary-600 bg-clip-text text-transparent">Insights</span> Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
                        Data-driven analytics for {activeOrganization?.name || 'your workspace'}. Monitor team velocity, bottleneck trends, and ROI metrics.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            const reportData = {
                                organization: activeOrganization?.name,
                                timestamp: new Date().toISOString(),
                                metrics: {
                                    totalTasks,
                                    completedTasks,
                                    completionRate,
                                    urgentTasks
                                },
                                leaderboard: memberLeaderboard
                            };
                            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `analytics-report-${activeOrganization?.name || 'workspace'}.json`;
                            link.click();
                            toast.success('Analytics report exported!');
                        }}
                        className="px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary-600 rounded-[2rem] text-sm font-black shadow-premium transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Activity className="w-5 h-5" />
                        Export Report
                    </button>
                    <button
                        onClick={handleFetchAIInsights}
                        disabled={loadingAI}
                        className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-[2rem] text-sm font-black shadow-2xl shadow-primary-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group disabled:opacity-50"
                    >
                        {loadingAI ? <Activity className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        Generate AI Strategy
                    </button>
                </div>
            </div>

            {aiInsights && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 bg-[#0f172a] border border-white/10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-10"><BrainCircuit className="w-48 h-48" /></div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-primary-400 mb-6 flex items-center gap-3">
                        <Sparkles className="w-5 h-5" /> Executive Intelligence Summary
                    </h2>
                    <div className="relative z-10 text-slate-300 leading-relaxed font-medium markdown-viewer">
                        <div className="whitespace-pre-wrap">{aiInsights}</div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <InsightMetric label="Completion Rate" value={`${completionRate}%`} subtext="Overall organization progress" icon={Zap} color="bg-indigo-600" />
                <InsightMetric label="Total Tasks" value={totalTasks} subtext="System workload volume" icon={CheckCircle2} color="bg-primary-600" />
                <InsightMetric label="Urgent Items" value={urgentTasks} subtext="Critical attention required" icon={TargetIcon} color="bg-rose-600" />
                <InsightMetric label="Active Members" value={activeOrganization?.members?.length || 0} subtext="Team collaboration size" icon={Users} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-10">
                <div className="2xl:col-span-2 space-y-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium h-[500px]">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-10">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                            Workload Distribution
                        </h2>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#ef4444'][index % 3]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Team Leaderboard
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {memberLeaderboard.length > 0 ? memberLeaderboard.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-5 p-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-all border-2 border-transparent">
                                <div className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center text-sm font-black text-white shadow-lg`}>
                                    {m.initials}
                                </div>
                                <div className="flex-1 overflow-hidden text-left">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</h4>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.role}</span>
                                    <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${m.color}`} style={{ width: `${m.score}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-indigo-600">{m.score}%</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-30">
                                <Users className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
