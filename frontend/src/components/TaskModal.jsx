import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Type, FileText, Calendar, User, Flag, Sparkles, Send, BrainCircuit, Activity, Clock, AlertCircle, TrendingUp, Loader2, Plus, Briefcase } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createTask, updateTask } from '../store/slices/taskSlice'
import { getTaskComments, addComment } from '../store/slices/commentSlice'
import { startTime, stopTime } from '../store/slices/timeSlice'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const TaskModal = ({ isOpen, onClose, task = null, projectId, columnId, customFieldDefinitions = [] }) => {
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { activeOrganization } = useSelector((state) => state.orgs)
    const { projects } = useSelector((state) => state.projects)
    const { comments, isLoading: commentsLoading } = useSelector((state) => state.comments)
    const { activeEntry, isLoading: timeLoading } = useSelector((state) => state.time)
    const [loadingAI, setLoadingAI] = useState(false)
    const [loadingAIDesc, setLoadingAIDesc] = useState(false)
    const [selectedProject, setSelectedProject] = useState(projectId || '')
    const [commentContent, setCommentContent] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: columnId || 'todo',
        priority: 'medium',
        dueDate: '',
        assignees: [],
        subtasks: []
    })
    const [newSubtask, setNewSubtask] = useState('')

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                assignees: task.assignees || [],
                subtasks: task.subtasks || [],
                customFields: task.customFields || []
            })
            setSelectedProject(task.project?._id || task.project || '')
            dispatch(getTaskComments(task._id))
        } else {
            setFormData({
                title: '',
                description: '',
                status: columnId || 'todo',
                priority: 'medium',
                dueDate: '',
                assignees: [],
                subtasks: [],
                customFields: []
            })
            setSelectedProject(projectId || '')
        }
    }, [task, columnId, projectId, dispatch])

    if (!isOpen) return null

    const handlePredictAI = async () => {
        if (!formData.title) return toast.error('Please enter a task title first')
        setLoadingAI(true)
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.post('/api/v1/ai/suggest-priority', {
                title: formData.title,
                description: formData.description
            }, config)

            if (response.data.success) {
                const aiData = response.data.data;
                setFormData(prev => ({
                    ...prev,
                    priority: aiData.priority || prev.priority,
                }))
                toast.success('AI Priority Suggestion applied!')
            }
        } catch (error) {
            const msg = error.response?.status === 503 || error.response?.status === 500
                ? 'AI service is offline. Check your GOOGLE_AI_KEY in the backend .env'
                : 'AI Assistant is currently busy';
            toast.error(msg)
        } finally {
            setLoadingAI(false)
        }
    }

    const handleGenerateDesc = async () => {
        if (!formData.title) return toast.error('Please enter a task title first')
        setLoadingAIDesc(true)
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.post('/api/v1/ai/generate-description', {
                title: formData.title,
                context: formData.description
            }, config)

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    description: response.data.data
                }))
                toast.success('AI Description generated!')
            }
        } catch (error) {
            const msg = error.response?.status === 503 || error.response?.status === 500
                ? 'AI Generator is offline. Check your GOOGLE_AI_KEY in the backend .env'
                : 'AI Generator failed';
            toast.error(msg)
        } finally {
            setLoadingAIDesc(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title) return toast.error('Task title is required')

        let resultAction
        if (task) {
            resultAction = await dispatch(updateTask({ id: task._id, taskData: { ...formData, project: selectedProject } }))
        } else {
            if (!selectedProject) return toast.error('Please select a project')
            resultAction = await dispatch(createTask({ ...formData, project: selectedProject, columnId, organization: activeOrganization?._id }))
        }

        if (createTask.fulfilled.match(resultAction) || updateTask.fulfilled.match(resultAction)) {
            toast.success(task ? 'Task updated!' : 'Task created!')
            onClose()
        } else {
            toast.error(resultAction.payload || 'Failed to save task')
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!commentContent.trim()) return
        const resultAction = await dispatch(addComment({ content: commentContent, task: task._id }))
        if (addComment.fulfilled.match(resultAction)) {
            setCommentContent('')
        }
    }

    const handleToggleTimer = () => {
        if (!task) return

        if (activeEntry && (activeEntry.task?._id === task._id || activeEntry.task === task._id)) {
            dispatch(stopTime(activeEntry._id))
            toast.success('Timer stopped!')
        } else {
            dispatch(startTime({
                taskName: task.title,
                taskId: task._id,
                projectId: task.project?._id || task.project,
                organizationId: activeOrganization?._id,
                isBillable: true
            }))
            toast.success('Timer started for this task!')
        }
    }

    const priorities = [
        { id: 'low', name: 'Low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
        { id: 'medium', name: 'Medium', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
        { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' },
        { id: 'urgent', name: 'Urgent', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' }
    ]

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
                >
                    {/* AI Banner */}
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-2 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit className="w-16 h-16" /></div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-yellow-400" /> AI-Powered Workspace
                        </p>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between p-8">
                        <div>
                            <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                                {task ? 'Edit Task' : 'Add New Task'}
                                <div className="px-2 py-1 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-600 text-[10px] font-bold uppercase tracking-wider">Internal</div>
                            </h2>
                            <p className="text-slate-400 text-xs mt-1 font-medium">In project #{projectId?.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {task && (
                                <button
                                    type="button"
                                    onClick={handleToggleTimer}
                                    className={`p-3 rounded-2xl transition-all flex items-center gap-2 ${activeEntry && (activeEntry.task?._id === task._id || activeEntry.task === task._id) ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-primary-600 hover:text-slate-900'}`}
                                >
                                    <Clock className="w-5 h-5" />
                                    {activeEntry && (activeEntry.task?._id === task._id || activeEntry.task === task._id) && <span className="text-[10px] font-black uppercase tracking-widest">Live</span>}
                                </button>
                            )}
                            <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-1">Task Identification</label>
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            autoFocus
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Implement Socket.io handlers"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold placeholder:font-medium placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-1">Target Project</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <select
                                            disabled={!!projectId || !!task}
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select a Project</option>
                                            {projects.map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3 ml-1">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Resource Context</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handlePredictAI}
                                            disabled={loadingAI}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary-600 bg-primary-100 dark:bg-primary-900/20 px-3 py-1.5 rounded-full hover:bg-primary-200 transition-all active:scale-95"
                                        >
                                            {loadingAI ? <Loader2 className="w-3 h-3 animate-spin text-primary-600" /> : <TrendingUp className="w-3 h-3 text-primary-600" />}
                                            Suggest Priority
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDesc}
                                            disabled={loadingAIDesc}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-100 dark:bg-purple-900/20 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-all active:scale-95"
                                        >
                                            {loadingAIDesc ? <Loader2 className="w-3 h-3 animate-spin text-purple-600" /> : <Sparkles className="w-3 h-3 text-purple-600" />}
                                            AI Description
                                        </button>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the objective and deliverables..."
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Custom Fields */}
                            {customFieldDefinitions?.length > 0 && (
                                <div className="grid grid-cols-2 gap-6">
                                    {customFieldDefinitions.map((field) => (
                                        <div key={field._id}>
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-1">{field.name}</label>
                                            <div className="relative group">
                                                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                {field.type === 'select' ? (
                                                    <select
                                                        value={formData.customFields?.find(f => f.fieldId === field._id)?.value || ''}
                                                        onChange={(e) => {
                                                            const newFields = [...(formData.customFields || [])];
                                                            const idx = newFields.findIndex(f => f.fieldId === field._id);
                                                            if (idx > -1) newFields[idx].value = e.target.value;
                                                            else newFields.push({ fieldId: field._id, value: e.target.value });
                                                            setFormData({ ...formData, customFields: newFields });
                                                        }}
                                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl appearance-none text-sm font-bold cursor-pointer"
                                                    >
                                                        <option value="">Select option</option>
                                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type === 'number' ? 'number' : 'text'}
                                                        value={formData.customFields?.find(f => f.fieldId === field._id)?.value || ''}
                                                        onChange={(e) => {
                                                            const newFields = [...(formData.customFields || [])];
                                                            const idx = newFields.findIndex(f => f.fieldId === field._id);
                                                            if (idx > -1) newFields[idx].value = e.target.value;
                                                            else newFields.push({ fieldId: field._id, value: e.target.value });
                                                            setFormData({ ...formData, customFields: newFields });
                                                        }}
                                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-1">Priority Matrix</label>
                                    <div className="relative">
                                        <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl appearance-none text-sm font-bold cursor-pointer"
                                        >
                                            {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-1">Deadline</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl appearance-none text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtasks Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Subtask Evolution</label>
                            <div className="space-y-3">
                                {formData.subtasks?.map((st, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl group">
                                        <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={() => {
                                                const updated = [...formData.subtasks];
                                                updated[idx] = { ...st, completed: !st.completed };
                                                setFormData({ ...formData, subtasks: updated });
                                            }}
                                            className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                                        />
                                        <span className={`text-sm font-bold flex-1 ${st.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{st.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = formData.subtasks.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, subtasks: updated });
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="relative group">
                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newSubtask.trim()) {
                                                e.preventDefault();
                                                setFormData({
                                                    ...formData,
                                                    subtasks: [...formData.subtasks, { title: newSubtask, completed: false, id: Date.now().toString() }]
                                                });
                                                setNewSubtask('');
                                            }
                                        }}
                                        placeholder="Add a subtask and press Enter..."
                                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
                            <div className="flex -space-x-3 items-center">
                                {activeOrganization?.members?.slice(0, 4).map((m, i) => (
                                    <div key={i} title={m.user?.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0f172a] bg-primary-600 flex items-center justify-center overflow-hidden cursor-help">
                                        {m.user?.avatar?.url ? <img src={m.user.avatar.url} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-white">{m.user?.name?.charAt(0)}</span>}
                                    </div>
                                ))}
                                <button type="button" className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                                <span className="ml-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Team Available</span>
                            </div>

                            <div className="sm:ml-auto flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 sm:flex-none px-10 py-4 bg-primary-600 text-white rounded-[1.25rem] text-sm font-black shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                >
                                    {task ? 'Update' : 'Submit'}
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        {task && (
                            <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity className="w-4 h-4 text-primary-600" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Discussion Thread</h3>
                                </div>

                                <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                                    {comments.map((comment, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-500 overflow-hidden">
                                                {comment.author?.avatar?.url ? (
                                                    <img src={comment.author.avatar.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    comment.author?.name?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.author?.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 italic">No comments yet. Start the conversation!</p>}
                                </div>

                                <div className="relative group pt-4">
                                    <input
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(e)}
                                        placeholder="Write a comment..."
                                        className="w-full pl-6 pr-12 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddComment}
                                        className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </AnimatePresence >
    )
}

export default TaskModal
