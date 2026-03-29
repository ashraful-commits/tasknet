import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getProjects } from '../store/slices/projectSlice'
import { getOrganizations } from '../store/slices/orgSlice'
import ProjectModal from '../components/ProjectModal'
import {
    Briefcase,
    Plus,
    MoreVertical,
    Users,
    CheckCircle2,
    Clock,
    ChevronRight,
    TrendingUp,
    LayoutGrid,
    Filter,
    Search,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'

const ProjectCard = ({ project }) => (
    <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium hover:shadow-2xl hover:shadow-primary-600/10 transition-all duration-300 flex flex-col h-full"
    >
        <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600/10 dark:bg-primary-950/20 rounded-xl flex items-center justify-center border border-primary-100 dark:border-primary-900/30">
                        <span className="text-xl font-black text-primary-600">
                            {project.name?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {project.name}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {project.visibility}
                        </span>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                {project.description || 'No description provided.'}
            </p>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-primary-600">{project.progress || 0}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        className="h-full bg-primary-600 rounded-full"
                    />
                </div>
            </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 mt-auto flex items-center justify-between rounded-b-2xl">
            <div className="flex items-center -space-x-2">
                {project.members?.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-50 dark:border-slate-900 bg-primary-600 flex items-center justify-center text-[9px] font-black text-white uppercase overflow-hidden">
                        {m.user?.avatar?.url ? <img src={m.user.avatar.url} className="w-full h-full object-cover" /> : m.user?.name?.charAt(0)}
                    </div>
                ))}
                {project.members?.length > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-slate-50 dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-500">
                        +{project.members.length - 3}
                    </div>
                )}
            </div>
            <Link
                to={`/projects/${project._id}`}
                className="text-xs font-bold text-slate-400 hover:text-primary-600 flex items-center gap-1 transition-colors group/link"
            >
                View Board
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
        </div>
    </motion.div>
)

const ProjectsPage = () => {
    const dispatch = useDispatch()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { projects, isLoading } = useSelector((state) => state.projects)
    const { activeOrganization, isLoading: orgLoading } = useSelector((state) => state.orgs)

    useEffect(() => {
        dispatch(getOrganizations())
    }, [dispatch])

    useEffect(() => {
        if (activeOrganization) {
            dispatch(getProjects(activeOrganization._id))
        }
    }, [dispatch, activeOrganization])

    return (
        <div className="space-y-8 animate-fade-in relative z-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Projects Repository</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {activeOrganization ? `Active workspaces for ${activeOrganization.name}` : 'Manage and track your organization\'s active workspaces.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                        <LayoutGrid className="w-4 h-4" /> Cards
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Create Project
                    </button>
                </div>
            </div>

            {/* Filters/Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative z-20">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 transition-all">
                        <Filter className="w-4 h-4" /> All Projects
                    </button>
                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
                    <button className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-bold text-slate-400 transition-all">Archived</button>
                </div>
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            {isLoading || orgLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-premium">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Build your first project</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-medium">Create a workspace to start organizing your tasks, collaborating with your team and using AI assistance.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all active:scale-95"
                    >
                        + Start New Project
                    </button>
                </div>
            )}

            <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export default ProjectsPage
