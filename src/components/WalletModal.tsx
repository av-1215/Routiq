import React, { useState } from 'react';
import { Wallet, WalletTransaction } from '../types';
import {
  X,
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Info
} from 'lucide-react';

interface WalletModalProps {
  wallet: Wallet;
  onClose: () => void;
  onDeposit: (amount: number, upiId: string) => void;
  onWithdraw?: (amount: number, bankAccount: string, ifsc: string) => boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  wallet,
  onClose,
  onDeposit,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPOSIT' | 'WITHDRAW_RESTRICTED'>('OVERVIEW');

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [upiId, setUpiId] = useState<string>('driver@okhdfcbank');
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);

  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    onDeposit(depositAmount, upiId);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setActiveTab('OVERVIEW');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#07130F] border border-[#25C269]/40 rounded-3xl shadow-2xl p-6 overflow-hidden my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#F6F1E8]/50 hover:text-white rounded-xl hover:bg-[#031815] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#031815] border-2 border-[#25C269] text-[#25C269] flex items-center justify-center shadow-inner">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Routiq Mobility Wallet</h3>
            <p className="text-xs text-[#F6F1E8]/70">
              One unified balance across all Indian CPOs (Tata Power, Jio-bp, Shell, Ather) &amp; CNG networks.
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4 bg-[#031815] rounded-2xl border border-[#062B25] mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#F6F1E8]/60 font-semibold uppercase tracking-wider">
              Available Mobility Balance
            </span>
            <span className="text-[11px] text-[#25C269] font-mono font-bold">Auto-settling</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              ₹{wallet.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-[#062B25] flex items-center justify-between text-xs text-[#F6F1E8]/70">
            <span>Active Reservation Holds</span>
            <span className="font-mono text-[#F3C45B] font-semibold">
              ₹{wallet.reservedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#062B25] pb-3 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-1 transition-colors ${
              activeTab === 'OVERVIEW' ? 'text-[#25C269] border-b-2 border-[#25C269]' : 'text-[#F6F1E8]/60 hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className={`pb-1 transition-colors ${
              activeTab === 'DEPOSIT' ? 'text-[#25C269] border-b-2 border-[#25C269]' : 'text-[#F6F1E8]/60 hover:text-white'
            }`}
          >
            Add Money (UPI)
          </button>
          <button
            onClick={() => setActiveTab('WITHDRAW_RESTRICTED')}
            className={`pb-1 transition-colors flex items-center gap-1 ${
              activeTab === 'WITHDRAW_RESTRICTED' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-[#F6F1E8]/60 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Withdrawals (Restricted)</span>
          </button>
        </div>

        {/* Tab 1: Transaction History */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F6F1E8]/60 uppercase tracking-wider">Recent Activity</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {wallet.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-[#031815] rounded-xl border border-[#062B25] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-[#25C269]/20 text-[#25C269]'
                          : tx.type === 'RESERVATION_HOLD'
                          ? 'bg-[#F3C45B]/20 text-[#F3C45B]'
                          : 'bg-[#07130F] text-[#F6F1E8]'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{tx.description}</div>
                      <div className="text-[11px] text-[#F6F1E8]/50">
                        {tx.timestamp} · Receipt: <span className="font-mono text-[#F6F1E8]/70">{tx.receiptId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        tx.type === 'DEPOSIT' ? 'text-[#25C269]' : 'text-white'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}₹{tx.amount.toFixed(0)}
                    </span>
                    <div className="text-[10px] text-[#F6F1E8]/40 capitalize">{tx.status.toLowerCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Add Money (UPI Deposit) */}
        {activeTab === 'DEPOSIT' && (
          <form onSubmit={handleExecuteDeposit} className="space-y-4 text-xs">
            {depositSuccess && (
              <div className="p-3 bg-[#25C269]/15 border border-[#25C269] text-[#25C269] rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#25C269]" />
                <span>₹{depositAmount} successfully credited via UPI Instant Mandate!</span>
              </div>
            )}

            <div>
              <label className="text-[#F6F1E8]/70 block mb-1 font-bold">Select Amount to Add</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      depositAmount === amt
                        ? 'border-[#25C269] bg-[#25C269]/20 text-[#25C269]'
                        : 'border-[#062B25] bg-[#031815] text-[#F6F1E8]/70 hover:text-white'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="100"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#F6F1E8]/70 block mb-1 font-bold">Virtual Payment Address (UPI VPA)</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mobile@paytm or username@okhdfcbank"
                className="w-full p-2.5 bg-[#031815] border border-[#062B25] focus:border-[#25C269] rounded-xl text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="text-[11px] text-[#F6F1E8]/50 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25C269]" />
              <span>Zero gateway markup. Instant availability across all Indian charging bays and CNG queues.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#25C269] hover:bg-[#25C269]/90 text-[#07130F] font-black rounded-xl transition-all shadow-lg"
            >
              Add ₹{depositAmount} to Mobility Balance
            </button>
          </form>
        )}

        {/* Tab 3: Withdrawals Strictly Prohibited by Policy */}
        {activeTab === 'WITHDRAW_RESTRICTED' && (
          <div className="space-y-4 text-xs py-2">
            <div className="p-4 bg-amber-950/40 border-2 border-[#F3C45B]/60 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-[#F3C45B]">
                <Lock className="w-5 h-5 shrink-0" />
                <h4 className="font-extrabold text-white text-sm">
                  Account Withdrawals Are Not Allowed
                </h4>
              </div>

              <p className="text-[#F6F1E8]/80 leading-relaxed text-xs">
                In strict compliance with <strong>Routiq Mobility Account Policies</strong> and <strong>RBI Closed-Loop Utility Prepayment Guidelines</strong>, account withdrawals to external bank accounts are <strong>not permitted</strong>.
              </p>

              <div className="p-3 bg-[#031815] rounded-xl border border-[#062B25] space-y-1.5">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                  Permitted Balance Utilization
                </span>
                <ul className="space-y-1 text-[11px] text-[#F6F1E8]/70 list-disc list-inside">
                  <li>Instant EV charging bay reservations (15-min hold guarantee)</li>
                  <li>CNG Virtual Green Window priority line allocation</li>
                  <li>Automated optical QR contactor check-ins at public chargers</li>
                  <li>Smart corridor transit and energy offset passes</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#F3C45B] pt-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Your funds never expire and remain 100% usable at all supported stations nationwide.</span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-3 bg-[#031815] border border-red-500/30 text-red-400/60 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Withdrawals Disabled by Policy</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
