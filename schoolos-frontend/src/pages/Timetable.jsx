import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  MapPin,
  X,
  LayoutGrid,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const timeSlots = [
  { time: '7:00 AM', label: 'Period 1' },
  { time: '7:45 AM', label: 'Period 2' },
  { time: '8:30 AM', label: 'Period 3' },
  { time: '9:15 AM', label: 'BREAK', isBreak: true },
  { time: '9:45 AM', label: 'Period 4' },
  { time: '10:30 AM', label: 'Period 5' },
  { time: '11:15 AM', label: 'Period 6' },
  { time: '12:00 PM', label: 'LUNCH', isBreak: true },
  { time: '12:45 PM', label: 'Period 7' },
  { time: '1:30 PM', label: 'Period 8' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const schedule = {
  'Monday': {
    '7:00 AM': { subject: 'Mathematics', teacher: 'Mrs. Mensah', room: 'Lab 1', color: '#6366F1' },
    '7:45 AM': { subject: 'English Language', teacher: 'Mr. Asante', room: 'Room 2', color: '#10B981' },
    '8:30 AM': { subject: 'Science', teacher: 'Mrs. Boateng', room: 'Lab 2', color: '#F59E0B' },
    '9:45 AM': { subject: 'Social Studies', teacher: 'Mr. Osei', room: 'Room 1', color: '#EC4899' },
  },
  'Tuesday': {
     '7:00 AM': { subject: 'ICT', teacher: 'Mrs. Darko', room: 'Comp Lab', color: '#8B5CF6' },
     '7:45 AM': { subject: 'Science', teacher: 'Mrs. Boateng', room: 'Lab 2', color: '#F59E0B' },
  }
};

const Timetable = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("class");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 h-full min-h-0">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex p-1 rounded-2xl border"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            {[
              { id: "class", label: "By Class", icon: LayoutGrid },
              { id: "teacher", label: "By Teacher", icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
                style={{
                  background: activeTab === tab.id ? "var(--accent-primary)" : "transparent",
                  color: activeTab === tab.id ? "var(--bg-primary)" : "var(--text-muted)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="hidden md:flex items-center gap-4 px-4 py-2 rounded-xl border"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
             <button className="hover:opacity-60 transition-opacity"><ChevronLeft size={16} style={{ color: "var(--text-primary)" }} /></button>
             <span style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", tracking: "0.1em" }}>Academic Week 12</span>
             <button className="hover:opacity-60 transition-opacity"><ChevronRight size={16} style={{ color: "var(--text-primary)" }} /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-colors" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
              <Printer size={16} /> Print
           </button>
           <button
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform bg-plum text-milk shadow-lg shadow-plum/20"
           >
             <Plus size={16} /> Assign Period
           </button>
        </div>
      </div>

      {/* Timetable Grid Container */}
      <div 
        className="flex-1 rounded-[32px] overflow-hidden border flex flex-col min-h-0"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="overflow-auto no-scrollbar h-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "var(--bg-secondary)", borderBottom: `1px solid var(--border)` }}>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest sticky left-0 z-20" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", width: 120 }}>Time</th>
                {days.map(day => (
                  <th key={day} className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.time} className={slot.isBreak ? "bg-black/[0.02]" : ""}>
                  <td className="px-6 py-8 border-b border-r sticky left-0 z-10" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
                     <p style={{ color: "var(--text-primary)", fontSize: "0.78rem", fontWeight: 800 }}>{slot.time}</p>
                     <p style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>{slot.label}</p>
                  </td>
                  {slot.isBreak ? (
                    <td colSpan={5} className="p-0 border-b" style={{ borderColor: "var(--border)" }}>
                      <div className="w-full py-8 flex items-center justify-center gap-4">
                         <div className="h-px flex-1 max-w-[100px]" style={{ background: "var(--border)" }} />
                         <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4em" }}>{slot.label}</span>
                         <div className="h-px flex-1 max-w-[100px]" style={{ background: "var(--border)" }} />
                      </div>
                    </td>
                  ) : (
                    days.map(day => {
                      const session = schedule[day]?.[slot.time];
                      return (
                        <td key={day} className="p-2 border-b border-r last:border-r-0" style={{ borderColor: "var(--border)" }}>
                          {session ? (
                            <motion.div 
                              whileHover={{ y: -4, scale: 1.02 }}
                              className="p-4 rounded-2xl h-full flex flex-col justify-between shadow-sm border border-transparent transition-all cursor-pointer group"
                              style={{ background: `${session.color}08`, borderColor: `${session.color}20` }}
                            >
                              <div>
                                 <div className="flex justify-between items-start mb-2">
                                    <span style={{ color: session.color, fontSize: "0.78rem", fontWeight: 800, lineHeight: 1.2 }}>{session.subject}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={12} style={{ color: "var(--text-muted)" }} /></div>
                                 </div>
                                 <div className="flex items-center gap-1.5 mb-1">
                                    <User size={10} style={{ color: "var(--text-muted)" }} />
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600 }}>{session.teacher}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                    <MapPin size={10} style={{ color: "var(--text-muted)" }} />
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600 }}>{session.room}</span>
                                 </div>
                              </div>
                            </motion.div>
                          ) : (
                            <button 
                              onClick={() => setIsAddModalOpen(true)}
                              className="w-full h-full min-h-[100px] border-2 border-dashed rounded-2xl flex items-center justify-center text-slate-200 hover:text-plum/30 transition-all group"
                              style={{ borderColor: "var(--border)" }}
                            >
                              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            </button>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Schedule Session</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Academic Calendar Planning</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Select Day", options: days },
                    { label: "Select Period", options: timeSlots.filter(s => !s.isBreak).map(s => s.time) },
                    { label: "Subject", options: ["Mathematics", "English", "Science", "ICT"] },
                    { label: "Teacher", options: ["Mrs. Mensah", "Mr. Asante", "Mrs. Boateng"] },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                      <select className="w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Classroom / Lab</label>
                  <input placeholder="e.g. Science Lab 1" className="w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                </div>
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" onClick={() => setIsAddModalOpen(false)}>Assign Session</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timetable;
