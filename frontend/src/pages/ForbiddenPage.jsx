import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

const ForbiddenPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc] dark:bg-[#0f172a]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="w-24 h-24 bg-rose-100 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/10">
                    <ShieldAlert className="w-12 h-12 text-rose-600" />
                </div>

                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium leading-relaxed">
                    Whoops! It looks like you don't have the necessary clearance to access this sector of the Nest.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        Return to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default ForbiddenPage
