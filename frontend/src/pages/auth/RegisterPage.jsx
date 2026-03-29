import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { register, reset } from '../../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight, Github, Zap, CheckCircle2, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import authBg from '../../assets/auth_bg.png'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const RegisterPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

    const { register: registerField, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema)
    })

    useEffect(() => {
        if (isError) toast.error(message)
        if (isSuccess) {
            toast.success('Registration successful! Please login.')
            navigate('/login')
        }
        dispatch(reset())
    }, [isError, isSuccess, message, navigate, dispatch])

    const onSubmit = (data) => {
        dispatch(register(data))
    }

    return (
        <div className="min-h-screen flex bg-white dark:bg-[#0f172a] overflow-hidden">
            {/* Left Side: Marketing & Visuals */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f172a]">
                <div className="absolute inset-0 z-0">
                    <img src={authBg} alt="Auth Background" className="w-full h-full object-cover scale-110 blur-[2px] opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] via-transparent to-primary-600/20" />
                </div>

                <div className="relative z-10 w-full p-16 flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-600/40 transform -rotate-12">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">TaskNest</h2>
                    </div>

                    <div className="mt-auto space-y-12 text-white">
                        <div className="space-y-6">
                            <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                                Start your <br />
                                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic">evolution.</span>
                            </h1>
                            <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
                                Experience the future of team orchestration. AI-driven insights, subtask automation, and multi-tenant isolation.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10 text-white">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                    <CheckCircle2 className="w-3 h-3" /> Infinite
                                </div>
                                <p className="text-sm text-slate-400 font-medium">Unlimited projects and task hierarchies.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-widest">
                                    <Zap className="w-3 h-3" /> Velocity
                                </div>
                                <p className="text-sm text-slate-400 font-medium">Track team output with AI metrics.</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-4 max-w-sm">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-white">
                                ISO-27001 Certified Environment
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 xl:p-24 relative overflow-y-auto bg-slate-50 dark:bg-[#0f172a]">
                <div className="absolute top-10 right-10 lg:hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter">TaskNest</h2>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-10"
                >
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Join the Fleet</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Create your credentials to launch the hub.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 ml-1">Universal Identity</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    {...registerField('name')}
                                    type="text"
                                    placeholder="Full Name (e.g. Commander Shepherd)"
                                    className={`w-full pl-11 pr-4 py-4 bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-bold placeholder:font-medium ${errors.name ? 'border-red-500/50' : ''}`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 ml-1">Email Terminal</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    {...registerField('email')}
                                    type="email"
                                    placeholder="personal@nebula.com"
                                    className={`w-full pl-11 pr-4 py-4 bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-bold placeholder:font-medium ${errors.email ? 'border-red-500/50' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 ml-1">Encryption Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    {...registerField('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-4 py-4 bg-white dark:bg-white/[0.03] border-2 border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-bold placeholder:font-medium ${errors.password ? 'border-red-500/50' : ''}`}
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-emerald-600 text-white rounded-2xl py-4 text-sm font-black shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    LAUNCH ACCOUNT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-white/5"></span></div>
                        <div className="relative flex justify-center"><span className="px-4 bg-slate-50 dark:bg-[#0f172a] text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Auth</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.05] transition-all active:scale-95 shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.2-1.92 4.2-1.2 1.2-3.08 2.4-7.84 2.4-7.52 0-13.44-6.12-13.44-13.6s5.92-13.6 13.44-13.6c4.04 0 7.04 1.56 9.32 3.72l2.32-2.32c-2.48-2.36-5.88-4.2-11.64-4.2-10 0-18.4 8.12-18.4 18.2s8.4 18.2 18.4 18.2c5.44 0 9.56-1.8 12.84-5.2 3.4-3.4 4.52-8.32 4.52-12.32 0-.96-.08-1.92-.24-2.8h-17.16z" /></svg>
                            GOOGLE
                        </button>
                        <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.05] transition-all active:scale-95 shadow-sm">
                            <Github className="w-5 h-5" />
                            GITHUB
                        </button>
                    </div>

                    <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Returning Fleet? <Link to="/login" className="text-primary-600 hover:underline decoration-2 ml-1">Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default RegisterPage

