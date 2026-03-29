import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Shield, Zap, Sparkles, Globe, Users, Activity, Layout } from 'lucide-react'

const LandingPage = () => {
    const { user } = useSelector((state) => state.auth)

    if (user) return <Navigate to="/" replace />

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-primary-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic">TaskNest</span>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        {['Features', 'Solutions', 'Enterprise', 'Pricing'].map(item => (
                            <button key={item} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{item}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 text-sm font-bold hover:text-primary-500 transition-colors">Sign In</Link>
                        <Link to="/register" className="px-6 py-2.5 bg-white text-slate-950 rounded-full text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-600/20 blur-[120px] rounded-full -z-10 opacity-50"></div>

                <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary-400"
                    >
                        <Sparkles className="w-3 h-3" /> Built for Modern High-Velocity Teams
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl mx-auto"
                    >
                        Master Your Projects with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Zen Precision.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        The all-in-one workspace for high-growth organizations. Seamless task orchestration, real-time collaboration, and AI-driven project insights.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link to="/register" className="px-10 py-5 bg-primary-600 text-white rounded-2xl text-lg font-black shadow-2xl shadow-primary-600/30 hover:bg-primary-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                            Launch Your Workspace <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-black hover:bg-white/10 transition-all">
                            Book a Demo
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-32 px-6">
                <div className="max-center mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'Task Orchestration', icon: Layout, desc: 'Advanced Kanban and list views with multi-layered dependency tracking.' },
                        { title: 'AI Assistant', icon: Sparkles, desc: 'Automate priorities, estimates and descriptions with built-in Gemini intelligence.' },
                        { title: 'Team Directory', icon: Users, desc: 'Centralized workspace governance with role-based access and audit logs.' },
                        { title: 'Time Analytics', icon: Activity, desc: 'Deep insights into team velocity, billable hours and project health metrics.' },
                        { title: 'Sub-second Sync', icon: Zap, desc: 'Real-time collaboration with Socket.io—never press refresh again.' },
                        { title: 'Global Admin', icon: Shield, desc: 'Enterprise-grade security controls and multi-tenant organization isolation.' }
                    ].map((feature, idx) => (
                        <div key={idx} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/[0.08] transition-all group">
                            <div className="w-14 h-14 bg-primary-600/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                                <feature.icon className="w-7 h-7 text-primary-500" />
                            </div>
                            <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 bg-gradient-to-b from-transparent to-primary-600/10">
                <div className="max-w-5xl mx-auto p-16 bg-white text-slate-950 rounded-[3.5rem] text-center space-y-8 relative overflow-hidden shadow-2xl shadow-primary-600/20">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="w-64 h-64 text-primary-600" /></div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Ready to scale your <br /> production velocity?</h2>
                    <p className="text-slate-500 text-lg font-bold max-w-xl mx-auto">Join 1,000+ teams shipping faster with TaskNest.</p>
                    <Link to="/register" className="inline-flex px-12 py-5 bg-slate-950 text-white rounded-2xl text-lg font-black hover:scale-105 active:scale-95 transition-all gap-4">
                        Start for Free Today <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-[#01040f]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black uppercase tracking-tighter italic">TaskNest</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs font-medium">The definitive workspace for modern engineering and product teams.</p>
                    </div>
                    {['Product', 'Resources'].map(category => (
                        <div key={category} className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{category}</h4>
                            <ul className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <li key={i}><button className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Placeholder Link</button></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 flex justify-between items-center bg-gray-500">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 text-yellow-500">© 2026 TaskNest Corp. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        {['Twitter', 'GitHub', 'LinkedIn'].map(social => (
                            <button key={social} className="text-slate-600 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">{social}</button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
