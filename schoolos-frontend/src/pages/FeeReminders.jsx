import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellRing, 
  Send, 
  MessageCircle, 
  Smartphone, 
  Mail, 
  Zap, 
  Download, 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Star, 
  ChevronRight,
  Shield,
  Smartphone as PhoneIcon,
  CreditCard,
  X
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { buildUrl, getHeaders } from '../services/api';
import { Button } from '../components/ui/Button';

// Custom CSS for the FeeReminders module to match the high-fidelity dark UI
const styles = `
  .fee-reminders-root {
    --bg-dark: #0d0f14;
    --surface-dark: #14171f;
    --surface2-dark: #1c2030;
    --surface3-dark: #242840;
    --border-dark: rgba(255,255,255,0.07);
    --border2-dark: rgba(255,255,255,0.12);
    --text-dark: #f0f2f8;
    --text2-dark: #8b90a8;
    --text3-dark: #555a72;
    --accent-dark: #00e5a0;
    --accent-dim-dark: rgba(0,229,160,0.12);
    --accent-dim2-dark: rgba(0,229,160,0.06);
    --whatsapp-dark: #25d366;
    --whatsapp-dim-dark: rgba(37,211,102,0.12);
    --sms-dark: #f59e0b;
    --sms-dim-dark: rgba(245,158,11,0.12);
    --email-dark: #6366f1;
    --email-dim-dark: rgba(99,102,241,0.12);
    --danger-dark: #ef4444;
    --danger-dim-dark: rgba(239,68,68,0.12);
    --momo-dark: #ffcc00;
    --momo-dim-dark: rgba(255,204,0,0.1);
  }

  .stat-card-premium {
    background: var(--surface-dark);
    border: 1px solid var(--border-dark);
    position: relative;
    overflow: hidden;
  }
  .stat-card-premium::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
  }
  .stat-card-premium.green::before { background: var(--accent-dark); }
  .stat-card-premium.yellow::before { background: var(--momo-dark); }
  .stat-card-premium.orange::before { background: var(--sms-dark); }
  .stat-card-premium.red::before { background: var(--danger-dark); }

  .wa-preview-dark {
    background: #0f1a14;
    border: 1px solid rgba(37,211,102,0.15);
  }
  .wa-bubble-dark {
    background: #1f2d23;
    color: #e8f5e9;
  }
  .wa-bubble-dark::before {
    content: ''; position: absolute; top: 0; left: -6px;
    border: 6px solid transparent; border-right-color: #1f2d23; border-top-color: #1f2d23;
  }
`;

const FeeReminders = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { authSession } = useAuth();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  const [students, setStudents] = useState([
    { id:1, name:'Ama Mensah Boateng', class:'7A', parent:'Mrs. Abena Boateng', balance:600, days:18, risk:'high', wa:true, sms:true, email:true },
    { id:2, name:'Kweku Asante', class:'8B', parent:'Mr. Frank Asante', balance:480, days:31, risk:'high', wa:false, sms:true, email:true },
    { id:3, name:'Adjoa Tetteh', class:'6C', parent:'Mrs. Grace Tetteh', balance:250, days:7, risk:'med', wa:true, sms:false, email:true },
    { id:4, name:'Kofi Darko', class:'9A', parent:'Dr. Emmanuel Darko', balance:720, days:22, risk:'high', wa:true, sms:true, email:false },
    { id:5, name:'Abena Owusu', class:'7B', parent:'Mr. Seth Owusu', balance:180, days:3, risk:'low', wa:true, sms:true, email:true },
    { id:6, name:'Yaw Boateng Jnr', class:'8A', parent:'Mrs. Patricia Boateng', balance:600, days:15, risk:'high', wa:false, sms:false, email:true },
    { id:7, name:'Efua Mensah', class:'6B', parent:'Mr. James Mensah', balance:120, days:2, risk:'low', wa:true, sms:true, email:false },
    { id:8, name:'Nana Acheampong', class:'9B', parent:'Mrs. Rita Acheampong', balance:840, days:40, risk:'high', wa:true, sms:true, email:true },
    { id:9, name:'Akua Frimpong', class:'7C', parent:'Mr. Daniel Frimpong', balance:350, days:9, risk:'med', wa:false, sms:true, email:true },
    { id:10, name:'Kofi Amponsah', class:'8C', parent:'Mrs. Janet Amponsah', balance:480, days:12, risk:'med', wa:true, sms:true, email:false },
  ]);

  const [activities, setActivities] = useState([
    { time:'2m ago', color:'#25d366', text:<span>WhatsApp delivered to <strong>Mrs. Abena Boateng</strong> · Ama Mensah · GHS 600</span> },
    { time:'4m ago', color:'#ffcc00', text:<span><strong>MoMo payment received</strong> · Kwame Darko · GHS 480 ✅</span> },
    { time:'12m ago', color:'#f59e0b', text:<span>SMS fallback sent to <strong>Mr. Joseph Ankrah</strong> (WA undelivered)</span> },
    { time:'18m ago', color:'#6366f1', text:<span>Email sent to <strong>Dr. Emmanuel Darko</strong> · full fee breakdown attached</span> },
  ]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.parent.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = currentFilter === 'all' || 
        (currentFilter === 'high' && s.risk === 'high') ||
        (currentFilter === 'overdue' && s.days > 14) ||
        (currentFilter === 'due-soon' && s.days <= 7);
      return matchSearch && matchFilter;
    });
  }, [students, searchTerm, currentFilter]);

  const toggleRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = (checked) => {
    if (checked) setSelectedIds(filteredStudents.map(s => s.id));
    else setSelectedIds([]);
  };

  const handleBulkAction = (type) => {
    const label = { whatsapp:'WhatsApp', sms:'SMS', email:'Email', chain:'full reminder chain' }[type];
    showToast({
      title: `Sending ${label}`,
      message: `To ${selectedIds.length} selected students`,
      type: 'info'
    });
    setSelectedIds([]);
    addActivity(`${label} reminder sent to ${selectedIds.length} students`, '#00e5a0');
  };

  const addActivity = (text, color='#6366f1') => {
    const newItem = { time: 'just now', color, text: <span>{text}</span> };
    setActivities(prev => [newItem, ...prev.slice(0, 7)]);
  };

  const executeSend = () => {
    setSending(true);
    setSendProgress(0);
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSendModalOpen(false);
            setSending(false);
            setSendProgress(0);
            const n = selectedIds.length || 58;
            showToast({
              title: 'Reminders dispatched!',
              message: `Chain started for ${n} students · WhatsApp → SMS → Email`,
              type: 'success'
            });
            addActivity(`Bulk reminder chain started for ${n} students`, '#00e5a0');
            setSelectedIds([]);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  return (
    <div className="fee-reminders-root bg-[#0d0f14] text-[#f0f2f8] min-h-full p-8 font-['DM Sans'] overflow-y-auto">
      <style>{styles}</style>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-['Syne'] text-[#f0f2f8]">Smart Fee Reminders</h1>
          <p className="text-xs text-[#555a72] mt-1 uppercase tracking-widest font-black">Kwame Nkrumah Memorial JHS · Node Alpha</p>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.12)] text-sm font-bold text-[#8b90a8] hover:bg-[#1c2030] transition-colors flex items-center gap-2">
             <Clock size={16} /> Schedule
           </button>
           <button 
             onClick={() => setIsSendModalOpen(true)}
             className="px-5 py-2.5 rounded-xl bg-[#00e5a0] text-[#000] font-black text-sm uppercase tracking-widest hover:bg-[#00ffb3] transition-colors flex items-center gap-2 shadow-lg shadow-[#00e5a0]/20"
           >
             <Zap size={16} /> Send now
           </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total fees due', val: 'GHS 48,200', sub: '↑ 12% vs last term', color: 'green' },
          { label: 'Collected via MoMo', val: 'GHS 31,450', sub: '65% of total · 142 payments', color: 'yellow' },
          { label: 'Outstanding balance', val: 'GHS 16,750', sub: '58 students pending', color: 'orange' },
          { label: 'High-risk defaulters', val: '14', sub: 'Overdue 14+ days', color: 'red' },
        ].map((s, i) => (
          <div key={i} className={`stat-card-premium ${s.color} p-6 rounded-2xl`}>
            <div className="text-[10px] text-[#555a72] uppercase tracking-[0.1em] font-black mb-2">{s.label}</div>
            <div className="text-2xl font-bold font-['Syne'] mb-1">{s.val}</div>
            <div className="text-[11px] text-[#555a72] font-bold">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Bulk Bar */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#00e5a0]/10 border border-[#00e5a0]/20 p-4 rounded-xl flex items-center gap-4"
              >
                <div className="font-['Syne'] font-black text-[#00e5a0]">{selectedIds.length}</div>
                <div className="text-sm text-[#8b90a8] flex-1">students selected</div>
                <div className="flex gap-2">
                  <button onClick={() => handleBulkAction('whatsapp')} className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-xs font-bold hover:bg-[#1c2030]">WhatsApp</button>
                  <button onClick={() => handleBulkAction('sms')} className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] text-xs font-bold hover:bg-[#1c2030]">SMS</button>
                  <button onClick={() => handleBulkAction('chain')} className="px-4 py-1.5 rounded-lg bg-[#00e5a0] text-black text-xs font-black uppercase tracking-widest">⚡ Full Chain</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Panel */}
          <div className="bg-[#14171f] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[rgba(255,255,255,0.07)] flex justify-between items-center">
              <span className="font-['Syne'] font-bold text-sm text-[#f0f2f8]">Outstanding Fees Registry</span>
              <span className="text-xs text-[#555a72] font-bold uppercase tracking-widest">{filteredStudents.length} students</span>
            </div>
            
            <div className="p-4 border-b border-[rgba(255,255,255,0.07)] flex flex-wrap gap-4 items-center">
              <div className="bg-[#1c2030] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-2 flex items-center gap-3 flex-1 min-w-[200px]">
                <Search size={14} className="text-[#555a72]" />
                <input 
                  type="text" 
                  placeholder="Search name or parent..." 
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['all', 'high', 'overdue'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setCurrentFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === f ? 'bg-[#00e5a0]/10 border-[#00e5a0] text-[#00e5a0]' : 'border-[rgba(255,255,255,0.12)] text-[#8b90a8]'} border`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.07)]">
                    <th className="p-4"><input type="checkbox" className="accent-[#00e5a0]" onChange={(e) => toggleAll(e.target.checked)} /></th>
                    <th className="p-4 text-[11px] text-[#555a72] uppercase tracking-widest font-black">Student</th>
                    <th className="p-4 text-[11px] text-[#555a72] uppercase tracking-widest font-black">Balance</th>
                    <th className="p-4 text-[11px] text-[#555a72] uppercase tracking-widest font-black">Status</th>
                    <th className="p-4 text-[11px] text-[#555a72] uppercase tracking-widest font-black">Risk</th>
                    <th className="p-4 text-[11px] text-[#555a72] uppercase tracking-widest font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr 
                      key={s.id} 
                      className={`border-b border-[rgba(255,255,255,0.07)] last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedIds.includes(s.id) ? 'bg-[#00e5a0]/5' : ''}`}
                      onClick={() => toggleRow(s.id)}
                    >
                      <td className="p-4"><input type="checkbox" checked={selectedIds.includes(s.id)} className="accent-[#00e5a0]" readOnly /></td>
                      <td className="p-4">
                        <div className="text-sm font-bold">{s.name}</div>
                        <div className="text-[11px] text-[#555a72] font-bold">{s.class} · {s.parent}</div>
                      </td>
                      <td className="p-4">
                        <div className={`font-['Syne'] font-bold ${s.days > 14 ? 'text-[#ef4444]' : 'text-[#f0f2f8]'}`}>GHS {s.balance.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          s.days <= 5 ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 
                          s.days <= 14 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                        }`}>
                          {s.days} Days
                        </span>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${s.risk === 'high' ? 'bg-[#ef4444]' : s.risk === 'med' ? 'bg-[#f59e0b]' : 'bg-[#00e5a0]'}`} />
                           <span className="text-xs text-[#8b90a8] capitalize font-bold">{s.risk}</span>
                         </div>
                      </td>
                      <td className="p-4">
                         <button className="p-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-[#8b90a8] hover:text-[#f0f2f8] transition-colors"><Send size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Panel */}
          <div className="bg-[#14171f] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
             <div className="p-5 border-b border-[rgba(255,255,255,0.07)] flex justify-between items-center">
                <span className="font-['Syne'] font-bold text-sm text-[#f0f2f8]">Recent Ledger Activity</span>
                <span className="px-2 py-1 rounded-full bg-[#00e5a0]/10 text-[#00e5a0] text-[9px] font-black uppercase tracking-widest animate-pulse">Live Feed</span>
             </div>
             <div className="p-6 space-y-4">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                    <div className="text-xs text-[#8b90a8] leading-relaxed flex-1">{a.text}</div>
                    <div className="text-[10px] text-[#555a72] font-black uppercase tracking-widest">{a.time}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Chain Visualizer */}
          <div className="bg-[#14171f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
             <h2 className="font-['Syne'] font-bold text-sm mb-6 flex items-center gap-2"><Zap size={16} className="text-[#00e5a0]" /> Automated Fallback Chain</h2>
             <div className="space-y-8 relative">
                {[
                  { icon: 'W', color: 'wa', title: '1. WhatsApp + MoMo link', desc: 'Sent first. High conversion path with one-tap checkout.', trigger: 'Immediate' },
                  { icon: 'S', color: 'sms', title: '2. SMS Fallback', desc: 'Triggered if WA undelivered in 2 hours. Legacy carrier node.', trigger: '+2 hours' },
                  { icon: 'E', color: 'em', title: '3. Institutional Email', desc: 'Formal letter with encrypted fee breakdown PDF.', trigger: '+24 hours' },
                  { icon: '!', color: 'block', title: '4. Node Suspension', desc: 'Portal access restricted until balance cleared.', trigger: 'Day 30' },
                ].map((step, i, arr) => (
                  <div key={i} className="flex gap-4 relative">
                    {i < arr.length - 1 && <div className="absolute left-5 top-10 w-[1px] h-10 border-l border-dashed border-[rgba(255,255,255,0.12)]" />}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg z-10 border border-[rgba(255,255,255,0.1)] ci-${step.color}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1">{step.title}</div>
                      <div className="text-[11px] text-[#555a72] leading-relaxed mb-2">{step.desc}</div>
                      <span className="px-2 py-0.5 rounded bg-[#1c2030] text-[9px] font-black uppercase tracking-widest text-[#8b90a8]">{step.trigger}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* MoMo Card */}
          <div className="bg-[#14171f] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center text-lg">💳</div>
                <div>
                   <div className="text-sm font-bold font-['Syne']">MoMo Smart Link</div>
                   <div className="text-[10px] text-[#555a72] font-black uppercase tracking-widest">Paystack Integrated</div>
                </div>
             </div>
             <div className="bg-[#1c2030] rounded-xl p-4 mb-6 border border-[rgba(255,255,255,0.05)]">
                <div className="text-[10px] text-[#555a72] uppercase font-black tracking-widest mb-4">Payload Preview</div>
                <div className="text-sm font-bold mb-1">Ama Mensah Boateng</div>
                <div className="text-[11px] text-[#555a72] mb-4">Class 7A · Mrs. Abena Boateng</div>
                <div className="space-y-2 border-t border-[rgba(255,255,255,0.07)] pt-4">
                   <div className="flex justify-between text-[11px] text-[#8b90a8]"><span>School Fees</span> <span className="font-bold">GHS 480</span></div>
                   <div className="flex justify-between text-[11px] text-[#8b90a8]"><span>Levies</span> <span className="font-bold">GHS 120</span></div>
                   <div className="flex justify-between text-sm font-black text-[#ffcc00] pt-2"><span>Total</span> <span>GHS 600</span></div>
                </div>
                <div className="mt-4 text-[10px] text-[#00e5a0] font-bold truncate">🔗 pay.schoolos.app/ama-m-2t25</div>
             </div>
             <div className="flex gap-2">
                <button className="flex-1 py-3 rounded-xl border border-[rgba(255,255,255,0.12)] text-[10px] font-black uppercase tracking-widest hover:bg-[#1c2030]">Copy URL</button>
                <button className="flex-1 py-3 rounded-xl bg-[#00e5a0] text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00e5a0]/10">WA Preview</button>
             </div>
          </div>

          {/* WA Preview */}
          <div className="wa-preview-dark rounded-2xl p-5 border border-[rgba(37,211,102,0.15)]">
             <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.05]">
                <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center font-bold text-white">S</div>
                <div>
                   <div className="text-xs font-bold">SchoolOS · Node Alpha</div>
                   <div className="text-[9px] text-[#25d366] font-black">● ONLINE</div>
                </div>
             </div>
             <div className="wa-bubble-dark rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 text-[11px] leading-relaxed relative mb-2">
                Dear <strong>Mrs. Boateng</strong> 👋<br /><br />
                Ama (Class 7A) has a balance of <span className="text-[#4ade80] font-bold">GHS 600</span> due by 31 May.<br /><br />
                Pay instantly with <strong>MTN MoMo</strong>:<br />
                <button className="w-full mt-3 py-2.5 rounded-lg bg-[#25d366] text-black font-black uppercase tracking-widest text-[9px] shadow-lg shadow-[#25d366]/20">💳 Open MoMo Checkout</button>
             </div>
             <div className="text-[9px] text-[#555a72] text-right">6:00 PM · Delivered ✓✓</div>
          </div>

        </div>
      </div>

      {/* Send Modal */}
      <AnimatePresence>
        {isSendModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !sending && setIsSendModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg bg-[#14171f] rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-[rgba(255,255,255,0.12)]">
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="font-['Syne'] text-xl font-bold text-[#f0f2f8]">Dispatch Reminders</h2>
                  <p className="text-xs text-[#555a72] font-bold mt-1 uppercase tracking-widest">Multi-channel fallback protocol</p>
                </div>
                {!sending && <button onClick={() => setIsSendModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#555a72] transition-colors"><X size={20} /></button>}
              </div>

              <div className="p-8 pt-4 space-y-6">
                 <div>
                    <div className="text-[10px] text-[#555a72] uppercase font-black tracking-widest mb-4">Fallback Channels</div>
                    <div className="flex gap-2">
                       <button className="flex-1 py-3 rounded-xl border border-[#25d366] bg-[#25d366]/10 text-[#25d366] text-xs font-bold">WhatsApp</button>
                       <button className="flex-1 py-3 rounded-xl border border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-bold">SMS</button>
                       <button className="flex-1 py-3 rounded-xl border border-[rgba(255,255,255,0.12)] text-[#8b90a8] text-xs font-bold">Email</button>
                    </div>
                 </div>

                 <div className="bg-[#0d0f14] rounded-xl p-5 border border-[rgba(255,255,255,0.07)]">
                    <div className="text-[10px] text-[#555a72] uppercase font-black tracking-widest mb-4">Message Template</div>
                    <div className="text-[11px] text-[#8b90a8] leading-relaxed">
                       Dear <span className="text-[#00e5a0]">[Parent]</span> 👋<br /><br />
                       This is a reminder that <span className="text-[#00e5a0]">[Student]</span> has a balance of <span className="text-[#00e5a0]">GHS [Amount]</span>.<br /><br />
                       Pay instantly: <span className="text-[#00e5a0]">pay.schoolos.app/[ID]</span>
                    </div>
                 </div>

                 {sending && (
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-[#555a72] font-black uppercase tracking-widest">
                         <span>Transmitting...</span>
                         <span>{sendProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-[#00e5a0] transition-all duration-300" style={{ width: `${sendProgress}%` }} />
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-8 bg-black/20 flex gap-3">
                 <button disabled={sending} onClick={() => setIsSendModalOpen(false)} className="flex-1 py-4 rounded-2xl border border-[rgba(255,255,255,0.12)] text-xs font-black uppercase tracking-widest hover:bg-[#1c2030] transition-colors disabled:opacity-50">Cancel</button>
                 <button 
                  disabled={sending}
                  onClick={executeSend}
                  className="flex-2 py-4 rounded-2xl bg-[#00e5a0] text-black text-xs font-black uppercase tracking-widest shadow-xl shadow-[#00e5a0]/10 hover:bg-[#00ffb3] transition-all disabled:opacity-50"
                >
                   {sending ? 'Processing Dispatch' : `⚡ Send to ${selectedIds.length || 58} students`}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FeeReminders;
