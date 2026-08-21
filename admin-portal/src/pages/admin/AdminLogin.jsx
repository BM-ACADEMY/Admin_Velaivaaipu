import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [adminId, setAdminId] = useState('');
  
  const { adminLogin, verifyAdminOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (showOtpInput) {
        const res = await verifyAdminOtp(adminId, otp);
        if (res.success) {
          toast.success('Welcome back, Admin');
          navigate(res.redirect);
        } else {
          toast.error(res.msg || 'OTP verification failed');
        }
      } else {
        const res = await adminLogin(email, password);
        
        if (res.success && res.require2FA) {
          setAdminId(res.adminId);
          setShowOtpInput(true);
          toast.success('OTP sent to your email');
        } else if (res.success) {
          toast.success('Welcome back, Admin');
          navigate(res.redirect);
        } else {
          toast.error(res.msg || 'Login failed');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle geometric background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-emerald-100/40 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-slate-200/40 blur-[80px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="text-emerald-600 w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-[#0f172a] tracking-tight">
          Admin Control
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Authorized platform management personnel only.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-4 shadow-xl shadow-slate-200/50 border border-slate-100 sm:rounded-[32px] sm:px-12">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {!showOtpInput ? (
              <>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Identity Credentials
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-4 h-12 border border-slate-200 bg-white rounded-xl shadow-sm placeholder-slate-300 text-slate-900 focus:outline-none focus:ring-0 focus:border-emerald-600 sm:text-sm transition-all font-medium"
                      placeholder="admin@ct.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Secure Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-4 pr-11 h-12 border border-slate-200 bg-white rounded-xl shadow-sm placeholder-slate-300 text-slate-900 focus:outline-none focus:ring-0 focus:border-emerald-600 sm:text-sm transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  2FA OTP Verification
                </label>
                <p className="text-xs text-slate-500 mb-2 ml-1">Enter the 4-digit OTP sent to your email.</p>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-4 h-12 border border-slate-200 bg-white rounded-xl shadow-sm placeholder-slate-300 text-slate-900 focus:outline-none focus:ring-0 focus:border-emerald-600 sm:text-lg text-center tracking-widest font-mono transition-all font-bold"
                    placeholder="0000"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-emerald-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Authorize Access'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-12 text-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
              CT Security Infrastructure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
