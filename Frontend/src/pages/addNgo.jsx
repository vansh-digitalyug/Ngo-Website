import React, { useState, useRef } from 'react';
import './addNgo.css';
import {
  Building2,
  MapPin,
  Phone,
  HandHeart,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Facebook,
  Instagram,
  FileText,
  Loader2, // Added for loading state
} from 'lucide-react';

// --- REUSABLE COMPONENTS ---

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  error,
  maxLength,
  ...rest
}) => (
  <div className="form-group">
    <label className="form-label">
      {label} {required && <span className="required-star">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`form-input ${error ? 'error' : ''}`}
      {...rest}
    />
    {error && <span className="error-msg">{error}</span>}
  </div>
);

const SelectField = ({ label, name, options, required = false, value, onChange, error }) => (
  <div className="form-group">
    <label className="form-label">
      {label} {required && <span className="required-star">*</span>}
    </label>
    <div className="select-wrapper">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`form-input form-select ${error ? 'error' : ''}`}
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <span className="select-arrow">▼</span>
    </div>
    {error && <span className="error-msg">{error}</span>}
  </div>
);

// Enhanced File Upload Component
const FileUploadBox = ({ title, name, optional = false, required = false, onFileSelect, selectedFile, error }) => {
  const fileInputRef = useRef(null);

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(name, e.target.files[0]);
    }
  };

  return (
    <div className={`upload-group ${error ? 'error' : ''}`}>
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Visual Box */}
      <div
        className={`upload-box ${selectedFile ? 'file-selected' : ''}`}
        onClick={handleDivClick}
      >
        <div className="upload-icon-wrapper">
          {selectedFile ? <CheckCircle2 size={24} className="success-text" /> : <UploadCloud size={24} />}
        </div>
        <p className="upload-title">
          {title} {required && <span className="required-star">*</span>}
        </p>
        <p className="upload-subtitle">
          {selectedFile
            ? <span className="file-name">{selectedFile.name}</span>
            : (optional ? "(Optional) PDF/JPG" : "Click to upload PDF/JPG")
          }
        </p>
      </div>
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const AddNGOPage = () => {
  const CURRENT_YEAR = new Date().getFullYear();
  const MIN_EST_YEAR = 1800;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});

  // Generate a unique S3 folder ID once when the form loads
  // This is used as the S3 folder name: Uploads/ngoDocs/{ngoS3Id}/filename
  const [ngoS3Id] = useState(() => crypto.randomUUID());

  // State for Form Data
  const [formData, setFormData] = useState({
    // Step 1
    ngoName: '',
    regType: '',
    regNumber: '',
    estYear: '',
    darpanId: '',
    panNumber: '',
    description: '',
    // Step 2
    state: '',
    district: '',
    city: '',
    address: '',
    pincode: '',
    // Step 3
    contactName: '',
    contactRole: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    // Step 4
    services: [],
    otherService: '',
    // Step 5 (Files)
    registrationCertificate: null,
    certificate12A: null,
    certificate80G: null,
    agreeToTerms: false
  });

  const totalSteps = 5;

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;

    if (name === "estYear") {
      // Keep year input strict: numeric-only and max 4 digits.
      nextValue = String(value).replace(/\D/g, "").slice(0, 4);
    }

    if (name === "phone" || name === "whatsapp") {
      // Keep contact numbers numeric-only and max 10 digits.
      nextValue = String(value).replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      // Keep pincode numeric-only and max 6 digits (prevents negative values too).
      nextValue = String(value).replace(/\D/g, "").slice(0, 6);
    }

    if (name === "panNumber") {
      // PAN should be uppercase alphanumeric only.
      nextValue = String(value).replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError(''); // Clear global error on change
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

  // --- VALIDATION ---

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.ngoName.trim()) newErrors.ngoName = "NGO Name is required";
      if (!formData.regType) newErrors.regType = "Registration Type is required";
      if (!formData.regNumber.trim()) newErrors.regNumber = "Registration Number is required";
      if (formData.estYear) {
        if (!/^\d{4}$/.test(formData.estYear)) {
          newErrors.estYear = "Year must be a 4-digit number";
        } else {
          const year = Number(formData.estYear);
          if (year < MIN_EST_YEAR || year > CURRENT_YEAR) {
            newErrors.estYear = `Year must be between ${MIN_EST_YEAR} and ${CURRENT_YEAR}`;
          }
        }
      }
    }

    if (step === 2) {
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.pincode) {
        newErrors.pincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Invalid 6-digit Pincode";
      }
    }

    if (step === 3) {
      if (!formData.contactName.trim()) newErrors.contactName = "Contact Name is required";
      if (!formData.contactRole.trim()) newErrors.contactRole = "Role / Designation is required";

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone Number is required";
      } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
        newErrors.phone = "Enter valid 10-digit number";
      }

      if (!formData.whatsapp.trim()) {
        newErrors.whatsapp = "WhatsApp Number is required";
      } else if (!/^\d{10}$/.test(formData.whatsapp.replace(/[^0-9]/g, ""))) {
        newErrors.whatsapp = "Enter valid 10-digit number";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
    }

    if (step === 4) {
      if (formData.services.length === 0 && !formData.otherService.trim()) {
        newErrors.services = "Select at least one service or specify 'Other'";
      }
    }

    if (step === 5) {
      if (!formData.registrationCertificate) newErrors.registrationCertificate = "Registration Certificate is required";
      if (!formData.certificate12A) newErrors.certificate12A = "12A Certificate is required";
      if (!formData.certificate80G) newErrors.certificate80G = "80G Certificate is required";
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const firstError = document.querySelector('.error-msg');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // --- S3 UPLOAD HELPER ---

  /**
   * Uploads a single file directly to S3 using a backend-generated presigned URL.
   * Returns the S3 key (path) of the stored object.
   */
  const uploadFileToS3 = async (file, location) => {
    // Step 1: Ask backend for a presigned PUT URL
    const res = await fetch("http://localhost:5000/api/s3/generate-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fileName: file.name.replace(/\s/g, "_"),
        fileType: file.type,
        location,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to get S3 upload URL");
    }

    const { data } = await res.json();
    const { uploadUrl, key } = data;

    // Step 2: Upload the raw file binary directly to S3 (bypasses our backend)
    const s3Res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!s3Res.ok) {
      const errText = await s3Res.text();
      console.error("S3 Status:", s3Res.status);
      console.error("S3 Error XML:", errText);
      console.error("File type used:", file.type);
      console.error("Upload URL:", uploadUrl);
      throw new Error("Failed to upload file to S3. Please try again.");
    }

    return key; // S3 key to store in the database
  };

  // --- API SUBMISSION ---

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsLoading(true);
    setApiError('');

    try {
      // Step 1: Upload all 3 certificate files to S3 in parallel
      setUploadStatus('Uploading documents to S3 (1/3)...');
      const [regCertKey, cert12AKey, cert80GKey] = await Promise.all([
        uploadFileToS3(formData.registrationCertificate, `ngoDocs/${ngoS3Id}`),
        uploadFileToS3(formData.certificate12A, `ngoDocs/${ngoS3Id}`),
        uploadFileToS3(formData.certificate80G, `ngoDocs/${ngoS3Id}`),
      ]);

      // Step 2: Submit NGO form with S3 keys (plain JSON — no FormData needed)
      setUploadStatus('Submitting your application...');
      const payload = {
        ...formData,
        ngoS3Id,
        // Replace File objects with their S3 keys
        registrationCertificate: regCertKey,
        certificate12A: cert12AKey,
        certificate80G: cert80GKey,
      };

      const response = await fetch("http://localhost:5000/api/ngo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit. Please check your connection and try again.");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setApiError(error.message || "Failed to submit. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setUploadStatus('');
    }
  };

  // --- RENDER ---

  if (isSubmitted) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2>Submission Received!</h2>
          <p>
            Thank you for registering <strong>{formData.ngoName}</strong>.
            Your application has been submitted for verification.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Hero Header */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Register Your NGO</h1>
          <p>Join India’s largest network of changemakers. Gain visibility, find volunteers, and collaborate for social impact.</p>
        </div>
        <div className="hero-pattern"></div>
      </header>

      {/* Main Card */}
      <main className="main-content">
        <div className="form-card">

          {/* Progress Bar */}
          <div className="progress-header">
            <div className="progress-info">
              <span className="step-count">Step {currentStep} of {totalSteps}</span>
              <span className="step-name">
                {currentStep === 1 && "Basic Info"}
                {currentStep === 2 && "Location"}
                {currentStep === 3 && "Contact"}
                {currentStep === 4 && "Services"}
                {currentStep === 5 && "Documents"}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="form-body">

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="form-step fade-in">
                <div className="section-title">
                  <div className="icon-badge"><Building2 size={24} /></div>
                  <h2>NGO Details</h2>
                </div>

                <div className="form-grid">
                  <InputField label="NGO Name" name="ngoName" required placeholder="e.g. Hope Foundation" value={formData.ngoName} onChange={handleInputChange} error={errors.ngoName} />
                  <SelectField label="Registration Type" name="regType" required options={["Public Trust", "Society", "Section 8 Company"]} value={formData.regType} onChange={handleInputChange} error={errors.regType} />
                </div>

                <div className="form-grid">
                  <InputField label="Registration Number" name="regNumber" required placeholder="Reg. No." value={formData.regNumber} onChange={handleInputChange} error={errors.regNumber} />
                  <InputField
                    label="Year of Est."
                    name="estYear"
                    type="text"
                    placeholder="YYYY"
                    value={formData.estYear}
                    onChange={handleInputChange}
                    error={errors.estYear}
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    title={`Enter a year between ${MIN_EST_YEAR} and ${CURRENT_YEAR}`}
                  />
                </div>

                <div className="form-grid">
                  <InputField label="NGO Darpan ID" name="darpanId" placeholder="e.g. DL/2021/0000" value={formData.darpanId} onChange={handleInputChange} />
                  <InputField
                    label="PAN Number"
                    name="panNumber"
                    placeholder="AAAAA0000A"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    name="description"
                    className="form-input form-textarea"
                    placeholder="Briefly describe your mission..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="form-step fade-in">
                <div className="section-title">
                  <div className="icon-badge"><MapPin size={24} /></div>
                  <h2>Location Details</h2>
                </div>

                <div className="form-grid">
                  <SelectField label="State" name="state" required options={["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"]} value={formData.state} onChange={handleInputChange} error={errors.state} />
                  <InputField label="District" name="district" placeholder="District Name" value={formData.district} onChange={handleInputChange} />
                </div>

                <div className="form-grid">
                  <InputField label="City / Locality" name="city" required placeholder="e.g. Vasant Kunj" value={formData.city} onChange={handleInputChange} error={errors.city} />
                  <InputField label="Pincode" name="pincode" type="number" required placeholder="1100XX" value={formData.pincode} onChange={handleInputChange} error={errors.pincode} maxLength={6} />
                </div>

                <div className="form-group">
                  <label className="form-label">Registered Address</label>
                  <textarea name="address" className="form-input form-textarea" rows="3" placeholder="Full street address..." value={formData.address} onChange={handleInputChange}></textarea>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="form-step fade-in">
                <div className="section-title">
                  <div className="icon-badge"><Phone size={24} /></div>
                  <h2>Contact Information</h2>
                </div>

                <div className="form-grid">
                  <InputField label="Contact Person Name" name="contactName" required placeholder="Full Name" value={formData.contactName} onChange={handleInputChange} error={errors.contactName} />
                  <InputField label="Role / Designation" name="contactRole" required placeholder="e.g. Secretary" value={formData.contactRole} onChange={handleInputChange} error={errors.contactRole} />
                </div>

                <div className="form-grid">
                  <InputField label="Phone Number" name="phone" type="number" required placeholder="Enter 10-digit number" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                  <InputField label="WhatsApp Number" name="whatsapp" type="number" required placeholder="Enter 10-digit number" value={formData.whatsapp} onChange={handleInputChange} error={errors.whatsapp} />
                </div>

                <div className="form-grid">
                  <InputField label="Email Address" name="email" type="email" required placeholder="contact@ngo.org" value={formData.email} onChange={handleInputChange} error={errors.email} />
                  <InputField label="Website (Optional)" name="website" type="url" placeholder="https://www.ngo.org" value={formData.website} onChange={handleInputChange} />
                </div>

                <div className="social-section">
                  <p className="form-label">Social Media Links (Optional)</p>
                  <div className="social-grid">
                    <div className="social-input-wrapper">
                      <Facebook className="social-icon" size={16} />
                      <input
                        type="text"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        placeholder="Facebook URL"
                        className="form-input social-input"
                      />
                    </div>
                    <div className="social-input-wrapper">
                      <Instagram className="social-icon" size={16} />
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                        className="form-input social-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Services */}
            {currentStep === 4 && (
              <div className="form-step fade-in">
                <div className="section-title">
                  <div className="icon-badge"><HandHeart size={24} /></div>
                  <h2>Services Offered</h2>
                </div>

                <p className="helper-text">Select all the areas where your NGO is actively working.</p>

                <div className="services-grid">
                  {[
                    "Orphan Support", "Elderly Care", "Digital Empowerment",
                    "Health & Medical", "Community Welfare", "Dignified Last Rites",
                    "Women Empowerment", "Animal Welfare"
                  ].map((service) => (
                    <div
                      key={service}
                      onClick={() => handleServiceToggle(service)}
                      className={`service-card ${formData.services.includes(service) ? 'selected' : ''} ${errors.services ? 'error' : ''}`}
                    >
                      <div className="checkbox-visual">
                        {formData.services.includes(service) && <CheckCircle2 size={14} />}
                      </div>
                      <span className="service-name">{service}</span>
                    </div>
                  ))}
                </div>
                {errors.services && <span className="error-msg" style={{ marginTop: '-10px', marginBottom: '20px', display: 'block' }}>{errors.services}</span>}

                <div className="form-group other-service">
                  <label className="form-label">Other Services (Optional)</label>
                  <input
                    type="text"
                    name="otherService"
                    value={formData.otherService}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Specify any other services..."
                  />
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div className="form-step fade-in">
                <div className="section-title">
                  <div className="icon-badge"><FileText size={24} /></div>
                  <h2>Documents & Verification</h2>
                </div>

                <div className="form-grid">
                  <FileUploadBox
                    title="Registration Certificate"
                    name="registrationCertificate"
                    required
                    onFileSelect={handleFileSelect}
                    selectedFile={formData.registrationCertificate}
                    error={errors.registrationCertificate}
                  />
                  <FileUploadBox
                    title="12A Certificate"
                    name="certificate12A"
                    required
                    onFileSelect={handleFileSelect}
                    selectedFile={formData.certificate12A}
                    error={errors.certificate12A}
                  />
                  <FileUploadBox
                    title="80G Certificate"
                    name="certificate80G"
                    required
                    onFileSelect={handleFileSelect}
                    selectedFile={formData.certificate80G}
                    error={errors.certificate80G}
                  />
                </div>

                <div className="declaration-box">
                  <h3><Info size={18} /> Declaration</h3>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">
                      I hereby declare that the information provided above is true. I agree to the <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a>.
                      {errors.agreeToTerms && <span className="error-msg d-block">{errors.agreeToTerms}</span>}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Global API Error Message */}
            {apiError && (
              <div className="api-error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#ffebee', padding: '10px', borderRadius: '8px' }}>
                {apiError}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="button-group">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="btn btn-secondary"
              >
                <ChevronLeft size={20} /> Back
              </button>

              {currentStep < 5 ? (
                <button onClick={nextStep} className="btn btn-primary">
                  Next Step <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn btn-submit"
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isLoading && <Loader2 className="animate-spin" size={20} />}
                  {isLoading ? (uploadStatus || 'Submitting...') : 'Submit for Verification'}
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AddNGOPage;
