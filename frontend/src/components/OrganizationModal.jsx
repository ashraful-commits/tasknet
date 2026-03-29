import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Type, FileText, Globe, Sparkles, Send } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { createOrganization } from '../store/slices/orgSlice'
import { toast } from 'react-hot-toast'

const OrganizationModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        industry: 'Technology',
        size: '1-10'
    })

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name) return toast.error('Organization name is required')

        const resultAction = await dispatch(createOrganization(formData))
        if (createOrganization.fulfilled.match(resultAction)) {
            toast.success('Organization created!')
            onClose()
        } else {
            toast.error(resultAction.payload || 'Failed to create organization')
        }
    }

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
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black dark:text-white">Create Workspace</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">New Organization</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Org Name</label>
                                <div className="relative group">
                                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors" />
                                    <input
                                        autoFocus
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Acme Studio"
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Org Description</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 transition-colors" />
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Briefly describe your agency or team..."
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl transition-all text-sm font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Industry</label>
                                    <select
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="Technology">Technology</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Team Size</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="1-10">1-10 Members</option>
                                        <option value="11-50">11-50 Members</option>
                                        <option value="51-200">51-200 Members</option>
                                        <option value="200+">200+ Members</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                Launch Workspace
                                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default OrganizationModal
