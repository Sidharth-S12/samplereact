import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { useAuth } from '../hooks/useAuth';
import { validationService } from '../services/authService';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    offer: '',
    learn: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fieldTouched, setFieldTouched] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validSkills = validationService.getValidSkills();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'name':
        const nameVal = validationService.validateName(formData.name);
        if (!nameVal.valid) newErrors.name = nameVal.error;
        else delete newErrors.name;
        break;
      case 'email':
        const emailVal = validationService.validateEmail(formData.email);
        if (!emailVal.valid) newErrors.email = emailVal.error;
        else delete newErrors.email;
        break;
      case 'password':
        const passVal = validationService.validatePassword(formData.password);
        if (!passVal.valid) newErrors.password = passVal.error;
        else delete newErrors.password;
        break;
      case 'confirmPassword':
        if (formData.confirmPassword !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'offer':
        const offerVal = validationService.validateSkill(formData.offer);
        if (!offerVal.valid) newErrors.offer = offerVal.error;
        else delete newErrors.offer;
        break;
      case 'learn':
        const learnVal = validationService.validateSkill(formData.learn);
        if (!learnVal.valid) newErrors.learn = learnVal.error;
        else delete newErrors.learn;
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllFields = () => {
    const newErrors = {};
    
    const nameVal = validationService.validateName(formData.name);
    if (!nameVal.valid) newErrors.name = nameVal.error;
    
    const emailVal = validationService.validateEmail(formData.email);
    if (!emailVal.valid) newErrors.email = emailVal.error;
    
    const passVal = validationService.validatePassword(formData.password);
    if (!passVal.valid) newErrors.password = passVal.error;
    
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    const offerVal = validationService.validateSkill(formData.offer);
    if (!offerVal.valid) newErrors.offer = offerVal.error;
    
    const learnVal = validationService.validateSkill(formData.learn);
    if (!learnVal.valid) newErrors.learn = learnVal.error;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }

    setIsLoading(true);

    const result = await signup(
      formData.email,
      formData.password,
      formData.name,
      formData.offer,
      formData.learn
    );

    if (result.success) {
      // Auto-logout after signup (as per original flow)
      setTimeout(() => {
        navigate('/signin', { state: { message: 'Account created! Please sign in.' } });
      }, 500);
    } else {
      setErrors({ submit: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="mx-auto mt-8 mb-20 w-full max-w-md">
        <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400 mb-6">Join SkillSwap and start learning & teaching</p>

          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.name && fieldTouched.name
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
                placeholder="John Doe"
              />
              {errors.name && fieldTouched.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.email && fieldTouched.email
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && fieldTouched.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.password && fieldTouched.password
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
                placeholder="••••••"
              />
              {errors.password && fieldTouched.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.confirmPassword && fieldTouched.confirmPassword
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
                placeholder="••••••"
              />
              {errors.confirmPassword && fieldTouched.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Skill to Offer */}
            <div>
              <label className="block text-sm font-medium mb-2">Skill You Can Teach *</label>
              <select
                name="offer"
                value={formData.offer}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.offer && fieldTouched.offer
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
              >
                <option value="">Select a skill</option>
                {validSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              {errors.offer && fieldTouched.offer && (
                <p className="text-red-400 text-sm mt-1">{errors.offer}</p>
              )}
            </div>

            {/* Skill to Learn */}
            <div>
              <label className="block text-sm font-medium mb-2">Skill You Want to Learn *</label>
              <select
                name="learn"
                value={formData.learn}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.learn && fieldTouched.learn
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
              >
                <option value="">Select a skill</option>
                {validSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              {errors.learn && fieldTouched.learn && (
                <p className="text-red-400 text-sm mt-1">{errors.learn}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-400">
              Already have an account?{' '}
              <Link to="/signin" className="text-accent hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};
