import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getProject } from '../store/slices/projectSlice'
import { getTasks, reorderTasks, optimisticReorder } from '../store/slices/taskSlice'
import TaskModal from '../components/TaskModal'
import {
    Plus,
    MoreVertical,
    Calendar,
    Users,
    CheckSquare,
    Clock,
    LayoutGrid,
    List,
    Table2,
    ChevronRight,
    Sparkles,
    Briefcase,
    Activity,
    AlertCircle,
    CheckCircle2,
    Target,
    TrendingUp,
    Download,
    Zap,
    GitBranch,
    X
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import axios from 'axios'

// ─── Priority Styles Helper ────────────────────────────────────────
const priorityStyles = {
    urgent: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
    high: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
    medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    low: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30',
    none: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}
const getPriority = (p) => priorityStyles[p] || priorityStyles.none

// ─── Assignee Avatars ──────────────────────────────────────────────
const AssigneeStack = ({ assignees = [], size = 'sm' }) => {
    const dim = size === 'sm' ? 'w-6 h-6 text-[7px]' : 'w-8 h-8 text-[10px]'
    if (!assignees.length) return (
        <div className={`${dim} rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400`}>?</div>
    )
    return (
        <div className="flex -space-x-1.5">
            {assignees.slice(0, 4).map((a, i) => (
                <div key={i} className={`${dim} rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center font-black text-white uppercase overflow-hidden shadow-sm`}>
                    {a.avatar?.url ? <img src={a.avatar.url} alt={a.name} className="w-full h-full object-cover" /> : a.name?.charAt(0)}
                </div>
            ))}
            {assignees.length > 4 && (
                <div className={`${dim} rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-300`}>
                    +{assignees.length - 4}
                </div>
            )}
        </div>
    )
}

// ─── Kanban Task Card ──────────────────────────────────────────────
const TaskCard = ({ task, innerRef, draggableProps, dragHandleProps, onEdit }) => (
    <div
        ref={innerRef}
        {...draggableProps}
        {...dragHandleProps}
        onClick={() => onEdit(task)}
        className="group bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-200 mb-3 cursor-pointer backdrop-blur-sm"
    >
        <div className="flex justify-between items-start mb-3">
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${getPriority(task.priority)}`}>
                {task.priority || 'No Priority'}
            </span>
            <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                <MoreVertical className="w-3 h-3 text-slate-400" />
            </button>
        </div>

        <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {task.title}
        </h4>

        {task.subtasks?.length > 0 && (
            <div className="mb-3">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>Subtasks</span>
                    <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                    />
                </div>
            </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <CheckSquare className="w-3 h-3" />
                    <span>{task.subtasks?.length || 0}</span>
                </div>
                {task.dueDate && (
                    <div className={`flex items-center gap-1 text-[10px] font-medium ${new Date(task.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-400'}`}>
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>
            <AssigneeStack assignees={task.assignees} size="sm" />
        </div>
    </div>
)

// ─── LIST VIEW ─────────────────────────────────────────────────────
const TasksListView = ({ tasks, onEdit }) => (
    <div className="space-y-3">
        {tasks.length === 0 ? (
            <div className="py-24 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <List className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No tasks yet</p>
            </div>
        ) : tasks.map((task, i) => (
            <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onEdit(task)}
                className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800/50 transition-all flex items-center gap-5 cursor-pointer"
            >
                <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${task.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {task.status === 'done'
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        : <Activity className="w-5 h-5 text-primary-400" />
                    }
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                        <h4 className={`text-sm font-bold truncate group-hover:text-primary-600 transition-colors ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                        </h4>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getPriority(task.priority)}`}>
                            {task.priority || 'none'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">{task.description || 'No description'}</p>
                </div>

                <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    {task.subtasks?.length > 0 && (
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Progress</p>
                            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500" style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }} />
                            </div>
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Due</p>
                        <p className={`text-xs font-bold ${task.dueDate && new Date(task.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}
                        </p>
                    </div>
                    <AssigneeStack assignees={task.assignees} size="sm" />
                </div>
            </motion.div>
        ))}
    </div>
)

// ─── TABLE VIEW ────────────────────────────────────────────────────
const TasksTableView = ({ tasks, onEdit }) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    {['Task', 'Status', 'Priority', 'Assignees', 'Due Date', 'Progress'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {tasks.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-sm">No tasks found</td></tr>
                ) : tasks.map((task, i) => (
                    <motion.tr
                        key={task._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => onEdit(task)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                        <td className="px-6 py-4 max-w-xs">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{task.title}</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${task.status === 'done' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {task.status?.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getPriority(task.priority)}`}>{task.priority || 'none'}</span>
                        </td>
                        <td className="px-6 py-4">
                            <AssigneeStack assignees={task.assignees} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-xs font-semibold ${task.dueDate && new Date(task.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            {task.subtasks?.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500" style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold">{Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%</span>
                                </div>
                            ) : <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>}
                        </td>
                    </motion.tr>
                ))}
            </tbody>
        </table>
    </div>
)

// ─── TIMELINE VIEW ─────────────────────────────────────────────────
const TasksTimelineView = ({ tasks, onEdit }) => {
    const sorted = [...tasks].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
    if (!sorted.length) return (
        <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No tasks to display</p>
        </div>
    )
    return (
        <div className="relative pl-10 py-2">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-indigo-500 to-transparent rounded-full" />
            <div className="space-y-6">
                {sorted.map((task, i) => (
                    <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative"
                    >
                        <div className="absolute -left-[26px] top-5 w-4 h-4 bg-white dark:bg-slate-950 border-2 border-primary-500 rounded-full shadow-lg shadow-primary-500/20 group-hover:scale-125 transition-transform" />
                        <div
                            onClick={() => onEdit(task)}
                            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800/50 transition-all cursor-pointer flex items-start gap-6"
                        >
                            <div className="hidden sm:flex flex-col items-center justify-center w-14 flex-shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl py-3">
                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {task.dueDate ? new Date(task.dueDate).getDate() : '?'}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleString('default', { month: 'short' }) : 'None'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                                        {task.title}
                                    </h4>
                                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${task.status === 'done' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30'}`}>
                                        {task.status?.replace('_', ' ')}
                                    </span>
                                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getPriority(task.priority)}`}>
                                        {task.priority || 'none'}
                                    </span>
                                </div>
                                {task.description && (
                                    <p className="text-sm text-slate-500 font-medium line-clamp-1 mb-3">{task.description}</p>
                                )}
                                <div className="flex items-center gap-4">
                                    <AssigneeStack assignees={task.assignees} size="sm" />
                                    {task.dueDate && (
                                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${new Date(task.dueDate) < new Date() ? 'text-rose-500' : 'text-slate-400'}`}>
                                            <Clock className="w-3 h-3" />
                                            {new Date(task.dueDate).toDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ─── PROJECT STATS BAR ─────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{value} {label}</span>
    </div>
)

// ─── MAIN COMPONENT ────────────────────────────────────────────────
const ProjectDetailsPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { activeProject, isLoading, isError } = useSelector((state) => state.projects)
    const { tasks } = useSelector((state) => state.tasks)

    const [view, setView] = useState('kanban')
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [activeCol, setActiveCol] = useState('todo')

    // AI Insights
    const [aiInsights, setAiInsights] = useState(null)
    const [insightsLoading, setInsightsLoading] = useState(false)
    const [isInsightsOpen, setIsInsightsOpen] = useState(false)

    useEffect(() => {
        if (id) {
            dispatch(getProject(id))
            dispatch(getTasks(id))
        }
    }, [id, dispatch])

    if (isLoading) return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-primary-500/20" />
            <p className="text-slate-400 font-bold tracking-wide animate-pulse">Synchronizing project data...</p>
        </div>
    )

    if (isError) return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Project not found</h3>
                <p className="text-slate-400 text-sm mt-2">The project you are looking for does not exist or has been archived.</p>
            </div>
        </div>
    )

    if (!activeProject) return null

    const handleCreateTask = (colId = 'todo') => {
        setSelectedTask(null)
        setActiveCol(colId)
        setIsTaskModalOpen(true)
    }

    const handleEditTask = (task) => {
        setSelectedTask(task)
        setIsTaskModalOpen(true)
    }

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        dispatch(optimisticReorder({
            taskId: draggableId,
            newColumnId: destination.droppableId,
            newIndex: destination.index,
            sourceColumnId: source.droppableId,
            sourceIndex: source.index
        }))

        dispatch(reorderTasks({
            taskId: draggableId,
            newColumnId: destination.droppableId,
            newIndex: destination.index
        }))
    }

    const handleExport = () => {
        const data = tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate, assignees: t.assignees?.map(a => a.name) }))
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${activeProject.name}-tasks.json`
        link.click()
        toast.success('Tasks exported!')
    }

    const fetchInsights = async () => {
        if (!tasks.length) return toast.error('Add tasks to get AI insights')
        setInsightsLoading(true)
        setIsInsightsOpen(true)
        try {
            const res = await axios.post('/api/v1/ai/project-insights', { tasks }, { headers: { Authorization: `Bearer ${token}` } })
            setAiInsights(res.data.data)
        } catch (e) {
            toast.error(e.response?.data?.message || 'AI service currently offline. Check your GOOGLE_AI_KEY.')
            setIsInsightsOpen(false)
        } finally {
            setInsightsLoading(false)
        }
    }

    const renderView = () => {
        switch (view) {
            case 'list': return <TasksListView tasks={tasks} onEdit={handleEditTask} />
            case 'table': return <TasksTableView tasks={tasks} onEdit={handleEditTask} />
            case 'timeline': return <TasksTimelineView tasks={tasks} onEdit={handleEditTask} />
            default: return (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full gap-5 overflow-x-auto pb-6 scrollbar-modern">
                        {activeProject.columns?.map((column) => (
                            <div key={column.id} className="flex flex-col w-[290px] flex-shrink-0">
                                <div className="flex items-center justify-between px-1 mb-3 group/col">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{column.name}</h3>
                                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-400">{tasks.filter(t => t.columnId === column.id).length}</span>
                                    </div>
                                    <button className="p-1 opacity-0 group-hover/col:opacity-100 text-slate-400 hover:text-slate-600 transition-all"><MoreVertical className="w-3.5 h-3.5" /></button>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 rounded-2xl p-2 transition-all duration-200 overflow-y-auto scrollbar-hide ${snapshot.isDraggingOver ? 'bg-primary-50/60 dark:bg-primary-950/20 ring-2 ring-primary-400/30 ring-inset' : 'bg-slate-50/50 dark:bg-slate-900/40'}`}
                                            style={{ minHeight: 220 }}
                                        >
                                            {tasks.filter(t => t.columnId === column.id).map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                                    {(provided) => (
                                                        <TaskCard
                                                            task={task}
                                                            onEdit={handleEditTask}
                                                            innerRef={provided.innerRef}
                                                            draggableProps={provided.draggableProps}
                                                            dragHandleProps={provided.dragHandleProps}
                                                        />
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            <button
                                                onClick={() => handleCreateTask(column.id)}
                                                className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add Task
                                            </button>
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}

                        <div className="flex-shrink-0 w-72">
                            <div className="bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 p-6 rounded-3xl shadow-2xl shadow-primary-500/20 text-white relative overflow-hidden group h-full min-h-[200px]">
                                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 blur-3xl rounded-full group-hover:scale-125 transition-transform duration-700" />
                                <div className="absolute bottom-0 left-0 w-28 h-28 bg-violet-500/20 blur-2xl rounded-full" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-100">AI Assistant</span>
                                    </div>
                                    <h3 className="text-lg font-black leading-tight mb-3">Optimize your sprint velocity</h3>
                                    <p className="text-sm text-primary-100 mb-6 leading-relaxed opacity-90">
                                        Based on your workload, <span className="font-black text-white underline decoration-white/40">{tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length} tasks</span> are at risk of missing their deadlines.
                                    </p>
                                    <button
                                        onClick={fetchInsights}
                                        className="w-full bg-white/90 hover:bg-white text-primary-700 py-2.5 rounded-2xl text-sm font-black shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" /> View Suggestions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DragDropContext>
            )
        }
    }

    const viewBtns = [
        { id: 'kanban', label: 'Board', Icon: LayoutGrid },
        { id: 'list', label: 'List', Icon: List },
        { id: 'table', label: 'Table', Icon: Table2 },
        { id: 'timeline', label: 'Timeline', Icon: GitBranch },
    ]

    const totalTasks = tasks.length
    const doneTasks = tasks.filter(t => t.status === 'done').length
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const urgentTasks = tasks.filter(t => t.priority === 'urgent').length
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in relative z-10">
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <Briefcase className="w-3 h-3" />
                    <span>Projects</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 dark:text-slate-300">{activeProject.name}</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                {activeProject.name}
                            </h1>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl ${activeProject.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                                activeProject.status === 'completed' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' :
                                    'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                }`}>
                                {activeProject.status || 'Active'}
                            </span>
                        </div>
                        {activeProject.description && (
                            <p className="text-sm font-medium text-slate-500 max-w-2xl line-clamp-2">{activeProject.description}</p>
                        )}
                        <div className="flex items-center gap-3 max-w-sm">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="text-xs font-black text-slate-900 dark:text-white">{progress}%</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatPill icon={CheckCircle2} label="Done" value={doneTasks} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" />
                            <StatPill icon={Target} label="Total" value={totalTasks} color="bg-primary-50 text-primary-600 dark:bg-primary-900/20" />
                            {urgentTasks > 0 && <StatPill icon={Zap} label="Urgent" value={urgentTasks} color="bg-rose-50 text-rose-600 dark:bg-rose-900/20" />}
                            {overdue > 0 && <StatPill icon={AlertCircle} label="Overdue" value={overdue} color="bg-orange-50 text-orange-600 dark:bg-orange-900/20" />}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 gap-0.5">
                            {viewBtns.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setView(id)}
                                    title={label}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${view === id ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleExport}
                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary-600 rounded-xl transition-all shadow-sm group"
                            title="Export JSON"
                        >
                            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={() => handleCreateTask()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/25 hover:bg-primary-700 active:scale-95 transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            <span className="hidden sm:inline">New Task</span>
                        </button>
                    </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800" />
            </div>

            <div className="flex-1 min-h-0 overflow-auto pb-10">
                {renderView()}
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                projectId={id}
                task={selectedTask}
                columnId={activeCol}
                customFieldDefinitions={activeProject.customFields}
            />

            <AnimatePresence>
                {isInsightsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInsightsOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/10 rounded-2xl"><Sparkles className="w-6 h-6" /></div>
                                        <div>
                                            <h3 className="text-xl font-black">AI Strategy Analysis</h3>
                                            <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest">Optimizing {activeProject.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsInsightsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                                {insightsLoading ? (
                                    <div className="py-20 flex flex-col items-center gap-4 text-center">
                                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Gemini AI is analyzing project data...</p>
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium">
                                        <div dangerouslySetInnerHTML={{ __html: aiInsights?.replace(/\n/g, '<br/>') }} />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button onClick={() => setIsInsightsOpen(false)} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm active:scale-95 transition-all">Got it</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProjectDetailsPage
