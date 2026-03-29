import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Database, Activity, Search, Filter, MoreVertical, CheckCircle2, XCircle, Trash2, ArrowRight, Activity as ActivityIcon, Server, Cpu, Globe } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const AdminPage = () => {
    const { token } = useSelector((state) => state.auth)
    const [stats, setStats] = useState({ users: 0, organizations: 0, tasks: 0, uptime: 0 })
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } }
                const [statsRes, usersRes] = await Promise.all([
                    axios.get('/api/v1/admin/stats', config),
                    axios.get('/api/v1/admin/users', config)
                ])
                setStats(statsRes.data.data)
                setUsers(usersRes.data.data)
            } catch (err) {
                toast.error(err.response?.data?.message || 'Access Denied: Admin privileges required')
            } finally {
                setIsLoading(false)
            }
        }
        fetchAdminData()
    }, [token])

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const res = await axios.put(`/api/v1/admin/users/${userId}`, { systemRole: newRole }, config)
            if (res.data.success) {
                toast.success('System role updated successfully')
                setUsers(users.map(u => u._id === userId ? { ...u, systemRole: newRole } : u))
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role. Superadmin required.')
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Initialising Admin Matrix...</p>
        </div>
    )

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-rose-600" />
                        System Administration
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage global users, organizational health and system metrics.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="px-4 py-2 text-center border-r border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Server Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Active</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 text-center">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">System Uptime</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{(stats.uptime / 3600).toFixed(1)} Hours</p>
                    </div>
                </div>
            </div>

            {/* System Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Organizations', value: stats.organizations, icon: Globe, color: 'text-primary-600', bg: 'bg-primary-50' },
                    { label: 'Project Tasks', value: stats.tasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'System Load', value: '4.2%', icon: ActivityIcon, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-premium group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 ${stat.bg} dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+12% vs last mo</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-60 text-[10px]">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* User Management Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-premium overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">User Directory</h2>
                            <p className="text-sm font-medium text-slate-500">Review system access levels and account status across all tenants.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search global users..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                            <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Identity</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">System Role</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Joined Date</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-slate-500">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs">
                                        <select
                                            value={user.systemRole}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="bg-transparent border-none font-bold text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer capitalize"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Superadmin</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <p className="text-xs font-bold text-slate-500">{new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/20'}`}>
                                            {user.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-20 text-center">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-400">No users matched your criteria</h3>
                        <button onClick={() => setSearchQuery('')} className="text-primary-600 text-xs font-black uppercase tracking-widest mt-2">Clear Search</button>
                    </div>
                )}
            </div>

            {/* System Health Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
                    <div className="flex items-center gap-3">
                        <Server className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-xl font-bold">Node.js Main Cluster</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                            <span>API Threads Status</span>
                            <span className="text-emerald-400">Stable</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full w-[85%]"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mem Usage</p>
                            <p className="text-xl font-black mt-1">2.4 GB</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Requests/sec</p>
                            <p className="text-xl font-black mt-1">112 req</p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white space-y-6">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-indigo-200" />
                        <h3 className="text-xl font-bold">MongoDB Database</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-200/50">
                            <span>Storage Index Efficiency</span>
                            <span className="text-indigo-200">Optimal</span>
                        </div>
                        <div className="w-full bg-primary-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-300 h-full w-[94%]"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary-700 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-200/50 uppercase tracking-widest">Collections</p>
                            <p className="text-xl font-black mt-1">14</p>
                        </div>
                        <div className="bg-primary-700 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-200/50 uppercase tracking-widest">Latency</p>
                            <p className="text-xl font-black mt-1">14 ms</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminPage
