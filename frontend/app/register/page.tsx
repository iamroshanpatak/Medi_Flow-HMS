'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hospital, Mail, Lock, User, Phone, MapPin, Calendar, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NepaliDatePicker from '@/components/NepaliDatePicker';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    province: '',
    district: '',
    city: '',
    calendarType: 'BS',
    dateOfBirth: '',
    bsYear: '',
    bsMonth: '',
    bsDay: '',
    gender: '',
    role: 'patient',
    // Patient specific
    bloodGroup: '',
    emergencyContact: '',
    // Doctor specific
    specialization: '',
    licenseNumber: '',
    department: '',
  });

  // Nepal provinces and their districts
  const nepalData = {
    'Koshi Pradesh': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
    'Madhesh Pradesh': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
    'Bagmati Pradesh': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
    'Gandaki Pradesh': ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
    'Lumbini Pradesh': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Palpa', 'Parasi', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'],
    'Karnali Pradesh': ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum West', 'Salyan', 'Surkhet'],
    'Sudurpashchim Pradesh': ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur']
  };

  const [districts, setDistricts] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone validation
    if (formData.phone.length !== 10 || !formData.phone.startsWith('9')) {
      setError('Phone number must be 10 digits starting with 9');
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    setLoading(true);

    try {
      // Only send the fields that the backend expects
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
      };
      await register(registrationData);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If province changes, update districts and reset district selection
    if (name === 'province') {
      setDistricts(nepalData[value as keyof typeof nepalData] || []);
      setFormData({
        ...formData,
        province: value,
        district: '', // Reset district when province changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields (First Name, Last Name, Email, and Password)');
        return;
      }
      
      // Email validation
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address (e.g., example@gmail.com)');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8 animate-slide-in">
          <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 group">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-xl group-hover:bg-blue-700 transition">
              <Hospital className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <span className="text-2xl sm:text-3xl font-bold text-blue-900">MediFlow</span>
              <p className="text-xs sm:text-sm text-gray-600">Healthcare Management</p>
            </div>
          </Link>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 animate-scale-in">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Registration Successful!</p>
              <p className="text-sm text-green-800 mt-1">Redirecting you to your dashboard...</p>
            </div>
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 animate-scale-in">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm sm:text-base text-gray-600">Join MediFlow for better healthcare management</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition ${step >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Basic Info</span>
              </div>
              <div className={`h-1 w-16 transition ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition ${step >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Details</span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-slide-in">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Role Selection */}
                <div className="animate-slide-up">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Register As
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                      className={`p-4 border-2 rounded-lg transition ${formData?.role === 'patient' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                    >
                      <User className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold text-gray-900">Patient</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                      className={`p-4 border-2 rounded-lg transition ${formData?.role === 'doctor' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
                    >
                      <Hospital className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold text-gray-900">Doctor</p>
                    </button>
                  </div>
                </div>

                {/* First Name */}
                <div className="animate-slide-up animate-delay-100">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="John"
                    />
                  </div>
                </div>

                {/* Middle Name & Last Name */}
                <div className="grid grid-cols-2 gap-4 animate-slide-up animate-delay-150">
                  <div>
                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="Kumar"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="Sharma"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="animate-slide-up animate-delay-200">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="example@gmail.com"
                    />
                    {formData.email && (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) ? (
                      <CheckCircle className="absolute inset-y-0 right-0 mr-3 h-5 w-5 text-green-500 my-auto" />
                    ) : (
                      <AlertCircle className="absolute inset-y-0 right-0 mr-3 h-5 w-5 text-red-500 my-auto" />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Must be a valid email format (e.g., name@domain.com)</p>
                </div>

                {/* Password */}
                <div className="animate-slide-up animate-delay-300">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum 8 characters with uppercase, lowercase, number & special character</p>
                </div>

                {/* Confirm Password */}
                <div className="animate-slide-up animate-delay-400">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <p className={`mt-1 text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition font-semibold animate-slide-up animate-delay-500 hover-lift"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition font-medium mb-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Basic Info</span>
                </button>

                {/* Phone */}
                <div className="animate-slide-up">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-gray-300 pr-3">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 text-sm">+977</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          handleChange(e);
                        }
                      }}
                      maxLength={10}
                      pattern="[9][0-9]{9}"
                      className="block w-full pl-24 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                      placeholder="98XXXXXXXX"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                      {formData.phone.length}/10
                    </span>
                  </div>
                  <p className={`mt-1 text-xs ${formData.phone.length === 10 && formData.phone.startsWith('9') ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.phone.length === 10 && formData.phone.startsWith('9') ? '✓ Valid phone number' : 'Enter 10-digit mobile number starting with 9'}
                  </p>
                </div>

                {/* Calendar Type & Date of Birth */}
                <div className="animate-slide-up animate-delay-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth * (Calendar Type)
                  </label>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calendarType: 'BS' })}
                      className={`px-4 py-2 border-2 rounded-lg transition font-semibold ${formData.calendarType === 'BS' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-blue-300'}`}
                    >
                      BS (Bikram Sambat)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calendarType: 'AD' })}
                      className={`px-4 py-2 border-2 rounded-lg transition font-semibold ${formData.calendarType === 'AD' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-blue-300'}`}
                    >
                      AD (English)
                    </button>
                  </div>
                  {formData.calendarType === 'BS' ? (
                    <NepaliDatePicker
                      onDateSelect={(year, month, day) => {
                        setFormData({
                          ...formData,
                          bsYear: year,
                          bsMonth: month,
                          bsDay: day,
                        });
                      }}
                      selectedYear={formData.bsYear}
                      selectedMonth={formData.bsMonth}
                      selectedDay={formData.bsDay}
                    />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        aria-label="Date of Birth"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.calendarType === 'BS' ? 'Click to open calendar and select your date of birth in Bikram Sambat (BS)' : 'Select your date of birth in English calendar'}
                  </p>
                </div>

                {/* Province */}
                <div className="animate-slide-up animate-delay-200">
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="province"
                      name="province"
                      required
                      value={formData.province}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white appearance-none"
                    >
                      <option value="">Select Province</option>
                      {Object.keys(nepalData).map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* District */}
                <div className="animate-slide-up animate-delay-300">
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    id="district"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.province}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {!formData.province && (
                    <p className="mt-1 text-xs text-gray-500">Please select a province first</p>
                  )}
                </div>

                {/* City/Municipality */}
                <div className="animate-slide-up animate-delay-400">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City/Municipality *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="e.g., Kathmandu, Pokhara, Lalitpur"
                  />
                </div>

                {/* Patient-specific fields */}
                {formData?.role === 'patient' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 animate-slide-up animate-delay-500">
                      <div>
                        <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group (Optional)
                        </label>
                        <select
                          id="bloodGroup"
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white appearance-none"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+ (A Positive)</option>
                          <option value="A-">A- (A Negative)</option>
                          <option value="B+">B+ (B Positive)</option>
                          <option value="B-">B- (B Negative)</option>
                          <option value="AB+">AB+ (AB Positive)</option>
                          <option value="AB-">AB- (AB Negative)</option>
                          <option value="O+">O+ (O Positive)</option>
                          <option value="O-">O- (O Negative)</option>
                          <option value="A1+">A1+ (A1 Positive)</option>
                          <option value="A1-">A1- (A1 Negative)</option>
                          <option value="A1B+">A1B+ (A1B Positive)</option>
                          <option value="A1B-">A1B- (A1B Negative)</option>
                          <option value="A2+">A2+ (A2 Positive)</option>
                          <option value="A2-">A2- (A2 Negative)</option>
                          <option value="A2B+">A2B+ (A2B Positive)</option>
                          <option value="A2B-">A2B- (A2B Negative)</option>
                          <option value="Bombay Blood Group">Bombay Blood Group (hh)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 text-sm border-r border-gray-300 pr-2">
                            +977
                          </span>
                          <input
                            type="tel"
                            id="emergencyContact"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleChange}
                            maxLength={10}
                            className="block w-full pl-16 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                            placeholder="98XXXXXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Doctor-specific fields */}
                {formData?.role === 'doctor' && (
                  <>
                    <div className="animate-slide-up animate-delay-500">
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization *
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        required
                        value={formData.specialization}
                        onChange={handleChange}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 animate-slide-up animate-delay-600">
                      <div>
                        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          NMC Registration No. *
                        </label>
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          required
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 bg-white"
                          placeholder="e.g., 12345"
                        />
                        <p className="mt-1 text-xs text-gray-500">Nepal Medical Council Registration</p>
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <select
                          id="department"
                          name="department"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Dermatology">Dermatology</option>
                          <option value="General Medicine">General Medicine</option>
                          <option value="ENT">ENT</option>
                          <option value="Gynecology">Gynecology</option>
                          <option value="Psychiatry">Psychiatry</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex space-x-4 animate-slide-up animate-delay-700">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center animate-fade-in">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
