import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    Zap,
    Cpu,
    Target as TargetIcon,
    Brain,
    MessageSquare,
    ZapOff,
    ArrowRight,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    Briefcase,
    Settings,
    LayoutGrid,
    ListTodo,
    ChevronDown,
    MoreVertical,
    Send,
    Bot
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getOrgTasks } from '../store/slices/taskSlice'

const FeatureCard = ({ icon: Icon, title, description, badge, isActive }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-8 rounded-[3rem] border-2 transition-all duration-500 cursor-pointer group ${isActive ? 'bg-primary-600 border-primary-500 shadow-2xl shadow-primary-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-premium'}`}
    >
        <div className="flex justify-between items-start mb-8">
            <div className={`p-4 rounded-2xl ${isActive ? 'bg-white/10 text-white shadow-inner' : 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 shadow-sm'}`}>
                <Icon className="w-8 h-8" />
            </div>
            {badge && (
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-white text-primary-600 shadow-md' : 'bg-primary-600 text-white shadow-lg'}`}>
                    {badge}
                </span>
            )}
        </div>
        <h3 className={`text-2xl font-black mb-3 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors'}`}>
            {title}
        </h3>
        <p className={`text-sm font-medium leading-relaxed ${isActive ? 'text-primary-100 opacity-90' : 'text-slate-500'}`}>
            {description}
        </p>
    </motion.div>
)

const AIPage = () => {
    const dispatch = useDispatch()
    const { activeOrganization } = useSelector((state) => state.orgs)
    const { tasks } = useSelector((state) => state.tasks)

    const [query, setQuery] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        if (activeOrganization) {
            dispatch(getOrgTasks(activeOrganization._id))
        }
    }, [dispatch, activeOrganization])

    const handleSend = (e) => {
        e.preventDefault()
        if (!query) return
        setIsGenerating(true)
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'AI is analyzing ' + tasks.length + ' tasks in ' + activeOrganization?.name + '...',
                success: 'AI Insight generated based on your workspace!',
                error: 'AI failed to process. Try again.',
            }
        )
        setTimeout(() => {
            setIsGenerating(false)
            setQuery('')
        }, 2100)
    }

    return (
        <div className="space-y-12 animate-fade-in relative z-10 pb-20">
            {/* AI Hero Header */}
            <div className="relative p-12 bg-slate-900 dark:bg-slate-950 rounded-[4rem] text-white shadow-premium overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse animation-delay-2000"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-primary-100 text-[10px] font-black uppercase tracking-widest rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                            <Sparkles className="w-4 h-4 text-primary-400" /> Powered by GPT-4 Turbo
                        </div>
                        <h1 className="text-6xl font-black tracking-tight leading-[1.05]">
                            Work with <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Cognitive</span> Precision
                        </h1>
                        <p className="text-primary-100 text-lg font-medium opacity-80 leading-relaxed">
                            TaskNest AI is analyzing <strong>{tasks.length} tasks</strong> across <strong>{activeOrganization?.name || 'Workspace'}</strong> to predict execution bottlenecks before they happen.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 lg:w-[400px]">
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl shadow-2xl relative group hover:bg-white/10 transition-all text-left">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary-500 rounded-2xl shadow-xl shadow-primary-500/30 group-hover:rotate-12 transition-transform">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black">AI Orchestrator</h3>
                            </div>

                            <form onSubmit={handleSend} className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder={`Analyze ${activeOrganization?.name || 'Workspace'}...`}
                                        className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 resize-none transition-all placeholder:text-white/20 text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isGenerating}
                                        className="absolute bottom-4 right-4 p-3 bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-90 transition-all shadow-lg"
                                    >
                                        <Send className={`w-5 h-5 ${isGenerating ? 'animate-bounce' : ''}`} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Caps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <FeatureCard icon={Brain} title="Context Awareness" description={`AI is currently mapped to ${activeOrganization?.name}. It understands your team's specific role hierarchy and project structure.`} badge="Live" isActive={false} />
                <FeatureCard icon={Zap} title="Flow Automation" description="Automatically generates missing sub-tasks and assigns them based on individual member velocity scores." badge="Enterprise" isActive={true} />
                <FeatureCard icon={TargetIcon} title="Precision Filtering" description="AI-driven project search that understands semantic intent. Ask 'What's the riskiest task right now?'" badge="New" isActive={false} />
            </div>

            {/* AI Agents */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Settings className="w-6 h-6 text-indigo-600" />
                            Workplace Intelligence
                        </h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Autonomous worker nodes for {activeOrganization?.name}</p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    {[
                        { name: 'Velo-01', type: 'Velocity Predictor', status: 'Online', load: 32, icon: Zap },
                        { name: 'Task-Bot', type: 'Workload Balancer', status: 'Standby', load: 0, icon: LayoutGrid },
                    ].map((agent, idx) => (
                        <div key={idx} className="flex items-center gap-6 p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-pointer group/item">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary-600 shadow-sm border border-slate-200 dark:border-slate-800">
                                <agent.icon className="w-7 h-7" />
                            </div>
                            <div className="flex-1 overflow-hidden text-left">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{agent.name}</h4>
                                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">Online</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium truncate">{agent.type}</p>
                            </div>
                            <div className="text-right flex items-center gap-8">
                                <div className="w-24 px-1">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load</span>
                                        <span className="text-[10px] font-black text-slate-800 dark:text-white">{agent.load}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-600 rounded-full transition-all duration-1000" style={{ width: `${agent.load}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AIPage
