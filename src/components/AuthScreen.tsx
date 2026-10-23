import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Zap, Fuel, Car, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (profileName: string, vehicleType: 'EV' | 'CNG' | 'BOTH') => void;
  onContinueAsDemo: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onContinueAsDemo }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedDriveType, setSelectedDriveType] = useState<'EV' | 'CNG' | 'BOTH'>('EV');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const name = authMode === 'SIGNUP' && fullName.trim() ? fullName.trim() : 'Aakash Varier';
    onLogin(name, selectedDriveType);
  };

  return (
    <div className="min-h-screen bg-[#031815] text-[#F6F1E8] flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto my-auto py-8 space-y-8">
        {/* Routiq Logo Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-3xl bg-[#07130F] border-2 border-[#25C269]/40 shadow-2xl">
            <img
              src="/routiq_logo.png"
              alt="Routiq Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Routiq
          </h1>
          <p className="text-sm font-semibold text-[#25C269]">
            Smarter Routes. Greener Journeys.
          </p>
          <p className="text-xs text-[#F6F1E8]/60 max-w-xs mx-auto">
            Unified Indian smart-mobility layer connecting EV charging, CNG queues and intelligent corridor planning.
          </p>
        </div>

        {/* Auth Mode Toggle: Log In / Create Profile */}
        <div className="bg-[#07130F] border border-[#25C269]/25 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex p-1 bg-[#031815] rounded-xl border border-[#062B25]">
            <button
              onClick={() => {
                setAuthMode('LOGIN');
                setOtpSent(false);
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                authMode === 'LOGIN'
                  ? 'bg-[#25C269] text-[#07130F] shadow'
                  : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthMode('SIGNUP');
                setOtpSent(false);
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                authMode === 'SIGNUP'
                  ? 'bg-[#25C269] text-[#07130F] shadow'
                  : 'text-[#F6F1E8]/70 hover:text-white'
              }`}
            >
              Create Profile
            </button>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {authMode === 'SIGNUP' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/70">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aakash Varier"
                    className="w-full px-4 py-3 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-sm text-white placeholder-[#F6F1E8]/40 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/70">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 bg-[#031815] border border-[#062B25] rounded-xl text-sm font-mono text-[#F6F1E8]/70">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full px-4 py-3 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-sm text-white font-mono placeholder-[#F6F1E8]/40 focus:outline-none"
                  />
                </div>
              </div>

              {authMode === 'SIGNUP' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/70">
                    Primary Mobility Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDriveType('EV')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedDriveType === 'EV'
                          ? 'border-[#168BDB] bg-[#168BDB]/20 text-[#168BDB] font-bold'
                          : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60 hover:text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 mx-auto mb-1 fill-current" />
                      <span className="text-xs">EV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDriveType('CNG')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedDriveType === 'CNG'
                          ? 'border-[#25C269] bg-[#25C269]/20 text-[#25C269] font-bold'
                          : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60 hover:text-white'
                      }`}
                    >
                      <Fuel className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">CNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDriveType('BOTH')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedDriveType === 'BOTH'
                          ? 'border-[#F3C45B] bg-[#F3C45B]/20 text-[#F3C45B] font-bold'
                          : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/60 hover:text-white'
                      }`}
                    >
                      <Car className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">Both</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={phoneNumber.length < 10}
                className="w-full py-3.5 bg-[#25C269] hover:bg-[#25C269]/90 disabled:opacity-40 text-[#07130F] font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Continue with OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#F6F1E8]/70">
                    Enter 4-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-[#25C269] hover:underline"
                  >
                    Edit Phone
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full px-4 py-3 text-center tracking-widest text-2xl font-mono bg-[#031815] border border-[#25C269] rounded-xl text-white focus:outline-none"
                />
                <p className="text-[11px] text-[#F6F1E8]/50 text-center">
                  Sent to +91 {phoneNumber} (Demo OTP: Any 4 digits, e.g. 1234)
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Verify &amp; Enter Routiq</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Access Button */}
          <div className="pt-4 border-t border-[#062B25] text-center space-y-2">
            <span className="text-xs text-[#F6F1E8]/50 block">or explore immediately</span>
            <button
              onClick={onContinueAsDemo}
              className="w-full py-3 bg-[#031815] hover:bg-[#062B25] border border-[#25C269]/40 hover:border-[#25C269] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#25C269]" />
              <span>Continue as Demo User</span>
            </button>
          </div>
        </div>

        {/* Security / Privacy reassurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#F6F1E8]/50">
          <ShieldCheck className="w-4 h-4 text-[#25C269]" />
          <span>Encrypted Session · DPDP Act 2023 Compliant</span>
        </div>
      </div>
    </div>
  );
};
