import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc] dark:bg-[#0f172a]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <span className="text-[120px] font-black text-primary-600/20 leading-none">404</span>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4">Lost in the Nest?</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8 text-lg">
                    The page you're looking for doesn't exist or has been moved to a different branch.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default NotFoundPage
