import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layout, Type, FileText, Globe, Lock, Code, Layers, Sparkles } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { createProject } from '../store/slices/projectSlice'
import { toast } from 'react-hot-toast'

const ProjectModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const { activeOrganization } = useSelector((state) => state.orgs)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        template: 'software',
        visibility: 'private'
    })

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name) return toast.error('Project name is required')
        if (!activeOrganization) return toast.error('Please select an organization first')

        const resultAction = await dispatch(createProject({ ...formData, organization: activeOrganization._id }))
        if (createProject.fulfilled.match(resultAction)) {
            toast.success('Project created successfully!')
            onClose()
        } else {
            toast.error(resultAction.payload || 'Failed to create project')
        }
    }

    const templates = [
        { id: 'software', name: 'Software Dev', icon: Code, desc: 'Agile columns with Backlog/Review' },
        { id: 'marketing', name: 'Marketing', icon: Globe, desc: 'Creative workflow optimization' },
        { id: 'blank', name: 'Blank Project', icon: Layout, desc: 'Simple Todo/InProgress/Done' }
    ]

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                                <Layout className="w-5 h-5 text-primary-600" />
                            </div>
                            <h2 className="text-xl font-bold dark:text-white">New Project</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block ml-1">Project Name</label>
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Design Redesign"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block ml-1">Description</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="What is this project about?"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm resize-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 block ml-1">Visibility</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visibility: 'private' })}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.visibility === 'private' ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <Lock className="w-4 h-4" />
                                            <span className="text-sm font-bold">Private</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, visibility: 'public' })}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.visibility === 'public' ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span className="text-sm font-bold">Public</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block ml-1">Project Template</label>
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, template: tpl.id })}
                                        className={`w-full flex items-start text-left gap-4 p-4 rounded-2xl border-2 transition-all group ${formData.template === tpl.id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.template === tpl.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-primary-500'}`}>
                                            <tpl.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${formData.template === tpl.id ? 'text-primary-600' : 'text-slate-900 dark:text-white'}`}>{tpl.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{tpl.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Build Project
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default ProjectModal
