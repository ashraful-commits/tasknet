import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Play,
    Square,
    Clock,
    Plus,
    Tag,
    Briefcase,
    Calendar,
    ChevronDown,
    MoreVertical,
    TrendingUp,
    Trash2,
    CheckCircle2,
    Zap,
    History
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getTimeEntries, startTime, stopTime } from '../store/slices/timeSlice'
import { getOrgTasks } from '../store/slices/taskSlice'

const TimeTrackingPage = () => {
    const dispatch = useDispatch()
    const { tasks } = useSelector((state) => state.tasks)
    const { projects, activeProject } = useSelector((state) => state.projects)
    const { activeOrganization } = useSelector((state) => state.orgs)
    const { entries, activeEntry, isLoading } = useSelector((state) => state.time)

    const [timer, setTimer] = useState(0)
    const [taskName, setTaskName] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState('')
    const taskNameRef = useRef('')

    useEffect(() => {
        dispatch(getTimeEntries())
        if (activeOrganization) {
            dispatch(getOrgTasks(activeOrganization._id))
        }
    }, [dispatch, activeOrganization])

    useEffect(() => {
        if (selectedTaskId) {
            const task = tasks.find(t => t._id === selectedTaskId)
            if (task) {
                setTaskName(task.title)
                taskNameRef.current = task.title
                setSelectedProjectId(task.project?._id || task.project || '')
            }
        }
    }, [selectedTaskId, tasks])

    useEffect(() => {
        let interval
        if (activeEntry) {
            const start = new Date(activeEntry.startTime).getTime()
            interval = setInterval(() => {
                const now = new Date().getTime()
                setTimer(Math.floor((now - start) / 1000))
            }, 1000)

            // Sync with running entry ONLY
            const desc = activeEntry.description || ''
            setTaskName(desc)
            taskNameRef.current = desc
            setSelectedProjectId(activeEntry.project?._id || activeEntry.project || '')
        } else {
            setTimer(0)
        }
        return () => clearInterval(interval)
    }, [activeEntry])

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleToggleTimer = () => {
        const currentTaskName = taskNameRef.current.trim()

        if (activeEntry) {
            dispatch(stopTime(activeEntry._id))
            setTaskName('')
            taskNameRef.current = ''
            toast.success('Time log saved!')
        } else {
            if (!currentTaskName) return toast.error('Enter what you are working on')
            if (!activeOrganization) return toast.error('Select an organization first')

            dispatch(startTime({
                taskName: currentTaskName,
                taskId: selectedTaskId || null,
                projectId: selectedProjectId || null,
                organizationId: activeOrganization?._id,
                isBillable: true
            }))
            toast.success('Timer started!')
        }
    }

    return (
        <div className="space-y-12 animate-fade-in relative z-10">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                        <History className="w-3 h-3" /> Velocity Metrics
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        Time <span className="bg-gradient-to-r from-rose-600 to-primary-600 bg-clip-text text-transparent">Tracker</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl text-lg leading-relaxed">
                        Track your daily focus, billable hours, and task duration with precision in {activeProject?.name || 'Workspace'}.
                    </p>
                </div>
            </div>

            {/* Active Timer Card */}
            <div className={`p-8 rounded-[3.5rem] border-4 transition-all duration-700 ${activeEntry ? 'bg-primary-600 border-primary-500 shadow-2xl shadow-primary-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-premium'}`}>
                <div className="flex flex-col lg:flex-row items-center gap-10">
                    <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-inner ${activeEntry ? 'bg-white/10 text-white' : 'bg-slate-50 dark:bg-slate-800 text-primary-600'}`}>
                        <Clock className={`w-12 h-12 ${activeEntry ? 'animate-pulse' : ''}`} />
                    </div>

                    <div className="flex-1 space-y-4 text-center lg:text-left">
                        <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${activeEntry ? 'text-primary-100' : 'text-slate-400'}`}>Current Session</p>
                        <input
                            value={taskName}
                            onChange={(e) => {
                                setTaskName(e.target.value)
                                taskNameRef.current = e.target.value
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleToggleTimer()}
                            disabled={!!activeEntry}
                            placeholder="What are you working on right now?"
                            className={`w-full bg-transparent border-none focus:outline-none text-2xl font-black placeholder:opacity-30 ${activeEntry ? 'text-white placeholder:text-white' : 'text-slate-900 dark:text-white'}`}
                        />
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <select
                                value={selectedTaskId}
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                                disabled={!!activeEntry}
                                className={`px-4 py-2 rounded-xl border text-[10px] font-black bg-transparent cursor-pointer appearance-none min-w-[150px] ${activeEntry ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                <option value="" className="text-slate-900">Select Task (Optional)</option>
                                {tasks.map(t => (
                                    <option key={t._id} value={t._id} className="text-slate-900">{t.title}</option>
                                ))}
                            </select>

                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                disabled={!!activeEntry}
                                className={`px-4 py-2 rounded-xl border text-[10px] font-black bg-transparent cursor-pointer appearance-none min-w-[150px] ${activeEntry ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                <option value="" className="text-slate-900">Select Project (Optional)</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id} className="text-slate-900">{p.name}</option>
                                ))}
                            </select>
                            <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-2 ${activeEntry ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800 text-emerald-600'}`}>
                                <Zap className="w-3 h-3" /> Billable
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className={`text-6xl font-black font-mono tracking-tighter ${activeEntry ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {formatTime(timer)}
                        </div>
                        <button
                            onClick={handleToggleTimer}
                            disabled={isLoading}
                            className={`px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${activeEntry ? 'bg-white text-primary-600 hover:bg-slate-50 shadow-xl' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/20'}`}
                        >
                            {activeEntry ? <><Square className="w-5 h-5 fill-current" /> Stop</> : <><Play className="w-5 h-5 fill-current" /> Start Focus</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 pb-20">
                <div className="xl:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <History className="w-6 h-6 text-slate-400" />
                            Recent Sessions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {!isLoading && entries.length > 0 ? entries.map((entry) => (
                            <div key={entry._id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-premium group flex flex-col md:flex-row md:items-center gap-6 hover:border-primary-500/30 transition-all">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 shadow-inner group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{entry.description || 'Focus Session'}</h4>
                                    <p className="text-sm text-slate-500 font-medium">Logged on {new Date(entry.startTime).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-left hidden sm:block">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Duration</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{formatTime(entry.isRunning ? timer : entry.duration)}</p>
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                                        <p className={`text-sm font-black ${entry.isRunning ? 'text-primary-600' : 'text-emerald-500'}`}>{entry.isRunning ? 'Running' : 'Logged'}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-30">
                                <History className="w-16 h-16 mx-auto mb-4" />
                                <p className="text-lg font-black uppercase tracking-widest">No sessions yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-premium">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">Total Productivity</p>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                                        {formatTime(entries.reduce((acc, curr) => acc + (curr.isRunning ? timer : (curr.duration || 0)), 0))}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Total Focus Time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TimeTrackingPage
