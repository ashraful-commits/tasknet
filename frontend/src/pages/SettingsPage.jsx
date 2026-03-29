import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
    User, Bell, Shield, Palette, Globe, CreditCard, Mail,
    Phone, Briefcase, Lock, Eye, EyeOff, Loader2, Save,
    CheckCircle2, AlertTriangle, Trash2, Building2,
    Languages, Clock, Check
} from 'lucide-react'
import { updateUser } from '../store/slices/authSlice'
import { getOrganizations } from '../store/slices/orgSlice'

// ─── Toggle Switch ─────────────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
)

// ─── Section Wrapper ───────────────────────────────────────────────
const Section = ({ title, description, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>
            </div>
        </div>
        <div className="p-6 space-y-6">{children}</div>
    </div>
)

// ─── Input ─────────────────────────────────────────────────────────
const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, readOnly, extra }) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    return (
        <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />}
                <input
                    type={isPassword && show ? 'text' : type}
                    value={value}
                    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {extra && <p className="text-[11px] text-slate-400 mt-1 font-medium">{extra}</p>}
        </div>
    )
}

// ─── Notification Row ──────────────────────────────────────────────
const NotifRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
            <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
)

// ─── Plan Card ─────────────────────────────────────────────────────
const PlanCard = ({ plan, current, onSelect, loading }) => (
    <div className={`relative p-6 rounded-2xl border-2 transition-all ${current ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
        {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary-600/30">Popular</span>}
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
            <span className="text-xs text-slate-400 font-bold">/mo</span>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">{plan.desc}</p>
        <button
            onClick={() => onSelect(plan.id)}
            disabled={current || loading}
            className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${current ? 'bg-emerald-500 text-white cursor-default' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600'}`}
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : current ? '✓ Current Plan' : 'Select'}
        </button>
    </div>
)

// ─── MAIN COMPONENT ────────────────────────────────────────────────
const SettingsPage = () => {
    const dispatch = useDispatch()
    const { user, token } = useSelector(s => s.auth)
    const { activeOrganization } = useSelector(s => s.orgs)

    // Profile form
    const [profile, setProfile] = useState({
        name: user?.name || '', jobTitle: user?.jobTitle || '',
        phone: user?.phone || '', bio: user?.bio || '',
    })
    const [savingProfile, setSavingProfile] = useState(false)

    // Password form
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
    const [savingPass, setSavingPass] = useState(false)

    // Notifications
    const [notifs, setNotifs] = useState({
        taskAssigned: user?.notificationPreferences?.inApp?.taskAssignment ?? true,
        comments: user?.notificationPreferences?.inApp?.comments ?? true,
        dueDateReminders: user?.notificationPreferences?.email?.dueDateReminders ?? true,
        projectUpdates: user?.notificationPreferences?.email?.projectUpdates ?? true,
        weeklyDigest: user?.notificationPreferences?.email?.weeklyDigest ?? false,
    })
    const [savingNotifs, setSavingNotifs] = useState(false)

    // Theme — read current from localStorage
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')

    const applyTheme = (value) => {
        const root = document.documentElement
        if (value === 'dark') {
            root.classList.add('dark')
        } else if (value === 'light') {
            root.classList.remove('dark')
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.classList.toggle('dark', prefersDark)
        }
        localStorage.setItem('theme', value)
        setTheme(value)
        toast.success(`Theme set to ${value}`)
    }

    // Plan
    const [planLoading, setPlanLoading] = useState(null)

    // Handle Stripe redirect back
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const upgrade = params.get('upgrade')
        const plan = params.get('plan')
        if (upgrade === 'success' && plan) {
            toast.success(`🎉 You're now on the ${plan.toUpperCase()} plan!`)
            dispatch(getOrganizations())
            window.history.replaceState({}, '', '/settings')
        } else if (upgrade === 'cancelled') {
            toast('Upgrade cancelled.', { icon: 'ℹ️' })
            window.history.replaceState({}, '', '/settings')
        }
    }, [])

    // Delete
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleteText, setDeleteText] = useState('')

    const setP = (k) => (v) => setProfile(p => ({ ...p, [k]: v }))
    const setPw = (k) => (v) => setPasswords(p => ({ ...p, [k]: v }))
    const setN = (k) => (v) => setNotifs(p => ({ ...p, [k]: v }))

    // Re-fetch orgs on mount to ensure fresh state
    useEffect(() => {
        dispatch(getOrganizations())
    }, [dispatch])

    const saveProfile = async () => {
        setSavingProfile(true)
        try {
            const res = await axios.put('/api/v1/users/profile', profile, { headers: { Authorization: `Bearer ${token}` } })
            if (res.data.success) {
                dispatch(updateUser(res.data.data))
                toast.success('Profile saved!')
            }
        } catch { toast.error('Could not save profile') }
        finally { setSavingProfile(false) }
    }

    const savePassword = async () => {
        if (!passwords.current) return toast.error('Enter your current password')
        if (passwords.newPass.length < 8) return toast.error('New password must be 8+ characters')
        if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match')
        setSavingPass(true)
        try {
            await axios.put('/api/v1/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.newPass,
            }, { headers: { Authorization: `Bearer ${token}` } })
            toast.success('Password updated!')
            setPasswords({ current: '', newPass: '', confirm: '' })
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to change password') }
        finally { setSavingPass(false) }
    }

    const saveNotifs = async () => {
        setSavingNotifs(true)
        try {
            const res = await axios.put('/api/v1/users/notifications', {
                inApp: { taskAssignment: notifs.taskAssigned, comments: notifs.comments },
                email: { dueDateReminders: notifs.dueDateReminders, projectUpdates: notifs.projectUpdates, weeklyDigest: notifs.weeklyDigest },
            }, { headers: { Authorization: `Bearer ${token}` } })
            dispatch(updateUser({ notificationPreferences: res.data.data }))
            toast.success('Notification preferences saved!')
        } catch { toast.error('Failed to save notification settings') }
        finally { setSavingNotifs(false) }
    }

    const selectPlan = async (planId) => {
        if (!activeOrganization) return toast.error('No active organization')
        if (activeOrganization?.subscription?.plan === planId) return
        setPlanLoading(planId)
        try {
            if (planId === 'free') {
                // Free plan: direct DB update, no payment needed
                const res = await axios.post(
                    `/api/v1/orgs/${activeOrganization._id}/subscription`,
                    { plan: planId },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                if (res.data.success) {
                    toast.success('Downgraded to Free plan.')
                    setTimeout(() => window.location.reload(), 800)
                }
            } else {
                // Pro / Enterprise: create Stripe Checkout session
                const res = await axios.post(
                    `/api/v1/orgs/${activeOrganization._id}/checkout`,
                    { plan: planId },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                if (res.data.url) {
                    window.location.href = res.data.url  // redirect to Stripe
                }
            }
        } catch (e) {
            const msg = e.response?.data?.message || 'Something went wrong'
            // Only show the Stripe setup hint for 500s or placeholder errors in dev
            if ((msg.includes('placeholder') || e.response?.status === 500) && planId !== 'free') {
                toast.error('Add your real STRIPE_SECRET_KEY and STRIPE_PRICE_PRO to .env to enable paid plans.')
            } else {
                toast.error(msg)
            }
        } finally {
            setPlanLoading(null)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteText !== 'DELETE') return toast.error('Type DELETE to confirm')
        try {
            await axios.delete('/api/v1/users/account', { headers: { Authorization: `Bearer ${token}` } })
            toast.success('Account deactivated')
            localStorage.clear()
            window.location.replace('/login')
        } catch { toast.error('Failed to delete account') }
    }

    const plans = [
        { id: 'free', name: 'Free', price: '$0', desc: 'Up to 5 members. Basic project management.', popular: false },
        { id: 'pro', name: 'Pro', price: '$12', desc: 'Up to 50 members. AI features & analytics.', popular: true },
        { id: 'enterprise', name: 'Enterprise', price: '$49', desc: 'Unlimited members. SSO, audit logs & SLA.', popular: false },
    ]

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Settings</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Manage your account, notifications, and workspace preferences.</p>
            </div>

            {/* ── PROFILE ── */}
            <Section title="Personal Profile" description="Update your personal info visible to teammates." icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={profile.name} onChange={setP('name')} icon={User} placeholder="Your name" />
                    <Input label="Email Address" value={user?.email} icon={Mail} readOnly extra="Email cannot be changed here." />
                    <Input label="Job Title" value={profile.jobTitle} onChange={setP('jobTitle')} icon={Briefcase} placeholder="e.g. Product Manager" />
                    <Input label="Phone Number" value={profile.phone} onChange={setP('phone')} icon={Phone} placeholder="+1 (555) 000-0000" type="tel" />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Bio</label>
                    <textarea
                        rows={3}
                        value={profile.bio}
                        onChange={(e) => setP('bio')(e.target.value)}
                        placeholder="Describe yourself briefly..."
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={saveProfile} disabled={savingProfile} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60">
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Profile
                    </button>
                </div>
            </Section>

            {/* ── PASSWORD ── */}
            <Section title="Change Password" description="Update your login credentials. Use a strong, unique password." icon={Lock}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Current Password" type="password" value={passwords.current} onChange={setPw('current')} icon={Lock} placeholder="••••••••" />
                    <Input label="New Password" type="password" value={passwords.newPass} onChange={setPw('newPass')} icon={Lock} placeholder="Min 8 characters" />
                    <Input label="Confirm New Password" type="password" value={passwords.confirm} onChange={setPw('confirm')} icon={Lock} placeholder="Repeat new password" />
                </div>
                <div className="flex justify-end">
                    <button onClick={savePassword} disabled={savingPass} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60">
                        {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Update Password
                    </button>
                </div>
            </Section>

            {/* ── NOTIFICATIONS ── */}
            <Section title="Notifications" description="Control which alerts you receive via email and in-app." icon={Bell}>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">In-App</p>
                    <NotifRow label="Task Assigned" desc="When a task is assigned to you" checked={notifs.taskAssigned} onChange={setN('taskAssigned')} />
                    <NotifRow label="Comments" desc="When someone comments on your tasks" checked={notifs.comments} onChange={setN('comments')} />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Email</p>
                    <NotifRow label="Due Date Reminders" desc="24-hour reminders before task deadlines" checked={notifs.dueDateReminders} onChange={setN('dueDateReminders')} />
                    <NotifRow label="Project Updates" desc="When projects are created or completed" checked={notifs.projectUpdates} onChange={setN('projectUpdates')} />
                    <NotifRow label="Weekly Digest" desc="A weekly summary of your activity" checked={notifs.weeklyDigest} onChange={setN('weeklyDigest')} />
                </div>
                <div className="flex justify-end">
                    <button onClick={saveNotifs} disabled={savingNotifs} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60">
                        {savingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                        Save Preferences
                    </button>
                </div>
            </Section>

            {/* ── APPEARANCE ── */}
            <Section title="Appearance" description="Choose how TaskNest looks for you." icon={Palette}>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { id: 'light', label: 'Light', icon: '☀️', desc: 'Bright & clean' },
                        { id: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on the eyes' },
                        { id: 'system', label: 'System', icon: '🖥️', desc: 'Match your OS' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => applyTheme(t.id)}
                            className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 text-center transition-all ${theme === t.id ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                            <span className="text-2xl">{t.icon}</span>
                            <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white">{t.label}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{t.desc}</p>
                            </div>
                            {theme === t.id && <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                        </button>
                    ))}
                </div>
            </Section>

            {/* ── SUBSCRIPTION ── */}
            {activeOrganization && (
                <Section title="Workspace Plan" description={`Current plan for ${activeOrganization.name}. Upgrade for more features.`} icon={CreditCard}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                current={activeOrganization?.subscription?.plan === plan.id}
                                onSelect={selectPlan}
                                loading={planLoading === plan.id}
                            />
                        ))}
                    </div>

                    {/* Active Payment Method & Detailed Status */}
                    {activeOrganization?.subscription?.plan !== 'free' && (
                        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Active Payment</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Your subscription is currently <span className="text-emerald-500 font-black">ACTIVE</span> via Stripe.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Next Billing</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Automatically via Card</p>
                                </div>
                                <button
                                    onClick={() => toast.success('Redirecting to Stripe Customer Portal...')}
                                    className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wide hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
                                >
                                    Manage Billing
                                </button>
                            </div>
                        </div>
                    )}
                </Section>
            )}

            {/* ── DANGER ZONE ── */}
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl p-6">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-rose-600">Danger Zone</h2>
                        <p className="text-xs text-rose-400 font-medium mt-0.5">These actions are irreversible. Proceed with extreme caution.</p>
                    </div>
                </div>

                {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black shadow-md shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all">
                        <Trash2 className="w-4 h-4" /> Delete My Account
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-rose-600">Type <span className="font-black bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">DELETE</span> to confirm account deletion:</p>
                        <div className="flex gap-3">
                            <input
                                value={deleteText}
                                onChange={e => setDeleteText(e.target.value)}
                                placeholder="Type DELETE"
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold text-rose-600 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                            <button onClick={handleDeleteAccount} disabled={deleteText !== 'DELETE'} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50">
                                Confirm
                            </button>
                            <button onClick={() => { setConfirmDelete(false); setDeleteText('') }} className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsPage
