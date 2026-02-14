import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { useAuth } from '../hooks/useAuth';
import { validationService } from '../services/authService';

export const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fieldTouched, setFieldTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const emailVal = validationService.validateEmail(email);
    if (!emailVal.valid) {
      setErrors({ email: emailVal.error });
      setFieldTouched({ email: true });
      return;
    }

    const passwordVal = validationService.validatePassword(password);
    if (!passwordVal.valid) {
      setErrors({ password: passwordVal.error });
      setFieldTouched({ password: true });
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setErrors({ submit: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="mx-auto mt-8 mb-20 w-full max-w-md">
        <div className="bg-[#0F172A]/80 border border-white/10 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-6">Sign in to continue to SkillSwap</p>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded mb-6">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.email && fieldTouched.email
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && fieldTouched.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 bg-[#020617] rounded-lg focus:outline-none transition ${
                  errors.password && fieldTouched.password
                    ? 'border-2 border-red-500'
                    : 'border border-white/20 focus:border-accent'
                }`}
                placeholder="••••••"
                disabled={isLoading}
              />
              {errors.password && fieldTouched.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent hover:underline font-medium">
                Sign Up
              </Link>
            </p>

            {/* Forgot Password (Future) */}
            <p className="text-center text-sm text-gray-500">
              <button type="button" className="text-gray-500 hover:text-gray-400">
                Forgot password?
              </button>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};
