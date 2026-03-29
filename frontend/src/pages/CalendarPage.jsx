import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Users,
    Settings,
    LayoutGrid,
    Search,
    Filter,
    ArrowUpRight,
    MapPin,
    AlertCircle
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { getOrgTasks } from '../store/slices/taskSlice'

const CalendarDay = ({ day, monthStart, isSelected, tasks = [] }) => (
    <div className={`min-h-[140px] px-4 py-3 border-r border-b border-slate-100 dark:border-slate-800 transition-all ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 dark:bg-slate-900/30 opacity-40' : 'bg-white dark:bg-slate-900'} ${isSelected ? 'ring-2 ring-primary-500 ring-inset z-10' : ''}`}>
        <div className="flex justify-between items-center mb-4">
            <span className={`text-[11px] font-black uppercase tracking-widest ${isSameDay(day, new Date()) ? 'bg-primary-600 text-white px-2.5 py-1 rounded-lg' : 'text-slate-400'}`}>
                {format(day, 'd')}
            </span>
            {tasks.length > 0 && (
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse shadow-sm"></div>
            )}
        </div>

        <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => (
                <div key={task._id} className={`p-2 rounded-xl text-[10px] font-bold border-l-4 transition-all hover:scale-105 cursor-pointer flex items-center justify-between group ${task.priority === 'high' || task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-500 dark:bg-rose-950/30' : 'bg-primary-50 text-primary-600 border-primary-500 dark:bg-primary-950/30'}`}>
                    <span className="truncate max-w-[80px]">{task.title}</span>
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ))}
            {tasks.length > 3 && (
                <div className="text-[9px] font-black text-slate-400 px-1 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-md inline-block">
                    +{tasks.length - 3} MORE
                </div>
            )}
        </div>
    </div>
)

const CalendarPage = () => {
    const dispatch = useDispatch()
    const { activeOrganization } = useSelector((state) => state.orgs)
    const { tasks } = useSelector((state) => state.tasks)

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())

    useEffect(() => {
        if (activeOrganization) {
            dispatch(getOrgTasks(activeOrganization._id))
        }
    }, [dispatch, activeOrganization])

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in relative z-10">
            {/* Calendar Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Team Calendar</p>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                        <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary-600 transition-colors">Today</button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <button className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-3 group">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        New Event
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-premium flex flex-col">
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 flex-1 overflow-y-auto scrollbar-modern">
                    {calendarDays.map((day, idx) => {
                        const dayTasks = tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day))
                        return (
                            <CalendarDay
                                key={idx}
                                day={day}
                                monthStart={monthStart}
                                isSelected={isSameDay(day, selectedDate)}
                                tasks={dayTasks}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default CalendarPage
