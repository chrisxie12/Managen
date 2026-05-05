import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Printer, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  MapPin,
  X,
  BookOpen,
  Filter,
  MoreVertical,
  LayoutGrid,
  Zap,
  Sparkles
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';

const Timetable = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('timetable');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('class'); // 'class' or 'teacher'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const timeSlots = [
    { time: '7:00 AM - 7:45 AM', label: 'Period 1' },
    { time: '7:45 AM - 8:30 AM', label: 'Period 2' },
    { time: '8:30 AM - 9:15 AM', label: 'Period 3' },
    { time: '9:15 AM - 9:30 AM', label: 'BREAK', isBreak: true },
    { time: '9:30 AM - 10:15 AM', label: 'Period 4' },
    { time: '10:15 AM - 11:00 AM', label: 'Period 5' },
    { time: '11:00 AM - 11:45 AM', label: 'Period 6' },
    { time: '11:45 AM - 12:30 PM', label: 'LUNCH', isBreak: true },
    { time: '12:30 PM - 1:15 PM', label: 'Period 7' },
    { time: '1:15 PM - 2:00 PM', label: 'Period 8' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const schedule = {
    'Monday': {
      '7:00 AM - 7:45 AM': { subject: 'Mathematics', teacher: 'Mrs. Mensah', room: 'Lab 1', color: 'bg-accent-primary' },
      '7:45 AM - 8:30 AM': { subject: 'English Language', teacher: 'Mr. Asante', room: 'Room 2', color: 'bg-emerald-500' },
      '8:30 AM - 9:15 AM': { subject: 'Integrated Science', teacher: 'Mrs. Boateng', room: 'Lab 2', color: 'bg-indigo-500' },
      '9:30 AM - 10:15 AM': { subject: 'Social Studies', teacher: 'Mr. Osei', room: 'Room 1', color: 'bg-amber-500' },
    },
    'Tuesday': {
       '7:00 AM - 7:45 AM': { subject: 'ICT / Computer Science', teacher: 'Mrs. Darko', room: 'Comp Lab', color: 'bg-rose-500' },
       '7:45 AM - 8:30 AM': { subject: 'Integrated Science', teacher: 'Mrs. Boateng', room: 'Lab 2', color: 'bg-indigo-500' },
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar 
        activeItem={activeItem} 
        onNavigate={(item) => {
          setActiveItem(item);
          onNavigate(item);
        }} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <DashboardNavbar activeItem={activeItem} onMenuClick={() => setSidebarOpen(true)} />

      <main className="md:ml-[280px] pt-20 p-8 text-text-primary">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
                <Calendar size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Timetable</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Academic scheduling and faculty availability management.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex gap-1 mr-2">
                <button 
                  onClick={() => setViewMode('class')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'class' ? 'bg-white shadow-sm text-accent-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Class View
                </button>
                <button 
                  onClick={() => setViewMode('teacher')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'teacher' ? 'bg-white shadow-sm text-accent-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Teacher View
                </button>
             </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="px-5 shadow-lg shadow-accent-primary/15">
              <Plus size={18} className="mr-2" /> New Period
            </Button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-2.5 mb-10 flex flex-col lg:flex-row items-center gap-3">
           <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-[22px] px-6 py-4 shadow-sm w-full lg:w-auto">
              <button className="text-slate-300 hover:text-accent-primary transition-colors"><ChevronLeft size={20} /></button>
              <div className="flex items-center gap-2 text-xs font-black text-text-primary uppercase tracking-widest min-w-[200px] justify-center">
                 <Zap size={14} className="text-amber-500" />
                 <span>Current Academic Week</span>
              </div>
              <button className="text-slate-300 hover:text-accent-primary transition-colors"><ChevronRight size={20} /></button>
           </div>
           
           <div className="flex items-center gap-3 w-full lg:flex-1 justify-end">
              <select className="bg-white border border-slate-100 rounded-xl px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none shadow-sm appearance-none min-w-[160px]">
                 <option>Form 1A</option>
                 <option>Form 1B</option>
              </select>
              <Button variant="secondary" className="h-[56px] px-6 rounded-[22px] bg-white border border-slate-100 text-slate-500 shadow-sm">
                 <Printer size={18} className="mr-2" /> Print Schedule
              </Button>
           </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                       <th className="px-8 py-6 w-48 border-r border-slate-50">Session Time</th>
                       {days.map(day => <th key={day} className="px-6 py-6 border-r border-slate-50">{day}</th>)}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i}>
                             <td className="px-8 py-10 border-r border-slate-50">
                                <SkeletonLoader width="80px" height="14px" className="mb-2" />
                                <SkeletonLoader width="60px" height="10px" />
                             </td>
                             {days.map(d => (
                                <td key={d} className="p-4 border-r border-slate-50">
                                   <SkeletonLoader height="80px" borderRadius="16px" />
                                </td>
                             ))}
                          </tr>
                       ))
                    ) : (
                       timeSlots.map((slot, i) => (
                          <tr key={i} className="group hover:bg-slate-50/20 transition-colors">
                             <td className="px-8 py-10 border-r border-slate-50">
                                <div className="text-sm font-black text-text-primary mb-1 tracking-tight">{slot.label}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                   <Clock size={10} /> {slot.time}
                                </div>
                             </td>
                             {slot.isBreak ? (
                                <td colSpan={5} className="p-0 border-r border-slate-50">
                                   <div className="h-full py-10 bg-slate-50/50 flex items-center justify-center gap-3">
                                      <div className="h-px w-20 bg-slate-100" />
                                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">
                                         {slot.label}
                                      </div>
                                      <div className="h-px w-20 bg-slate-100" />
                                   </div>
                                </td>
                             ) : (
                                days.map(day => {
                                   const period = schedule[day] && schedule[day][slot.time];
                                   return (
                                      <td key={day} className="p-2 border-r border-slate-50">
                                         {period ? (
                                            <motion.div
                                               whileHover={{ scale: 1.02, y: -2 }}
                                               className={`p-5 rounded-[24px] h-full min-h-[120px] ${period.color} text-white shadow-lg shadow-black/5 relative overflow-hidden group/card cursor-pointer`}
                                            >
                                               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-[40px] -mr-4 -mt-4 group-hover/card:scale-150 transition-transform duration-500" />
                                               <div className="text-xs font-black tracking-tight leading-tight mb-4 relative z-10">{period.subject}</div>
                                               
                                               <div className="space-y-1.5 relative z-10">
                                                  <div className="flex items-center gap-2 text-[9px] font-bold opacity-80">
                                                     <User size={10} /> {period.teacher}
                                                  </div>
                                                  <div className="flex items-center gap-2 text-[9px] font-bold opacity-80">
                                                     <MapPin size={10} /> {period.room}
                                                  </div>
                                               </div>
                                               
                                               <div className="absolute bottom-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                  <Sparkles size={12} fill="white" />
                                               </div>
                                            </motion.div>
                                         ) : (
                                            <div 
                                              onClick={() => setIsAddModalOpen(true)}
                                              className="h-full min-h-[120px] border-2 border-dashed border-slate-50 rounded-[24px] flex items-center justify-center text-slate-200 hover:border-slate-200 hover:text-slate-300 hover:bg-slate-50 transition-all cursor-pointer group/add"
                                            >
                                               <Plus size={20} className="group-hover/add:rotate-90 transition-transform" />
                                            </div>
                                         )}
                                      </td>
                                   );
                                })
                             )}
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>

      {/* Add Period Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl relative z-[101] overflow-hidden border border-slate-100"
            >
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">Session Assignment</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Calendar • Timetable Planning</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Day</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                          <option>Monday</option>
                          <option>Tuesday</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Slot</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                          <option>Period 1 (7:00 AM)</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                          <option>Integrated Science</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Teacher</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                          <option>Mrs. Boateng</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent-primary/10 font-black text-sm uppercase tracking-widest">Assign Session</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timetable;
