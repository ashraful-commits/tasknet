import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { login, logout, updateUser } from '../store/slices/authSlice'
import {
    Camera,
    Loader2,
    Sparkles,
    User,
    Mail,
    Shield,
    CheckCircle2,
    Clock,
    Zap,
    Briefcase,
    Settings,
    LayoutDashboard,
    ArrowRight,
    TrendingUp,
    Star,
    Edit3,
    Check,
    X,
    MoreVertical,
    Calendar,
    Save,
    Award,
    MapPin,
    Globe,
    Github,
    Twitter,
    Linkedin,
    LogOut,
    Building2,
    Phone,
    Languages
} from 'lucide-react'

// ─── Avatar Component ──────────────────────────────────────────────
const AvatarUpload = ({ user, token, onUpdate }) => {
    const dispatch = useDispatch()
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef()

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB')
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const res = await axios.post('/api/v1/users/avatar', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            })
            if (res.data.success) {
                onUpdate(res.data.data)
                dispatch(updateUser({ avatar: res.data.data }))
                toast.success('Avatar updated!')
            }
        } catch {
            toast.error('Failed to upload avatar')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="relative group cursor-pointer" onClick={() => inputRef.current.click()}>
            <div className="w-32 h-32 rounded-full border-[5px] border-white dark:border-slate-950 bg-white overflow-hidden shadow-2xl">
                {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-[3px] border-white dark:border-slate-950 rounded-full flex items-center justify-center shadow-md">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    )
}

// ─── Editable Field ────────────────────────────────────────────────
const EditableField = ({ label, value, onChange, icon: Icon, placeholder, type = 'text' }) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <div className="relative group">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
        </div>
    </div>
)

// ─── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <motion.div whileHover={{ scale: 1.03, y: -2 }} className={`${bg} p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-2`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </motion.div>
)

// ─── MAIN COMPONENT ────────────────────────────────────────────────
const ProfilePage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, token } = useSelector((state) => state.auth)
    const { tasks } = useSelector((state) => state.tasks)
    const { projects } = useSelector((state) => state.projects)

    const [saving, setSaving] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar?.url || null)
    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        jobTitle: user?.jobTitle || '',
        department: user?.department || '',
        location: user?.location || '',
        phone: user?.phone || '',
        website: user?.website || '',
        language: user?.language || 'English',
        timezone: user?.timezone || 'UTC',
    })

    const setField = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }))

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await axios.put('/api/v1/users/profile', form, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                dispatch(updateUser(res.data.data))
                toast.success('Profile updated successfully!')
            }
        } catch {
            toast.error('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    // Derived stats from Redux tasks
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : 'N/A'
    const memberRole = user?.systemRole === 'superadmin' ? 'Super Admin' : user?.systemRole === 'admin' ? 'Admin' : 'Member'

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-8 animate-fade-in pb-16">

            {/* ── HERO BANNER ── */}
            <div className="relative h-56 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 shadow-2xl shadow-primary-500/20">
                {/* Abstract decoration */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-violet-500/20 blur-3xl rounded-full" />
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                        <Sparkles className="w-3 h-3" /> {memberRole}
                    </span>
                </div>
                {/* Dot pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* ── PROFILE IDENTITY ROW ── */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 px-4 md:px-0 relative z-10">
                <AvatarUpload user={{ ...user, avatar: { url: avatarUrl } }} token={token} onUpdate={(data) => setAvatarUrl(data.url)} />

                <div className="flex-1 pt-4">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{user?.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <Mail className="w-3.5 h-3.5" /> {user?.email}
                        </span>
                        {form.jobTitle && (
                            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                <Briefcase className="w-3.5 h-3.5" /> {form.jobTitle}
                            </span>
                        )}
                        {form.location && (
                            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                <MapPin className="w-3.5 h-3.5" /> {form.location}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> Joined {joinedDate}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={CheckCircle2} label="Tasks Done" value={completedTasks} color="text-emerald-500" bg="bg-white dark:bg-slate-900" />
                <StatCard icon={TrendingUp} label="Projects" value={projects?.length || 0} color="text-primary-500" bg="bg-white dark:bg-slate-900" />
                <StatCard icon={Award} label="Role" value={memberRole} color="text-amber-500" bg="bg-white dark:bg-slate-900" />
                <StatCard icon={Clock} label="Member Since" value={joinedDate.split(' ')[1] || '—'} color="text-rose-500" bg="bg-white dark:bg-slate-900" />
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Personal Info */}
                <div className="space-y-6">
                    {/* About */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-500" /> About
                        </h2>
                        <textarea
                            rows={4}
                            value={form.bio}
                            onChange={(e) => setField('bio')(e.target.value)}
                            placeholder="Tell your team a bit about yourself..."
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
                        />

                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
                                </div>
                                {user?.isEmailVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                            </div>
                            {form.phone && (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{form.phone}</p>
                                    </div>
                                </div>
                            )}
                            {form.website && (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Website</p>
                                        <a href={form.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary-600 hover:underline truncate max-w-[150px] block">{form.website}</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-around">
                            <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all">
                                <Github className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/30 text-slate-400 hover:text-sky-500 transition-all">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-400 hover:text-blue-600 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
                        <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary-500" /> Quick Actions
                        </h2>
                        <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-950/30 rounded-lg flex items-center justify-center">
                                <Settings className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors">Account Settings</span>
                        </Link>
                        <Link to="/team" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Team & Members</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all group text-left"
                        >
                            <div className="w-8 h-8 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-rose-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-rose-500 transition-colors">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT: Edit Form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Personal Info Form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-primary-500" /> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <EditableField label="Full Name" value={form.name} onChange={setField('name')} icon={User} placeholder="Your full name" />
                            <EditableField label="Job Title" value={form.jobTitle} onChange={setField('jobTitle')} icon={Briefcase} placeholder="e.g. Senior Engineer" />
                            <EditableField label="Department" value={form.department} onChange={setField('department')} icon={Building2} placeholder="e.g. Engineering" />
                            <EditableField label="Location" value={form.location} onChange={setField('location')} icon={MapPin} placeholder="City, Country" />
                            <EditableField label="Phone" value={form.phone} onChange={setField('phone')} icon={Phone} placeholder="+1 (555) 000-0000" type="tel" />
                            <EditableField label="Website" value={form.website} onChange={setField('website')} icon={Globe} placeholder="https://yoursite.com" type="url" />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary-500" /> Preferences
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Language</label>
                                <div className="relative">
                                    <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={form.language}
                                        onChange={(e) => setField('language')(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                        <option>Japanese</option>
                                        <option>Chinese</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Timezone</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={form.timezone}
                                        onChange={(e) => setField('timezone')(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        <option>UTC</option>
                                        <option>America/New_York</option>
                                        <option>America/Chicago</option>
                                        <option>America/Los_Angeles</option>
                                        <option>Europe/London</option>
                                        <option>Europe/Paris</option>
                                        <option>Asia/Tokyo</option>
                                        <option>Asia/Dhaka</option>
                                        <option>Asia/Kolkata</option>
                                        <option>Australia/Sydney</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-base font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary-500" /> Security & Account
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Email Verified</p>
                                        <p className="text-xs text-slate-400 font-medium">{user?.isEmailVerified ? 'Your email address is confirmed' : 'Please verify your email'}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user?.isEmailVerified ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                                    {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">System Role</p>
                                        <p className="text-xs text-slate-400 font-medium">Access level within the platform</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                                    {memberRole}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Change Password</p>
                                        <p className="text-xs text-slate-400 font-medium">Update your login credentials</p>
                                    </div>
                                </div>
                                <Link to="/settings" className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 transition-all shadow-sm">
                                    Update
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2.5 px-10 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-primary-600/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
