import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../config/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SellerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    streetAddress: '',
    zipCode: '',
    governmentId: null,
    passport: null,
    selfie: null,
    businessRegNumber: '',
    // Replace bankDetails string with an object
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      bankBranch: '',
      ifscSwiftCode: '',
      bankCountry: ''
    },
    agreeToTerms: false,
    pickupAddress: '',
    pickupLat: '',
    pickupLng: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  // Remove all phone OTP state
  // const [phoneVerified, setPhoneVerified] = useState(false);
  // const [phoneOtp, setPhoneOtp] = useState('');
  // const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Remove sendPhoneOTP and verifyPhoneOTP functions

  // Update handleInputChange to handle nested bankDetails
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name.startsWith('bankDetails.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
      }));
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const sendEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/send-email-otp', { 
        email: formData.email 
      });
      
      setShowEmailOtpInput(true);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/verify-email-otp', { 
        email: formData.email,
        otp: emailOtp 
      });
      
      setEmailVerified(true);
      setShowEmailOtpInput(false);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailVerified) {
      toast.error('Please verify your email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'bankDetails') {
          Object.keys(formData.bankDetails).forEach(bankKey => {
            formDataToSend.append(`bankDetails.${bankKey}`, formData.bankDetails[bankKey]);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post('/api/seller/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Registration successful! Please login to continue.');
        
        // Clear any stored data
        localStorage.clear();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login?type=seller');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <button
          type="button"
          className="mb-4 text-sm text-black hover:underline flex items-center"
          onClick={() => navigate(-1)}
        >
          &#8592; Back
        </button>
        <h2 className="text-3xl font-bold text-center mb-8">Seller Registration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleInputChange}
                className="input-field"
                required
                min="18"
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${emailVerified ? 'input-success' : ''}`}
                    required
                    disabled={emailVerified}
                  />
                  <button
                    type="button"
                    onClick={sendEmailOTP}
                    disabled={emailVerified || loading || !formData.email}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {emailVerified ? 'Verified ✓' : 'Send OTP'}
                  </button>
                </div>
                {showEmailOtpInput && !emailVerified && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Email OTP"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={verifyEmailOTP}
                      disabled={loading || !emailOtp}
                      className="btn-secondary"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>
              {/* Only keep phone number input, remove OTP UI */}
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Pickup Address & Geolocation */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Pickup Address (for delivery)</h3>
            <input
              type="text"
              name="pickupAddress"
              placeholder="Pickup Address"
              value={formData.pickupAddress}
              onChange={handleInputChange}
              className="input-field"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="pickupLat"
                placeholder="Pickup Latitude"
                value={formData.pickupLat}
                onChange={handleInputChange}
                className="input-field"
                required
                step="any"
              />
              <input
                type="number"
                name="pickupLng"
                placeholder="Pickup Longitude"
                value={formData.pickupLng}
                onChange={handleInputChange}
                className="input-field"
                required
                step="any"
              />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Login Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State/City"
                value={formData.state}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="streetAddress"
                placeholder="Street Address"
                value={formData.streetAddress}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="zipCode"
                placeholder="ZIP/Postal Code (optional)"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Identity Verification */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Identity Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Government ID (NIN)</label>
                <input
                  type="file"
                  name="governmentId"
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  accept="image/*,.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passport</label>
                <input
                  type="file"
                  name="passport"
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  accept="image/*,.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selfie</label>
                <input
                  type="file"
                  name="selfie"
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  accept="image/*"
                />
              </div>
              <input
                type="text"
                name="businessRegNumber"
                placeholder="Business Registration Number"
                value={formData.businessRegNumber}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="bankDetails.accountHolderName"
                placeholder="Account Holder Name"
                value={formData.bankDetails.accountHolderName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="bankDetails.bankName"
                placeholder="Bank Name"
                value={formData.bankDetails.bankName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="bankDetails.accountNumber"
                placeholder="Account Number"
                value={formData.bankDetails.accountNumber}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="bankDetails.bankBranch"
                placeholder="Bank Branch"
                value={formData.bankDetails.bankBranch}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="bankDetails.ifscSwiftCode"
                placeholder="IFSC/SWIFT Code"
                value={formData.bankDetails.ifscSwiftCode}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="bankDetails.bankCountry"
                placeholder="Bank Country"
                value={formData.bankDetails.bankCountry}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4"
                required
              />
              <label className="text-sm">
                I agree to the Terms & Conditions and Privacy Policy
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !emailVerified || !formData.agreeToTerms}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Register as Seller'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegister; 