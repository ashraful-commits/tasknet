import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Mail,
    Plus,
    MoreVertical,
    Shield,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ArrowRight,
    UserPlus,
    LogOut,
    Sparkles,
    Trash2,
    Loader2
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { canManageOrganization, ORG_ROLES } from '../utils/permissions'

const TeamMemberCard = ({ member, onRoleUpdate, onRemove, canManage }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRoleChange = async (newRole) => {
        setIsUpdating(true);
        await onRoleUpdate(member.user._id, newRole);
        setIsUpdating(false);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-premium hover:shadow-2xl transition-all group relative"
        >
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-xl font-black text-primary-600 border-2 border-white dark:border-slate-800 shadow-md">
                    {member.user?.avatar?.url ? (
                        <img src={member.user.avatar.url} alt={member.user.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        member.user?.name?.charAt(0) || 'U'
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                        {member.user?.name || 'Unknown Member'}
                    </h3>
                    {canManage && member.role !== 'owner' ? (
                        <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            disabled={isUpdating}
                            className="bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border-none focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                        >
                            {Object.values(ORG_ROLES).map(role => (
                                <option key={role} value={role}>{role.replace('_', ' ')}</option>
                            ))}
                        </select>
                    ) : (
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${member.role === 'owner' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40' : member.role === 'admin' ? 'bg-primary-100 text-primary-600 dark:bg-primary-950/40' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                            {member.role || 'Member'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 font-medium truncate mb-3">{member.user?.email || 'N/A'}</p>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <Shield className={`w-3 h-3 ${member.user?.isEmailVerified ? 'text-emerald-500' : 'text-slate-300'}`} />
                        {member.user?.isEmailVerified ? 'Verified' : 'Pending'}
                    </div>
                </div>
            </div>

            {canManage && member.role !== 'owner' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onRemove(member.user._id)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </motion.div>
    )
}

const TeamPage = () => {
    const { user, token } = useSelector((state) => state.auth)
    const { activeOrganization } = useSelector((state) => state.orgs)
    const [isInviting, setIsInviting] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const canManage = canManageOrganization(user, activeOrganization)

    const handleRoleUpdate = async (userId, role) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            await axios.put(`/api/v1/orgs/${activeOrganization._id}/members/${userId}`, { role }, config)
            toast.success('Role updated successfully')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role')
        }
    }

    const handleRemove = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            await axios.delete(`/api/v1/orgs/${activeOrganization._id}/members/${userId}`, config)
            toast.success('Member removed successfully')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove member')
        }
    }

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!inviteEmail) return toast.error('Please enter an email')
        setLoading(true)
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const res = await axios.post(`/api/v1/orgs/${activeOrganization._id}/invite`, { email: inviteEmail, role: 'member' }, config)
            if (res.data.success) {
                toast.success(res.data.message)
                setInviteEmail('')
                setIsInviting(false)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invitation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 animate-fade-in relative z-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                        <Users className="w-3 h-3" /> Team Directory
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Connect your <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Collaborators</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Manage roles, invite new team members and organize permissions for better productivity in {activeOrganization?.name}.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsInviting(!isInviting)}
                        className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Invite Member
                    </button>
                </div>
            </div>

            {/* Invite Section (Collapsible) */}
            <AnimatePresence>
                {isInviting && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="p-8 bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-yellow-300" />
                                    Grow your team workspace
                                </h2>
                                <p className="text-indigo-100 text-sm font-medium mb-8 max-w-lg leading-relaxed">
                                    Invitations will grant access to all projects within the <strong>{activeOrganization?.name}</strong> organization.
                                </p>

                                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                                    <div className="flex-1 relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                                        <input
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="Enter collaborator email..."
                                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-indigo-200 focus:outline-none focus:bg-white/20 transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-4 bg-white text-indigo-700 rounded-2xl text-sm font-black shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 pb-20">
                {activeOrganization?.members?.length > 0 ? (
                    activeOrganization.members.map((member, idx) => (
                        <TeamMemberCard
                            key={member.user?._id || idx}
                            member={member}
                            onRoleUpdate={handleRoleUpdate}
                            onRemove={handleRemove}
                            canManage={canManage}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center shadow-premium">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Build your dream team</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">Start inviting members to collaborate on your projects and use the integrated AI Assistant.</p>
                        <button className="mt-8 px-10 py-4 bg-primary-600 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-primary-700 transition-all active:scale-95">
                            Send Invitations
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeamPage
