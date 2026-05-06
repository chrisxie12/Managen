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
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { buildUrl, handleApiError } from '../services/api';
import { useLocalization, countryConfigs } from '../contexts/LocalizationContext';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#64748b"; // Updated for WCAG AA compliance (slate-500)

export const Signup = ({ setActiveTab }) => {
  const { changeCountry, config } = useLocalization();
  const [step, setStep] = useState(1);
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
    country: 'GLOBAL',
    address: '',
    phone: '',
    expectedStudents: '100-500',
    plan: 'trial',
    team: []
  });

  const [teamInput, setTeamInput] = useState({ email: '', role: 'Teacher' });

  useEffect(() => {
    if (formData.schoolName && !formData.subdomain) {
      const slug = formData.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      setFormData(prev => ({ ...prev, subdomain: slug }));
    }
  }, [formData.schoolName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'country') {
      changeCountry(value);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

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
      setStatus({ type: 'success', message: 'School created successfully!' });
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Account Info', icon: User },
    { id: 2, name: 'School Profile', icon: School },
    { id: 3, name: 'Tier Selection', icon: Layout },
    { id: 4, name: 'Team Invite', icon: Users },
    { id: 5, name: 'Final Review', icon: Rocket }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 lg:p-12 font-body" style={{ background: MILK }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1200px] min-h-[800px] bg-white rounded-[48px] shadow-2xl flex overflow-hidden border"
        style={{ borderColor: "rgba(56,25,50,0.08)" }}
      >
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[380px] p-12 flex-col justify-between relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)` }}>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap size={22} color={PLUM} />
               </div>
               <span className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>SchoolOS</span>
            </div>

            <h1 className="text-5xl font-black text-white leading-[1.15] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Provision your <br />
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>institution.</span>
            </h1>
            <p className="text-white font-medium leading-relaxed max-w-xs mb-16">
              Establish your school infrastructure on Africa's most advanced management node.
            </p>

            {/* Step Tracker */}
            <div className="space-y-8 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/10" />
              
              {steps.map((s) => {
                const isCompleted = step > s.id;
                const isActive = step === s.id;
                return (
                  <div key={s.id} className="flex items-center gap-5 group">
                    <div className={`
                      relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                      ${isCompleted ? 'bg-emerald-500 shadow-lg' : 
                        isActive ? 'bg-white shadow-xl' : 
                        'bg-white/5 border border-white/10'}
                    `}>
                      {isCompleted ? <Check size={18} className="text-white" /> : 
                       isActive ? <s.icon size={18} color={PLUM} /> :
                       <span className="text-white font-bold text-sm">{s.id}</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/60'}`}>Step {s.id}</span>
                      <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-white/80'}`}>{s.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-white font-bold text-xs uppercase tracking-widest mb-0.5">Surgical Encryption</div>
              <div className="text-white font-medium leading-tight text-xs">ISO-27001 Certified Infrastructure</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col relative overflow-y-auto">
          <div className="h-1.5 w-full bg-slate-100 relative">
            <motion.div 
              animate={{ width: `${(step / 5) * 100}%` }}
              className="absolute top-0 left-0 h-full transition-all duration-700 ease-out"
              style={{ background: PLUM }}
            />
          </div>

          <div className="flex-1 flex flex-col p-8 lg:p-16 max-w-[760px] mx-auto w-full">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border" style={{ background: MILK, color: PLUM, borderColor: "rgba(56,25,50,0.1)" }}>
                Step {step} of 5 — {steps[step-1].name}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl font-black tracking-tight leading-tight" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>
                    {step === 1 && "Create your master account"}
                    {step === 2 && "Configure school node"}
                    {step === 3 && "Select service tier"}
                    {step === 4 && "Invite institutional team"}
                    {step === 5 && "Verify configuration"}
                  </h2>
                  <p style={{ color: MUTED, fontWeight: 600 }} className="text-lg leading-relaxed">
                    {step === 1 && "Establish the primary administrator identity for your institution."}
                    {step === 2 && "Enter your school's official details to initialize your private workspace."}
                    {step === 3 && "Choose a plan that scales with your student population."}
                    {step === 4 && "Onboard your staff nodes now or synchronize later from the dashboard."}
                    {step === 5 && "Review your institutional footprint before deployment."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {step === 1 && (
                    <div className="space-y-6">
                      <InputGroup label="Master Administrator" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g. Dr. Kwame Mensah" icon={User} />
                      <InputGroup label="Administrative Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="admin@school.edu" icon={Mail} />
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Security Key" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" icon={Lock} />
                        <InputGroup label="Verify Key" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" icon={ShieldCheck} />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="School Name" name="schoolName" value={formData.schoolName} onChange={handleInputChange} placeholder="e.g. Ridge School" icon={Building2} />
                        <div className="space-y-3">
                          <label className="text-xs font-black uppercase tracking-widest block ml-1" style={{ color: MUTED }}>Workspace ID</label>
                          <div className="relative flex items-center group">
                             <Hash size={16} className="absolute left-4" color={MUTED} />
                             <input 
                                value={formData.subdomain}
                                onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                                className="w-full bg-white border py-4 pl-12 pr-24 rounded-2xl font-bold text-sm outline-none transition-all shadow-sm focus:border-plum/30"
                                style={{ color: PLUM, borderColor: "rgba(56,25,50,0.08)" }}
                                placeholder="slug"
                             />
                             <span className="absolute right-6 font-black text-xs uppercase tracking-widest" style={{ color: MUTED }}>.schoolos.io</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <SelectGroup 
                          label="Institutional Level" 
                          name="schoolType" 
                          value={formData.schoolType} 
                          onChange={handleInputChange} 
                          options={config.schoolLevels} 
                        />
                        <SelectGroup 
                          label="Country Hub" 
                          name="country" 
                          value={formData.country} 
                          onChange={handleInputChange} 
                          options={Object.keys(countryConfigs).map(code => ({
                            value: code,
                            label: countryConfigs[code].name
                          }))} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Primary Phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233..." icon={Phone} />
                        <SelectGroup label="Capacity" name="expectedStudents" value={formData.expectedStudents} onChange={handleInputChange} options={['0-100', '101-500', '501-1000', '1000+']} />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'trial', name: 'Starter Trial', price: '0', desc: '7-Day Deployment' },
                        { id: 'basic', name: 'Standard Node', price: '420', desc: 'Up to 500 Students' },
                        { id: 'standard', name: 'Growth Node', price: '850', desc: 'Up to 1500 Students' },
                        { id: 'premium', name: 'Enterprise', price: 'Custom', desc: 'Unlimited Scaling' }
                      ].map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setFormData(prev => ({ ...prev, plan: p.id }))}
                          className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all duration-300 ${formData.plan === p.id ? 'bg-[#381932]/5 shadow-lg' : 'bg-white border-black/5 hover:border-black/10'}`}
                          style={{ borderColor: formData.plan === p.id ? PLUM : undefined }}
                        >
                          <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: formData.plan === p.id ? PLUM : MUTED }}>{p.name}</div>
                          <div className="text-2xl font-black tracking-tight mb-4" style={{ color: PLUM, fontFamily: "'JetBrains Mono', monospace" }}>GHS {p.price}</div>
                          <div className="text-xs font-bold leading-tight" style={{ color: MUTED }}>{p.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="flex gap-3">
                         <div className="flex-1"><InputGroup label="Staff Email" name="teamEmail" value={teamInput.email} onChange={(e) => setTeamInput(prev => ({ ...prev, email: e.target.value }))} placeholder="staff@school.edu" icon={Mail} /></div>
                         <div className="w-[140px]"><SelectGroup label="Node Role" name="teamRole" value={teamInput.role} onChange={(e) => setTeamInput(prev => ({ ...prev, role: e.target.value }))} options={['Teacher', 'Accountant', 'Admin']} /></div>
                         <button onClick={addTeamMember} className="mt-[34px] w-14 h-14 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95" style={{ background: PLUM }}><Plus size={24} /></button>
                      </div>
                      <div className="space-y-3">
                        {formData.team.map(m => (
                          <div key={m.email} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ background: PLUM_LIGHT }}>{m.email[0].toUpperCase()}</div>
                              <div>
                                <div className="text-sm font-bold" style={{ color: PLUM }}>{m.email}</div>
                                <div className="text-xs font-black uppercase tracking-widest" style={{ color: MUTED }}>{m.role} Node</div>
                              </div>
                            </div>
                            <button aria-label="Remove team member" onClick={() => removeTeamMember(m.email)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="text-center space-y-8">
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
                        <Rocket size={36} color="white" />
                      </div>
                      <div className="bg-white rounded-[40px] p-8 border border-black/5 space-y-6">
                         <div className="grid grid-cols-2 gap-8 text-left">
                            <div><div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: MUTED }}>Institution</div><div className="text-lg font-bold" style={{ color: PLUM }}>{formData.schoolName}</div></div>
                            <div><div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: MUTED }}>Service Node</div><div className="text-lg font-bold uppercase tracking-tighter" style={{ color: PLUM }}>{formData.plan}</div></div>
                         </div>
                         <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest" style={{ color: PLUM_LIGHT }}><Check size={14} /> Ready for Deployment</div>
                            <div className="text-xs font-bold" style={{ color: MUTED }}>Instance: {formData.subdomain}.schoolos.io</div>
                         </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
              <button 
                onClick={step === 1 ? () => setActiveTab('landing') : prevStep}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ color: MUTED }}
              >
                <ChevronLeft size={16} /> {step === 1 ? 'Exit Portal' : 'Back'}
              </button>
              
              <div className="flex items-center gap-4">
                {status.message && <span className={`text-xs font-black uppercase tracking-widest ${status.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{status.message}</span>}
                <button 
                  onClick={step === 5 ? handleSubmit : nextStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK, boxShadow: "0 8px 24px rgba(56,25,50,0.2)" }}
                >
                  {isSubmitting ? 'Deploying...' : step === 5 ? 'Launch Platform' : 'Continue'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, placeholder, icon: Icon, type = "text" }) => (
  <div className="space-y-3 group">
    <label className="text-xs font-black uppercase tracking-widest block ml-1 transition-colors" style={{ color: MUTED }}>{label}</label>
    <div className="relative flex items-center">
      <Icon size={16} className="absolute left-4" color={MUTED} />
      <input 
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full bg-white border py-4 pl-12 pr-6 rounded-2xl font-bold text-sm outline-none transition-all shadow-sm focus:border-plum/30"
        style={{ color: PLUM, borderColor: "rgba(56,25,50,0.08)" }}
      />
    </div>
  </div>
);

const SelectGroup = ({ label, name, value, onChange, options }) => (
  <div className="space-y-3">
    <label className="text-xs font-black uppercase tracking-widest block ml-1" style={{ color: MUTED }}>{label}</label>
    <select 
      name={name} value={value} onChange={onChange}
      className="w-full bg-white border py-4 px-6 rounded-2xl font-bold text-sm outline-none transition-all shadow-sm cursor-pointer appearance-none"
      style={{ color: PLUM, borderColor: "rgba(56,25,50,0.08)" }}
    >
      {options.map(opt => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default Signup;

