import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Lock, 
  School, 
  Globe, 
  Users, 
  ShieldCheck, 
  Rocket, 
  Plus, 
  Trash2,
  Building2,
  Hash,
  Phone,
  User,
  Layout,
  ArrowRight
} from 'lucide-react';
import logo from '../assets/app-logo.png';
import { buildUrl, handleApiError } from '../services/api';

export const Signup = ({ setActiveTab }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    subdomain: '',
    schoolType: 'Primary',
    country: 'Ghana',
    address: '',
    phone: '',
    expectedStudents: '100-500',
    plan: 'trial',
    team: []
  });

  const [teamInput, setTeamInput] = useState({ email: '', role: 'Teacher' });

  // Real-time subdomain generation
  useEffect(() => {
    if (formData.schoolName && !formData.subdomain) {
      const slug = formData.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      setFormData(prev => ({ ...prev, subdomain: slug }));
    }
  }, [formData.schoolName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, 5));
  };
  
  const prevStep = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const addTeamMember = () => {
    if (teamInput.email && !formData.team.find(m => m.email === teamInput.email)) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, { ...teamInput }]
      }));
      setTeamInput({ email: '', role: 'Teacher' });
    }
  };

  const removeTeamMember = (email) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m.email !== email)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(buildUrl('/api/onboard/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: formData.schoolName,
          email: formData.email,
          adminName: formData.fullName,
          adminPassword: formData.password,
          plan: formData.plan,
          phone: formData.phone
        }),
      });

      if (!response.ok) throw new Error(await handleApiError(response));
      
      const data = await response.json();
      setStatus({ type: 'success', message: 'School created successfully!' });
      
      // Navigate to dashboard or success view
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Account Created', icon: User },
    { id: 2, name: 'School Details', icon: School },
    { id: 3, name: 'Choose a Plan', icon: Layout },
    { id: 4, name: 'Invite Your Team', icon: Users },
    { id: 5, name: 'Go Live 🚀', icon: Rocket }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 lg:p-12 font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        .playfair { font-family: 'Playfair Display', serif; }
        .gradient-left { background: linear-gradient(160deg, #0f172a, #1e3a8a 60%, #1d4ed8); }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1280px] h-full min-h-[850px] bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex overflow-hidden border border-slate-200"
      >
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[420px] gradient-left p-12 flex-col justify-between relative overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-24">
              <img src={logo} alt="SchoolOS" className="h-8 brightness-0 invert" />
              <span className="text-white font-black tracking-tighter text-2xl">School<span className="text-blue-400">OS</span></span>
            </div>

            <h1 className="text-5xl font-black text-white leading-[1.1] mb-6">
              Set up your <br />
              <span className="playfair italic text-[#f97316]">institution.</span>
            </h1>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-xs mb-20">
              Get your school live on SchoolOS in under 5 minutes.
            </p>

            {/* Vertical Step Tracker */}
            <div className="space-y-10 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/10" />
              
              {steps.map((s) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;
                return (
                  <div key={s.id} className="flex items-center gap-6 group">
                    <div className={`
                      relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                      ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                        isActive ? 'bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.4)]' : 
                        'bg-white/5 border border-white/10'}
                    `}>
                      {isCompleted ? <Check size={18} className="text-white" /> : 
                       isActive ? <span className="text-white font-black text-sm">{s.id}</span> :
                       <span className="text-white/30 font-bold text-sm">{s.id}</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-white/30'}`}>Step {s.id}</span>
                      <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-white/50'}`}>{s.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-white font-bold text-xs uppercase tracking-wider mb-0.5">256-bit SSL Encrypted</div>
              <div className="text-white/40 text-[10px] font-medium leading-tight">Your data is safe and never shared</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col relative">
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 relative">
            <motion.div 
              animate={{ width: `${(step / 5) * 100}%` }}
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 ease-out"
            />
          </div>

          <div className="flex-1 flex flex-col p-8 lg:p-16 max-w-[800px] mx-auto w-full">
            {/* Step Header */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                Step {step} of 5 — {steps[step-1].name}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {step === 1 && "Create your master account"}
                    {step === 2 && "Tell us about your school"}
                    {step === 3 && "Choose your growth tier"}
                    {step === 4 && "Invite your core team"}
                    {step === 5 && "Everything looks perfect!"}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    {step === 1 && "This will be the primary administrator account for your entire institution."}
                    {step === 2 && "This information will be used to set up your institution's custom workspace."}
                    {step === 3 && "Select a plan that fits your current needs. You can scale anytime."}
                    {step === 4 && "Add your staff members now to get them set up early, or skip for later."}
                    {step === 5 && "Your school infrastructure is ready for deployment. Let's go live."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g. Dr. Kwame Mensah" icon={User} />
                      <InputGroup label="Email Address" name="email" value={formData.email} onChange={handleInputChange} placeholder="admin@yourschool.edu" icon={Mail} />
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" icon={Lock} />
                        <InputGroup label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" icon={ShieldCheck} />
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                        <div className={`h-full transition-all duration-500 ${formData.password.length > 8 ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-500'}`} />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="School Name" name="schoolName" value={formData.schoolName} onChange={handleInputChange} placeholder="e.g. Greenvalley Academy" icon={Building2} />
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Subdomain</label>
                          <div className="relative flex items-center group">
                             <Hash size={18} className="absolute left-4 text-slate-400" />
                             <input 
                                value={formData.subdomain}
                                onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                                className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-24 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                placeholder="subdomain"
                             />
                             <span className="absolute right-6 text-slate-400 font-bold text-sm">.schoolos.io</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <SelectGroup label="School Type" name="schoolType" value={formData.schoolType} onChange={handleInputChange} options={['Primary', 'JHS', 'SHS', 'University', 'Other']} />
                        <SelectGroup label="Country" name="country" value={formData.country} onChange={handleInputChange} options={['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Other']} />
                      </div>
                      <InputGroup label="School Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="e.g. 12 Education Ave, Accra" icon={Globe} />
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233 XX XXX XX" icon={Phone} />
                        <SelectGroup label="Expected Students" name="expectedStudents" value={formData.expectedStudents} onChange={handleInputChange} options={['0-100', '101-500', '501-1000', '1000+']} />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: 'trial', name: 'Trial', price: '0', desc: '7-Day Full Access' },
                        { id: 'basic', name: 'Basic', price: '299', desc: 'Core Modules' },
                        { id: 'standard', name: 'Standard', price: '599', desc: 'Full Ecosystem' },
                        { id: 'premium', name: 'Premium', price: '999', desc: 'Enterprise' }
                      ].map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setFormData(prev => ({ ...prev, plan: p.id }))}
                          className={`
                            p-6 rounded-[24px] border-2 cursor-pointer transition-all duration-300
                            ${formData.plan === p.id ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
                          `}
                        >
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${formData.plan === p.id ? 'text-blue-600' : 'text-slate-400'}`}>{p.name}</div>
                          <div className="text-2xl font-black text-slate-900 tracking-tight mb-4">GHS {p.price}</div>
                          <div className="text-[11px] font-bold text-slate-500 leading-tight">{p.desc}</div>
                        </div>
                      ))}
                      {/* Feature summary for selected plan */}
                      <div className="col-span-full mt-10 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Plan Includes</div>
                        <div className="grid grid-cols-2 gap-4">
                          {['Full Admin Dashboard', 'Attendance & SMS', 'Exams & Results', 'Finance & Payroll'].map(f => (
                            <div key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                              <Check size={16} className="text-blue-600" /> {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="flex gap-4">
                        <div className="flex-1">
                           <InputGroup label="Staff Email" name="teamEmail" value={teamInput.email} onChange={(e) => setTeamInput(prev => ({ ...prev, email: e.target.value }))} placeholder="staff@yourschool.edu" icon={Mail} />
                        </div>
                        <div className="w-[180px]">
                           <SelectGroup label="Role" name="teamRole" value={teamInput.role} onChange={(e) => setTeamInput(prev => ({ ...prev, role: e.target.value }))} options={['Teacher', 'Accountant', 'Admin']} />
                        </div>
                        <button 
                          onClick={addTeamMember}
                          className="mt-[34px] w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                        >
                          <Plus size={24} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.team.length === 0 ? (
                          <div className="p-12 border-2 border-dashed border-slate-100 rounded-[32px] text-center text-slate-400 font-bold">
                            No team members added yet
                          </div>
                        ) : (
                          formData.team.map(m => (
                            <div key={m.email} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-left-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-200">
                                  <User size={18} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{m.email}</div>
                                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.role}</div>
                                </div>
                              </div>
                              <button onClick={() => removeTeamMember(m.email)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="text-center space-y-10">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10"
                      >
                        <Check size={48} strokeWidth={3} />
                      </motion.div>
                      
                      <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 space-y-8">
                         <div className="grid grid-cols-2 gap-10">
                            <div className="text-left">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">School Identity</div>
                               <div className="text-lg font-black text-slate-900">{formData.schoolName}</div>
                               <div className="text-sm font-bold text-blue-600">{formData.subdomain}.schoolos.io</div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Plan</div>
                               <div className="text-lg font-black text-slate-900 uppercase italic tracking-tighter text-3xl">{formData.plan}</div>
                            </div>
                         </div>
                         <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                               <ShieldCheck size={20} className="text-emerald-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Security Verified</span>
                            </div>
                            <div className="text-sm font-bold text-slate-500 italic">Deployment Ready</div>
                         </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="mt-16 pt-10 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={step === 1 ? () => setActiveTab('login') : prevStep}
                  className="flex items-center gap-3 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all group"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  {step === 1 ? 'Log In Instead' : 'Back'}
                </button>
                
                {(step === 4) && (
                  <button 
                    onClick={nextStep}
                    className="text-slate-300 hover:text-slate-500 font-bold text-sm tracking-tight"
                  >
                    Skip for now
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {status.message && (
                  <span className={`text-xs font-bold uppercase tracking-widest ${status.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {status.message}
                  </span>
                )}
                
                <button 
                  onClick={step === 5 ? handleSubmit : nextStep}
                  disabled={isSubmitting}
                  className={`
                    flex items-center gap-3 px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95
                    ${step === 5 ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/20' : 'bg-slate-900 text-white shadow-slate-900/10'}
                    ${isSubmitting ? 'opacity-50' : 'hover:shadow-xl'}
                  `}
                >
                  {isSubmitting ? 'Deploying...' : step === 5 ? 'Launch My School' : 'Continue'}
                  {!isSubmitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Components
const InputGroup = ({ label, name, value, onChange, placeholder, icon: Icon, type = "text" }) => (
  <div className="space-y-3 group">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1 transition-colors group-focus-within:text-blue-500">{label}</label>
    <div className="relative flex items-center">
      <Icon size={18} className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-6 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
      />
    </div>
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options }) => (
  <div className="space-y-3 group">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1 group-focus-within:text-blue-500">{label}</label>
    <select 
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 py-4 px-6 rounded-2xl text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default Signup;
