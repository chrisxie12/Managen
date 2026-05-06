import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark
} from 'lucide-react';
import { theme } from '../theme';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('next');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('mtn');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: '',
  });

  const steps = [
    { id: 1, label: 'School Info' },
    { id: 2, label: 'Admin Account' },
    { id: 3, label: 'Choose Plan' },
    { id: 4, label: 'Payment' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!formData.schoolName) newErrors.schoolName = "School name is required";
      if (!formData.schoolAddress) newErrors.schoolAddress = "School address is required";
      if (!formData.schoolPhone) newErrors.schoolPhone = "School phone is required";
      if (!formData.schoolEmail) newErrors.schoolEmail = "School email is required";
    } else if (step === 2) {
      if (!formData.adminName) newErrors.adminName = "Full name is required";
      if (!formData.adminEmail) newErrors.adminEmail = "Email is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 8) newErrors.password = "Min 8 characters required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setDirection('next');
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setDirection('back');
    setStep(prev => prev - 1);
  };

  const handleSetup = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const stepVariants = {
    initial: (direction) => ({
      x: direction === 'next' ? 60 : -60,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction === 'next' ? -60 : 60,
      opacity: 0
    })
  };

  const inputStyle = (error) => ({
    width: '100%',
    padding: '13px 16px 13px 44px',
    background: 'var(--table-header-bg)',
    border: `1px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  });

  const planCards = [
    { id: 'basic', name: 'Basic', price: billing === 'monthly' ? 450 : 2250, students: '300' },
    { id: 'standard', name: 'Standard', price: billing === 'monthly' ? 900 : 4500, students: '800', popular: true },
    { id: 'premium', name: 'Premium', price: billing === 'monthly' ? 1800 : 9000, students: 'Unlimited' },
  ];

  const paymentMethods = [
    { id: 'mtn', label: 'MTN MoMo', icon: Smartphone },
    { id: 'voda', label: 'Vodafone Cash', icon: Smartphone },
    { id: 'tigo', label: 'AirtelTigo', icon: Smartphone },
    { id: 'card', label: 'Bank Card', icon: CreditCard },
    { id: 'bank', label: 'Bank Transfer', icon: Landmark },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <style>{`
        @keyframes beam { 0% { transform: rotate(0deg); opacity: 0; } 10% { opacity: 0.15; } 50% { transform: rotate(180deg); opacity: 0.05; } 90% { opacity: 0.15; } 100% { transform: rotate(360deg); opacity: 0; } }
      `}</style>
      
      {/* Animated Beam */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '200vw',
        height: '4px',
        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        transformOrigin: 'left center',
        animation: 'beam 8s linear infinite',
        filter: 'blur(40px)',
        zIndex: 0,
      }} />

      <motion.div
        animate={Object.keys(errors).length > 0 ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--card-bg)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          borderRadius: '24px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top — Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '28px', background: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>S</div>
            <span style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--text-primary)' }}>SchoolOS</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Get Started Free</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Set up your school in under 60 seconds</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative' }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: step > s.id ? '#10b981' : step === s.id ? '#3b82f6' : 'var(--border)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  border: step === s.id ? '4px solid rgba(59,130,246,0.2)' : 'none',
                }}>
                  {step > s.id ? <Check size={16} /> : s.id}
                </div>
                <span style={{ fontSize: '11px', color: step >= s.id ? 'var(--text-primary)' : 'var(--text-muted)', display: 'none' }}>{s.label}</span>
              </div>
              {i < 3 && (
                <div style={{ flex: 1, height: '2px', background: step > s.id ? '#10b981' : 'var(--border)', margin: '0 10px', marginTop: '-20px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '3px', background: 'var(--border)', borderRadius: '99px', marginBottom: '32px', overflow: 'hidden' }}>
          <motion.div 
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} 
          />
        </div>

        {/* Step Content */}
        <div style={{ minHeight: '320px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {step === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    { name: 'schoolName', label: 'School Name', icon: Building2 },
                    { name: 'schoolAddress', label: 'School Address', icon: MapPin },
                    { name: 'schoolPhone', label: 'School Phone', icon: Phone },
                    { name: 'schoolEmail', label: 'School Email', icon: Mail, type: 'email' },
                  ].map(field => (
                    <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <field.icon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                        <input
                          name={field.name}
                          type={field.type || 'text'}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          style={inputStyle(errors[field.name])}
                        />
                      </div>
                      {errors[field.name] && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors[field.name]}</span>}
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <input name="adminName" value={formData.adminName} onChange={handleInputChange} style={inputStyle(errors.adminName)} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Email</label>
                      <input name="adminEmail" type="email" value={formData.adminEmail} onChange={handleInputChange} style={{ ...inputStyle(errors.adminEmail), paddingLeft: '16px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Phone</label>
                      <input name="adminPhone" value={formData.adminPhone} onChange={handleInputChange} style={{ ...inputStyle(errors.adminPhone), paddingLeft: '16px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} style={inputStyle(errors.password)} />
                      <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#475569' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </div>
                    </div>
                    {/* Strength Indicator */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ 
                          flex: 1, 
                          height: '4px', 
                          borderRadius: '2px', 
                          background: getPasswordStrength(formData.password) >= i 
                            ? ['#ef4444', '#f97316', '#eab308', '#22c55e'][getPasswordStrength(formData.password)-1] 
                            : 'var(--border)' 
                        }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Confirm Password</label>
                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} style={{ ...inputStyle(errors.confirmPassword), paddingLeft: '16px' }} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--table-header-bg)', padding: '4px', borderRadius: '99px', width: 'fit-content', margin: '0 auto 24px' }}>
                    <button onClick={() => setBilling('monthly')} style={{ padding: '6px 16px', borderRadius: '99px', border: 'none', background: billing === 'monthly' ? '#3b82f6' : 'transparent', color: billing === 'monthly' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Monthly</button>
                    <button onClick={() => setBilling('6months')} style={{ padding: '6px 16px', borderRadius: '99px', border: 'none', background: billing === '6months' ? '#3b82f6' : 'transparent', color: billing === '6months' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>6 Months</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {planCards.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: '16px',
                          border: selectedPlan === p.id ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                          background: selectedPlan === p.id ? 'rgba(59,130,246,0.08)' : 'var(--card-bg)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                      >
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{p.name} {p.popular && <span style={{ fontSize: '10px', background: '#3b82f6', padding: '2px 8px', borderRadius: '99px', marginLeft: '4px' }}>POPULAR</span>}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.students} students</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>GHS {p.price}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{billing === 'monthly' ? 'per month' : 'per 6 months'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div style={{ padding: '20px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Plan</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{selectedPlan.toUpperCase()} ({billing})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Amount Due</span>
                      <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>GHS {planCards.find(p => p.id === selectedPlan).price}</span>
                    </div>
                    <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981', fontSize: '12px', textAlign: 'center' }}>
                      7-day free trial included. First charge on May 8, 2026.
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>Pay with</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    {paymentMethods.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => setSelectedPayment(m.id)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '12px',
                          border: selectedPayment === m.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                          background: selectedPayment === m.id ? 'rgba(59,130,246,0.1)' : 'var(--card-bg)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontSize: '11px',
                          color: selectedPayment === m.id ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        <m.icon size={20} style={{ display: 'block', margin: '0 auto 6px' }} />
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          {step > 1 && (
            <button
              onClick={prevStep}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: '#e2e8f0',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button
            onClick={step === 4 ? handleSetup : nextStep}
            disabled={loading}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : step === 4 ? 'Complete Setup' : 'Next Step'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#475569' }}>
          Secured by <span style={{ color: '#3b82f6' }}>Paystack</span> • No charge for 7 days
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Signup;

