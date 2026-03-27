import React, { useState, useRef } from 'react';
import {
  Building2, MapPin, Phone, HandHeart, UploadCloud,
  CheckCircle2, ChevronRight, ChevronLeft, Info,
  Link2, FileText, Loader2, ShieldCheck,
  Sparkles,
} from 'lucide-react';
import AIDescribeButton from '../components/ui/AIDescribeButton.jsx';
import FixGrammarButton from '../components/ui/FixGrammarButton.jsx';
import { usePincodeAutoFill } from '../hooks/usePincodeAutoFill.js';

const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/* ─── Input class helper ────────────────────────────────────────────────────── */
const inputCls = (error) =>
  `w-full px-4 py-3 border-2 ${
    error
      ? 'border-red-300 bg-red-50 focus:border-red-400'
      : 'border-gray-100 bg-white hover:border-gray-200 focus:border-green-600'
  } rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-green-50 transition-all font-[inherit] placeholder:text-gray-300`;

/* ─── Steps config ──────────────────────────────────────────────────────────── */
const STEPS = [
  { label: 'Basic Info',   sub: 'NGO details & registration',  Icon: Building2 },
  { label: 'Location',     sub: 'Address & pincode',           Icon: MapPin    },
  { label: 'Contact',      sub: 'Person & social links',       Icon: Phone     },
  { label: 'Services',     sub: 'Your areas of work',          Icon: HandHeart },
  { label: 'Documents',    sub: 'Certificates & verification', Icon: FileText  },
];

/* ─── Small reusable components ─────────────────────────────────────────────── */
const FieldLabel = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
    {children} {required && <span className="text-amber-500 normal-case font-semibold">*</span>}
  </label>
);

const ErrorMsg = ({ msg }) =>
  msg ? <span className="block text-red-500 text-xs mt-1.5 font-medium error-msg">{msg}</span> : null;

const InputField = ({ label, name, type = 'text', placeholder, required = false, value, onChange, error, maxLength, ...rest }) => (
  <div className="mb-5">
    <FieldLabel required={required}>{label}</FieldLabel>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} maxLength={maxLength}
      className={inputCls(error)}
      {...rest}
    />
    <ErrorMsg msg={error} />
  </div>
);

const SelectField = ({ label, name, options, required = false, value, onChange, error }) => (
  <div className="mb-5">
    <FieldLabel required={required}>{label}</FieldLabel>
    <div className="relative">
      <select
        name={name} value={value} onChange={onChange}
        className={`${inputCls(error)} appearance-none cursor-pointer`}
      >
        <option value="">— Select —</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 text-xs">▾</span>
    </div>
    <ErrorMsg msg={error} />
  </div>
);

const FileUploadBox = ({ title, name, optional = false, required = false, onFileSelect, selectedFile, error }) => {
  const fileInputRef = useRef(null);
  return (
    <div>
      <input type="file" ref={fileInputRef} className="hidden"
        onChange={e => { if (e.target.files?.[0]) onFileSelect(name, e.target.files[0]); }}
        accept=".pdf,.jpg,.jpeg,.png" />
      <div
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group
          ${selectedFile ? 'border-green-400 bg-green-50/60' : error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-green-400 hover:bg-green-50/40'}`}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all
          ${selectedFile ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-300 group-hover:bg-green-100 group-hover:text-green-600'}`}>
          {selectedFile ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
        </div>
        <p className="font-semibold text-gray-700 text-sm">
          {title} {required && <span className="text-amber-500">*</span>}
        </p>
        <p className="text-xs text-gray-400 mt-1 break-words">
          {selectedFile
            ? <span className="text-green-700 font-medium">{selectedFile.name}</span>
            : optional ? 'Optional · PDF or JPG' : 'Click to upload · PDF or JPG'}
        </p>
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
};

/* ─── Sidebar ───────────────────────────────────────────────────────────────── */
const Sidebar = ({ currentStep }) => (
  <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 sticky top-0 bg-white border-r border-gray-100 overflow-y-auto" style={{ height: '100vh' }}>
    {/* Brand */}
    <div className="px-7 pt-8 pb-6 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow-sm">
          <HandHeart size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Register Your NGO</p>
          <p className="text-[11px] text-gray-400 mt-0.5">NGO Connect India</p>
        </div>
      </div>
    </div>

    {/* Steps */}
    <div className="flex-1 px-7 py-7">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-6">Your Progress</p>
      {STEPS.map(({ label, sub }, i) => {
        const num = i + 1;
        const done   = num < currentStep;
        const active = num === currentStep;
        return (
          <div key={label} className="flex items-start gap-3.5">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
                ${done   ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                : active ? 'bg-green-700 text-white ring-4 ring-green-100 shadow-sm shadow-green-200'
                :          'bg-gray-100 text-gray-400'}`}>
                {done ? <CheckCircle2 size={14} /> : num}
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-px my-1.5 rounded-full transition-all duration-500"
                  style={{ height: 36, background: num < currentStep ? '#86efac' : '#e5e7eb' }} />
              )}
            </div>
            <div className={`pt-0.5 ${i < STEPS.length - 1 ? 'pb-8' : 'pb-0'}`}>
              <p className={`text-sm font-semibold transition-colors ${active ? 'text-green-800' : done ? 'text-gray-600' : 'text-gray-400'}`}>{label}</p>
              <p className={`text-xs mt-0.5 transition-colors ${active ? 'text-green-500' : 'text-gray-400'}`}>{sub}</p>
            </div>
          </div>
        );
      })}
    </div>

    {/* Trust section */}
    <div className="px-7 py-6 bg-gradient-to-b from-green-50 to-green-50/50 border-t border-green-100">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={12} className="text-green-700" />
        <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest">Why Register?</p>
      </div>
      {['Verified NGO badge on profile', 'Reach thousands of donors', 'Connect with volunteers'].map(t => (
        <div key={t} className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={13} className="text-green-500 shrink-0" />
          <span className="text-xs text-green-800">{t}</span>
        </div>
      ))}
    </div>
  </aside>
);

/* ─── Step Header ───────────────────────────────────────────────────────────── */
const StepHeader = ({ step }) => {
  const { label, sub, Icon } = STEPS[step - 1];
  return (
    <div className="flex items-start gap-4 mb-8">
      <span className="text-[5rem] font-black text-gray-100 leading-none select-none tabular-nums shrink-0" style={{ lineHeight: 1 }}>
        0{step}
      </span>
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
            <Icon size={14} />
          </div>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{sub}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{label}</h2>
        <div className="w-10 h-1 bg-amber-400 rounded-full mt-2" />
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const AddNGOPage = () => {
  const CURRENT_YEAR = new Date().getFullYear();
  const MIN_EST_YEAR = 1800;

  const [currentStep, setCurrentStep]   = useState(1);
  const [isSubmitted, setIsSubmitted]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [apiError, setApiError]         = useState('');
  const [errors, setErrors]             = useState({});

  const [otpSent, setOtpSent]             = useState(false);
  const [otpValue, setOtpValue]           = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading]       = useState(false);
  const [otpError, setOtpError]           = useState('');
  const [otpSuccess, setOtpSuccess]       = useState('');
  const [otpCooldown, setOtpCooldown]     = useState(0);

  const [ngoS3Id] = useState(() => crypto.randomUUID());

  const { fetchPincode, pincodeLoading, pincodeError } = usePincodeAutoFill((info) => {
    setFormData(f => ({ ...f, district: info.district, state: info.state, city: info.city }));
  });

  const [formData, setFormData] = useState({
    ngoName: '', regType: '', regNumber: '', estYear: '', darpanId: '', panNumber: '', description: '',
    state: '', district: '', city: '', address: '', pincode: '',
    contactName: '', contactRole: '', phone: '', whatsapp: '', email: '', website: '', facebook: '', instagram: '',
    services: [], otherService: '',
    registrationCertificate: null, certificate12A: null, certificate80G: null, agreeToTerms: false,
  });

  const totalSteps = 5;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;
    if (name === 'estYear')   nextValue = String(value).replace(/\D/g, '').slice(0, 4);
    if (name === 'phone' || name === 'whatsapp') nextValue = String(value).replace(/\D/g, '').slice(0, 10);
    if (name === 'pincode')   { nextValue = String(value).replace(/\D/g, '').slice(0, 6); fetchPincode(nextValue); }
    if (name === 'panNumber') nextValue = String(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleFileSelect = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
    if (errors.services) setErrors(prev => ({ ...prev, services: '' }));
  };

  /* ── OTP ── */
  const startCooldown = () => {
    setOtpCooldown(60);
    const timer = setInterval(() => {
      setOtpCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Enter valid 10-digit number before sending OTP' })); return;
    }
    setOtpLoading(true); setOtpError(''); setOtpSuccess('');
    try {
      const res  = await fetch(`${API}/api/otp/send-phone`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: formData.phone }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setOtpSent(true); setOtpSuccess('OTP sent! Check your phone.'); startCooldown();
    } catch (err) { setOtpError(err.message); }
    finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 6) { setOtpError('Enter the 6-digit OTP'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res  = await fetch(`${API}/api/otp/verify-phone`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: formData.phone, otp: otpValue }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      setPhoneVerified(true); setOtpSent(false); setOtpSuccess('✓ Phone number verified!'); setOtpError('');
    } catch (err) { setOtpError(err.message); }
    finally { setOtpLoading(false); }
  };

  const handlePhoneChange = (e) => {
    handleInputChange(e);
    if (phoneVerified || otpSent) {
      setPhoneVerified(false); setOtpSent(false); setOtpValue(''); setOtpError(''); setOtpSuccess('');
    }
  };

  /* ── Validation ── */
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.ngoName.trim())   newErrors.ngoName   = 'NGO Name is required';
      if (!formData.regType)          newErrors.regType   = 'Registration Type is required';
      if (!formData.regNumber.trim()) newErrors.regNumber = 'Registration Number is required';
      if (formData.estYear) {
        if (!/^\d{4}$/.test(formData.estYear)) newErrors.estYear = 'Year must be a 4-digit number';
        else { const y = Number(formData.estYear); if (y < MIN_EST_YEAR || y > CURRENT_YEAR) newErrors.estYear = `Year must be between ${MIN_EST_YEAR} and ${CURRENT_YEAR}`; }
      }
    }
    if (step === 2) {
      if (!formData.state)             newErrors.state   = 'State is required';
      if (!formData.city.trim())       newErrors.city    = 'City is required';
      if (!formData.pincode)           newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid 6-digit Pincode';
    }
    if (step === 3) {
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact Name is required';
      if (!formData.contactRole.trim()) newErrors.contactRole = 'Role / Designation is required';
      if (!formData.phone.trim())       newErrors.phone = 'Phone Number is required';
      else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) newErrors.phone = 'Enter valid 10-digit number';
      else if (!phoneVerified) newErrors.phone = 'Please verify your phone number with OTP';
      if (!formData.whatsapp.trim())    newErrors.whatsapp = 'WhatsApp Number is required';
      else if (!/^\d{10}$/.test(formData.whatsapp.replace(/[^0-9]/g, ''))) newErrors.whatsapp = 'Enter valid 10-digit number';
      if (!formData.email.trim())       newErrors.email = 'Email is required';
      else if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Invalid email address';
    }
    if (step === 4) {
      if (formData.services.length === 0 && !formData.otherService.trim())
        newErrors.services = "Select at least one service or specify 'Other'";
    }
    if (step === 5) {
      if (!formData.registrationCertificate) newErrors.registrationCertificate = 'Registration Certificate is required';
      if (!formData.certificate12A)          newErrors.certificate12A           = '12A Certificate is required';
      if (!formData.certificate80G)          newErrors.certificate80G           = '80G Certificate is required';
      if (!formData.agreeToTerms)            newErrors.agreeToTerms             = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector('.error-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const prevStep = () => { setCurrentStep(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); };

  /* ── S3 upload ── */
  const uploadFileToS3 = async (file, location, fieldName) => {
    const uniqueFileName = `${fieldName}_${file.name.replace(/\s/g, '_')}`;
    const res = await fetch('http://localhost:5000/api/s3/generate-upload-url', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ fileName: uniqueFileName, fileType: file.type, location }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Failed to get S3 upload URL'); }
    const { data } = await res.json();
    const s3Res = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!s3Res.ok) throw new Error('Failed to upload file to S3. Please try again.');
    return data.key;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setIsLoading(true); setApiError('');
    try {
      setUploadStatus('Uploading documents (1/3)…');
      const [regCertKey, cert12AKey, cert80GKey] = await Promise.all([
        uploadFileToS3(formData.registrationCertificate, `ngoDocs/${ngoS3Id}`, 'reg-cert'),
        uploadFileToS3(formData.certificate12A,           `ngoDocs/${ngoS3Id}`, 'cert-12a'),
        uploadFileToS3(formData.certificate80G,           `ngoDocs/${ngoS3Id}`, 'cert-80g'),
      ]);
      setUploadStatus('Submitting your application…');
      const response = await fetch('http://localhost:5000/api/ngo/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...formData, ngoS3Id, registrationCertificate: regCertKey, certificate12A: cert12AKey, certificate80G: cert80GKey }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'Failed to submit.');
      setIsSubmitted(true);
    } catch (error) {
      setApiError(error.message || 'Failed to submit. Please check your connection and try again.');
    } finally { setIsLoading(false); setUploadStatus(''); }
  };

  /* ── Success screen ── */
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] p-4">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-xl shadow-gray-100 border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Thank you for registering <strong className="text-gray-700">{formData.ngoName}</strong>.
            Your application is under review. We'll reach out via email shortly.
          </p>
          <button onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-green-200">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen flex bg-green-50">

      {/* ── SIDEBAR ── */}
      <Sidebar currentStep={currentStep} />

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col lg:h-screen lg:overflow-y-auto">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-5 py-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Step {currentStep} / {totalSteps}
            </span>
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">
              {STEPS[currentStep - 1].label}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-700 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
        </div>

        {/* Form area */}
        <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 pt-10 pb-10">

          <StepHeader step={currentStep} />

          {/* ── STEP 1: Basic Info ── */}
          {currentStep === 1 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <InputField label="NGO Name" name="ngoName" required placeholder="e.g. Hope Foundation"
                  value={formData.ngoName} onChange={handleInputChange} error={errors.ngoName} />
                <SelectField label="Registration Type" name="regType" required
                  options={['Public Trust', 'Society', 'Section 8 Company']}
                  value={formData.regType} onChange={handleInputChange} error={errors.regType} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <InputField label="Registration Number" name="regNumber" required placeholder="Reg. No."
                  value={formData.regNumber} onChange={handleInputChange} error={errors.regNumber} />
                <InputField label="Year of Establishment" name="estYear" type="text" placeholder="YYYY"
                  value={formData.estYear} onChange={handleInputChange} error={errors.estYear}
                  maxLength={4} inputMode="numeric" pattern="[0-9]{4}" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <InputField label="NGO Darpan ID" name="darpanId" placeholder="e.g. DL/2021/0000"
                  value={formData.darpanId} onChange={handleInputChange} />
                <InputField label="PAN Number" name="panNumber" placeholder="AAAAA0000A"
                  value={formData.panNumber} onChange={handleInputChange} maxLength={10}
                  style={{ textTransform: 'uppercase' }} />
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Short Description</FieldLabel>
                  <span className="flex gap-1.5">
                    <AIDescribeButton context="ngo" hint={formData.ngoName}
                      onGenerated={v => handleInputChange({ target: { name: 'description', value: v } })} />
                    <FixGrammarButton text={formData.description}
                      onFixed={v => handleInputChange({ target: { name: 'description', value: v } })} />
                  </span>
                </div>
                <textarea name="description"
                  className={`${inputCls(false)} resize-y min-h-[110px]`}
                  placeholder="Briefly describe your mission, vision and key programs…"
                  value={formData.description} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {/* ── STEP 2: Location ── */}
          {currentStep === 2 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <SelectField label="State" name="state" required
                  options={['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry']}
                  value={formData.state} onChange={handleInputChange} error={errors.state} />
                <InputField label="District" name="district" placeholder="District Name"
                  value={formData.district} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <InputField label="City / Locality" name="city" required placeholder="e.g. Vasant Kunj"
                  value={formData.city} onChange={handleInputChange} error={errors.city} />
                <div>
                  <InputField label="Pincode" name="pincode" type="number" required placeholder="110001"
                    value={formData.pincode} onChange={handleInputChange} error={errors.pincode} maxLength={6} />
                  {pincodeLoading && <p className="text-[11px] text-gray-400 -mt-4 mb-4">Fetching location…</p>}
                  {pincodeError   && <p className="text-[11px] text-red-500 -mt-4 mb-4">{pincodeError}</p>}
                </div>
              </div>
              <div className="mb-5">
                <FieldLabel>Registered Address</FieldLabel>
                <textarea name="address" rows="3"
                  className={`${inputCls(false)} resize-y min-h-[90px]`}
                  placeholder="Full street address…"
                  value={formData.address} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Contact ── */}
          {currentStep === 3 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <InputField label="Contact Person Name" name="contactName" required placeholder="Full Name"
                  value={formData.contactName} onChange={handleInputChange} error={errors.contactName} />
                <InputField label="Role / Designation" name="contactRole" required placeholder="e.g. Secretary"
                  value={formData.contactRole} onChange={handleInputChange} error={errors.contactRole} />
              </div>

              {/* Phone + OTP */}
              <div className="mb-5">
                <FieldLabel required>Phone Number</FieldLabel>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange}
                      placeholder="10-digit mobile number" maxLength={10} disabled={phoneVerified}
                      className={`${inputCls(errors.phone)} ${phoneVerified ? 'opacity-60 cursor-not-allowed' : ''}`} />
                  </div>
                  {!phoneVerified && (
                    <button type="button" onClick={handleSendOtp} disabled={otpLoading || otpCooldown > 0}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-500 bg-white hover:bg-gray-50 hover:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed transition-all whitespace-nowrap">
                      {otpLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                      {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                  {phoneVerified && (
                    <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs whitespace-nowrap pt-3.5">
                      <ShieldCheck size={16} /> Verified
                    </span>
                  )}
                </div>
                <ErrorMsg msg={errors.phone} />

                {otpSent && !phoneVerified && (
                  <div className="flex gap-2 mt-3 items-center">
                    <input type="text" value={otpValue}
                      onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                      placeholder="6-digit OTP" maxLength={6}
                      className={`${inputCls(false)} max-w-[160px] tracking-widest font-mono`} />
                    <button type="button" onClick={handleVerifyOtp} disabled={otpLoading}
                      className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-xl text-xs font-bold disabled:opacity-60 transition-colors">
                      {otpLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                      Verify
                    </button>
                  </div>
                )}
                {otpError   && <span className="block text-red-500 text-xs mt-1.5 font-medium">{otpError}</span>}
                {otpSuccess && !otpError && <span className="block text-green-600 text-xs mt-1.5 font-medium">{otpSuccess}</span>}
              </div>

              <InputField label="WhatsApp Number" name="whatsapp" type="number" required
                placeholder="10-digit WhatsApp number"
                value={formData.whatsapp} onChange={handleInputChange} error={errors.whatsapp} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <InputField label="Email Address" name="email" type="email" required
                  placeholder="contact@ngo.org"
                  value={formData.email} onChange={handleInputChange} error={errors.email} />
                <InputField label="Website (Optional)" name="website" type="url"
                  placeholder="https://www.ngo.org"
                  value={formData.website} onChange={handleInputChange} />
              </div>

              <div className="mb-5">
                <FieldLabel>Social Media (Optional)</FieldLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" name="facebook" value={formData.facebook} onChange={handleInputChange}
                      placeholder="Facebook URL" className={`${inputCls(false)} pl-10`} />
                  </div>
                  <div className="relative">
                    <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange}
                      placeholder="Instagram URL" className={`${inputCls(false)} pl-10`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Services ── */}
          {currentStep === 4 && (
            <div>
              <p className="text-sm text-gray-400 mb-6 -mt-2">
                Select all areas where your NGO is actively working.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {[
                  { name: 'Orphan Support',        color: 'blue'   },
                  { name: 'Elderly Care',           color: 'purple' },
                  { name: 'Digital Empowerment',    color: 'cyan'   },
                  { name: 'Health & Medical',       color: 'rose'   },
                  { name: 'Community Welfare',      color: 'amber'  },
                  { name: 'Dignified Last Rites',   color: 'stone'  },
                  { name: 'Women Empowerment',      color: 'pink'   },
                  { name: 'Animal Welfare',         color: 'green'  },
                ].map(({ name, color }) => {
                  const selected = formData.services.includes(name);
                  const dotColor = {
                    blue:   '#3b82f6', purple: '#a855f7', cyan:   '#06b6d4',
                    rose:   '#f43f5e', amber:  '#f59e0b', stone:  '#78716c',
                    pink:   '#ec4899', green:  '#22c55e',
                  }[color];
                  return (
                    <div key={name} onClick={() => handleServiceToggle(name)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${selected
                          ? 'border-green-400 bg-green-50/60 shadow-sm'
                          : `border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 ${errors.services ? 'border-red-200' : ''}`}`}>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 transition-all"
                        style={{ background: selected ? dotColor : '#d1d5db' }} />
                      <span className={`text-sm font-semibold transition-colors ${selected ? 'text-green-800' : 'text-gray-500'}`}>
                        {name}
                      </span>
                      {selected && <CheckCircle2 size={15} className="text-green-600 ml-auto shrink-0" />}
                    </div>
                  );
                })}
              </div>
              {errors.services && <span className="block text-red-500 text-xs mt-2 mb-4 font-medium error-msg">{errors.services}</span>}

              <div className="mb-5 mt-5">
                <FieldLabel>Other Services (Optional)</FieldLabel>
                <input type="text" name="otherService" value={formData.otherService} onChange={handleInputChange}
                  className={inputCls(false)} placeholder="Specify any other services your NGO provides…" />
              </div>
            </div>
          )}

          {/* ── STEP 5: Documents ── */}
          {currentStep === 5 && (
            <div>
              <p className="text-sm text-gray-400 mb-6 -mt-2">
                Upload clear scanned copies or photos of your certificates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <FileUploadBox title="Registration Certificate" name="registrationCertificate" required
                  onFileSelect={handleFileSelect} selectedFile={formData.registrationCertificate}
                  error={errors.registrationCertificate} />
                <FileUploadBox title="12A Certificate" name="certificate12A" required
                  onFileSelect={handleFileSelect} selectedFile={formData.certificate12A}
                  error={errors.certificate12A} />
                <FileUploadBox title="80G Certificate" name="certificate80G" required
                  onFileSelect={handleFileSelect} selectedFile={formData.certificate80G}
                  error={errors.certificate80G} />
              </div>

              {/* Declaration */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <h3 className="text-sm font-bold text-gray-800">Declaration</h3>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
                    className="mt-1 accent-green-700 w-4 h-4 shrink-0 rounded" />
                  <span className="text-sm leading-relaxed text-gray-600">
                    I hereby declare that all information provided above is true and accurate. I agree to the{' '}
                    <a href="#" className="text-green-700 underline underline-offset-2">Privacy Policy</a> and{' '}
                    <a href="#" className="text-green-700 underline underline-offset-2">Terms of Service</a>.
                    {errors.agreeToTerms && <span className="block text-red-500 text-xs mt-1.5 font-medium error-msg">{errors.agreeToTerms}</span>}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {apiError}
            </div>
          )}
        </main>

        {/* ── Bottom nav ── */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-5 sm:px-8 py-4 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <button onClick={prevStep} disabled={currentStep === 1 || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={18} /> Back
            </button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-300 ${i + 1 === currentStep ? 'w-5 h-1.5 bg-green-700' : i + 1 < currentStep ? 'w-1.5 h-1.5 bg-green-400' : 'w-1.5 h-1.5 bg-gray-200'}`} />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <button onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-green-700 hover:bg-green-800 text-white shadow-sm shadow-green-200 transition-all">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {isLoading ? (uploadStatus || 'Submitting…') : 'Submit for Verification'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddNGOPage;