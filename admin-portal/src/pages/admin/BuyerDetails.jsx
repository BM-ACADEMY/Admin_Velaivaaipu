import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, RefreshCw, CreditCard, Calendar, User, Mail, Shield,
  CheckCircle2, AlertTriangle, XCircle, FileText, ChevronRight,
  Sparkles, Clock, Check, Award, Printer, Download, X, Activity
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const featureLabels = {
  // Jobseeker
  hasResumeBuilder: 'AI Resume Builder',
  hasProfileBoost: 'Profile Boost',
  hasProfileViewInsights: 'Profile View Insights',
  hasMessageRecruiters: 'Direct Messaging',
  hasCareerCounselling: 'Career Counselling',
  hasInterviewPrep: 'Interview Prep',
  hasPriorityBadge: 'Priority Profile Badge',
  hasSalaryBenchmarking: 'Salary Benchmarking',
  hasAiResumeReview: 'AI Resume Review',

  // Recruiter
  hasATSPipeline: 'ATS Pipeline',
  hasAnalyticsDashboard: 'Analytics Dashboard',
  hasCandidateDBExport: 'Candidate DB Export',
  hasBulkMessaging: 'Bulk Candidate Messaging',
  hasVideoInterview: 'Video Interview Scheduling',
  hasPriorityListing: 'Priority Job Listing',
  hasAICandidateMatching: 'AI Candidate Matching',

  // Organization
  hasBulkApplicantManagement: 'Bulk Application Management',
  hasInterviewScheduling: 'Interview Scheduling',
  hasDedicatedOnboarding: 'Dedicated Onboarding Support'
};

const BuyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [billingSettings, setBillingSettings] = useState({
    billingName: 'Velaivaaipu Tech Private Limited',
    gstNumber: '33AAECV1209F1Z4',
    gstPercentage: 18,
    address: '12, MG Road, Shastri Nagar, Adyar, Chennai, Tamil Nadu',
    pincode: '600020',
    email: 'support@velaivaaipu.com',
    phone: '+91 99445 09441'
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchBuyerDetails();
    fetchBillingSettings();
  }, [id]);

  const fetchBuyerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/payments/admin/buyers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      console.error('Error fetching buyer details:', error);
      toast.error('Failed to load buyer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`);
      if (res.data) {
        setBillingSettings({
          billingName: res.data.billingName || 'Velaivaaipu Tech Private Limited',
          gstNumber: res.data.gstNumber || '33AAECV1209F1Z4',
          gstPercentage: res.data.gstPercentage ?? 18,
          address: res.data.address || '12, MG Road, Shastri Nagar, Adyar, Chennai, Tamil Nadu',
          pincode: res.data.pincode || '600020',
          email: res.data.email || 'support@velaivaaipu.com',
          phone: res.data.phone || '+91 99445 09441'
        });
      }
    } catch (error) {
      console.error('Error fetching billing settings:', error);
    }
  };

  const calculateExpiryDate = (createdAt, duration, quantity = 1) => {
    if (!createdAt || !duration) return null;
    const date = new Date(createdAt);
    const qty = Number(quantity) || 1;
    if (duration === 'Monthly') {
      date.setMonth(date.getMonth() + qty);
    } else if (duration === 'Quarterly') {
      date.setMonth(date.getMonth() + (3 * qty));
    } else if (duration === 'Yearly') {
      date.setFullYear(date.getFullYear() + qty);
    } else if (duration === 'Lifetime') {
      date.setFullYear(date.getFullYear() + 100);
    }
    return date;
  };

  const handlePrint = (invoice, user) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      toast.error('Please allow popups to download the invoice PDF.');
      return;
    }

    const expiryDate = calculateExpiryDate(invoice.createdAt, invoice.plan?.duration, invoice.quantity);
    const formattedExpiry = invoice.plan?.duration === 'Lifetime' ? 'Lifetime Access' : (
      expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
    );
    const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const cgst = (invoice.gstAmount / 2).toFixed(2);
    const sgst = (invoice.gstAmount / 2).toFixed(2);

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice._id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; padding: 40px; margin: 0; line-height: 1.5; font-size: 13px; background: white; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; gap: 12px; }
            .logo-box { width: 36px; height: 36px; background: #059669; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
            .brand-name { font-weight: 900; font-size: 18px; color: #0f172a; }
            .brand-name span { color: #059669; }
            .subtitle { font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
            .invoice-title-section { text-align: right; }
            .invoice-title { font-weight: 900; font-size: 24px; color: #0f172a; text-transform: uppercase; margin: 0; }
            .invoice-num { font-family: monospace; color: #64748b; font-size: 11px; margin-top: 4px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
            .details-block p { margin: 4px 0; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 16px 0; margin-bottom: 40px; }
            .meta-item { font-size: 12px; }
            .meta-label { font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px; }
            .meta-val { font-weight: 600; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 16px; text-transform: uppercase; font-size: 10px; font-weight: bold; color: #64748b; text-align: left; }
            td { padding: 16px; border-bottom: 1px solid #f1f5f9; text-align: left; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .totals-table { width: 320px; margin: 0; }
            .totals-table td { padding: 8px 16px; border: none; }
            .totals-table tr.grand-total td { font-weight: 900; font-size: 15px; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .declaration { border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 10px; color: #94a3b8; line-height: 1.6; }
            .declaration-title { font-weight: bold; color: #64748b; margin-bottom: 6px; }
            .footer-sign { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <div class="logo-box">V</div>
              <div>
                <div class="brand-name">Velaivaai<span>pu</span></div>
                <div class="subtitle">Professional Hub</div>
              </div>
            </div>
            <div class="invoice-title-section">
              <h1 class="invoice-title">Tax Invoice</h1>
              <div class="invoice-num">Invoice No: INV/${new Date(invoice.createdAt).getFullYear()}/${invoice._id.slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-block">
              <div class="section-title">Billed From</div>
              <p style="font-weight: bold; color: #0f172a;">${billingSettings.billingName}</p>
              <p>${billingSettings.address}</p>
              <p>Pincode: ${billingSettings.pincode || ''}</p>
              <p style="font-family: monospace; margin-top: 8px;">GSTIN: ${billingSettings.gstNumber}</p>
              <p>Email: ${billingSettings.email}</p>
              <p>Phone: ${billingSettings.phone}</p>
            </div>
            <div class="details-block">
              <div class="section-title">Billed To (Recipient)</div>
              <p style="font-weight: bold; color: #0f172a;">${user.name}</p>
              ${user.display_id ? `<p style="font-family: monospace;">ID: ${user.display_id}</p>` : ''}
              <p>Email: ${user.email}</p>
              <p style="text-transform: capitalize;">Account Type: ${user.role?.name || user.role}</p>
              <p style="margin-top: 8px;">Payment Mode: ${invoice.paymentMethod || 'Razorpay'}</p>
              <p style="font-family: monospace;">Payment ID: ${invoice.razorpay_payment_id || 'N/A'}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Invoice Date</span>
              <span class="meta-val">${invoiceDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Due Date</span>
              <span class="meta-val">Paid (Immediate)</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Period Start</span>
              <span class="meta-val">${invoiceDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Period End</span>
              <span class="meta-val">${formattedExpiry}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Description</th>
                <th class="text-center">SAC Code</th>
                <th class="text-right">Unit Price</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p style="font-weight: bold; color: #0f172a; margin: 0;">${invoice.plan?.name || 'N/A'} Subscription Plan</p>
                  <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 0 0;">Duration: ${invoice.plan?.duration || 'N/A'}</p>
                </td>
                <td class="text-center" style="font-family: monospace;">998311</td>
                <td class="text-right">₹${invoice.baseAmount?.toLocaleString() || 0}</td>
                <td class="text-center">${invoice.quantity || 1}</td>
                <td class="text-right" style="font-weight: bold; color: #0f172a;">₹${invoice.baseAmount?.toLocaleString() || 0}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td style="color: #64748b;">Taxable Amount (Base):</td>
                <td class="text-right">₹${invoice.baseAmount?.toLocaleString() || 0}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">CGST (${(billingSettings.gstPercentage / 2)}%):</td>
                <td class="text-right">₹${cgst}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">SGST (${(billingSettings.gstPercentage / 2)}%):</td>
                <td class="text-right">₹${sgst}</td>
              </tr>
              <tr class="grand-total">
                <td>Total Amount (Incl. GST):</td>
                <td class="text-right">₹${invoice.amount?.toLocaleString() || 0}</td>
              </tr>
            </table>
          </div>

          <div class="declaration">
            <div class="declaration-title">Declaration & Terms:</div>
            <p style="margin: 4px 0;">1. This is a computer-generated invoice and does not require physical signature or rubber stamp.</p>
            <p style="margin: 4px 0;">2. The services rendered are classified under SAC code 998311 (Job Portal & Recruitment Services).</p>
            <p style="margin: 4px 0;">3. All payment amounts shown are inclusive of GST as configured.</p>
          </div>

          <div class="footer-sign">
            <span>Velaivaaipu Support Team</span>
            <span>System Authenticated</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Retrieving buyer ledger...</p>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="mx-auto text-amber-500" size={48} />
        <h2 className="text-xl font-bold text-slate-900">Buyer Not Found</h2>
        <p className="text-slate-500">The requested buyer details could not be loaded or the user does not exist.</p>
        <Button onClick={() => navigate('/admin/subscriptions/buyers')} className="bg-slate-900 text-white rounded-xl">
          Back to Directory
        </Button>
      </div>
    );
  }

  const { user, payments } = data;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
            <CheckCircle2 size={10} /> Active / Current
          </Badge>
        );
      case 'superseded':
        return (
          <Badge className="bg-slate-100 text-slate-500 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
            Superseded
          </Badge>
        );
      case 'refund_pending':
        return (
          <Badge className="bg-amber-50 text-amber-600 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
            <AlertTriangle size={10} /> Refund Pending
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-rose-50 text-rose-600 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
            <XCircle size={10} /> Refunded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-400 border-none shadow-none text-[9px] px-2 py-0.5 rounded-lg font-bold w-fit">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-2">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/subscriptions/buyers')}
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Buyers Directory</span>
            <ChevronRight size={12} />
            <span className="text-slate-600">Buyer Profile</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Billing History: {user.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User profile side card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-16 h-16 rounded-2xl border border-slate-100 bg-slate-50 mb-4 shadow-inner">
                <AvatarFallback className="text-slate-700 font-bold text-xl uppercase">
                  {user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 justify-center">
                <h3 className="font-bold text-base text-slate-900">{user.name}</h3>
                {user.display_id && (
                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                    {user.display_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 capitalize font-medium">{user.role?.name || user.role}</p>
            </div>

            <div className="border-t border-slate-50 pt-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="text-slate-800 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Active Plan</span>
                <span className="text-slate-800 font-bold">{user.subscription?.name || 'Free Tier'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Auto-Renew</span>
                <span className="text-slate-800 font-medium">{user.autoRenew ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Expiry Date</span>
                <span className="text-slate-800 font-semibold">
                  {user.subscriptionExpiry
                    ? new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History timeline / list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm shadow-slate-200/50">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Invoices & Transactions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Detailed purchase history, start/end dates, and plan parameters.</p>
              </div>
              <Badge variant="outline" className="border-slate-100 text-slate-400 bg-slate-50/50 text-xs font-bold uppercase">
                {payments.length} Invoices
              </Badge>
            </div>

            <div className="divide-y divide-slate-50">
              {payments.length > 0 ? (
                payments.map((p) => {
                  const startDate = new Date(p.createdAt);
                  const expiryDate = calculateExpiryDate(p.createdAt, p.plan?.duration, p.quantity);
                  
                  // Extract package features from plan object
                  const activeFeatures = p.plan 
                    ? Object.keys(featureLabels).filter(key => p.plan[key] === true || p.plan[key] === 'Daily' || p.plan[key] === 'Weekly' || p.plan[key] === 'Monthly')
                    : [];

                  return (
                    <div key={p._id} className="p-6 hover:bg-slate-50/30 transition-colors space-y-4">
                      {/* Top Row: Plan Name, Status, Price */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                              {p.plan?.name || 'N/A'} Plan
                            </p>
                            {getStatusBadge(p.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Duration: {p.plan?.duration || 'N/A'}</span>
                            <span>•</span>
                            <span>Qty: {p.quantity || 1}</span>
                            <span>•</span>
                            <span>Method: {p.paymentMethod || 'Razorpay'}</span>
                          </div>
                        </div>

                        {/* Amount & Invoice Option */}
                        <div className="text-left md:text-right space-y-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              ₹{p.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Base: ₹{p.baseAmount || 0} + GST: ₹{p.gstAmount || 0} ({p.gstPercentage || 0}%)
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedInvoice(p)}
                            className="text-[10px] font-bold text-slate-700 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 rounded-lg py-1 h-7 ml-auto"
                          >
                            <FileText size={11} /> View Invoice
                          </Button>
                        </div>
                      </div>

                      {/* Middle Row: Start Date, End Date, Payment Date */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-t border-b border-slate-50 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Payment Date</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {startDate.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Package Start Date</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            {startDate.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Package End Date</span>
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            {p.plan?.duration === 'Lifetime' ? (
                              <span className="text-indigo-600 font-bold flex items-center gap-1">
                                <Award size={13} /> Lifetime
                              </span>
                            ) : (
                              <>
                                <Calendar size={13} className="text-slate-400" />
                                {expiryDate ? expiryDate.toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Package Features List */}
                      {activeFeatures.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Package Perks Included</span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeFeatures.map(feat => (
                              <Badge key={feat} variant="outline" className="border-emerald-100 bg-emerald-50/20 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-none">
                                <Check size={10} strokeWidth={3} />
                                {featureLabels[feat]}
                              </Badge>
                            ))}
                            {/* Render other counters if populated */}
                            {p.plan?.resumeBuilderCount > 0 && (
                              <Badge variant="outline" className="border-indigo-150 bg-indigo-50/20 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-none">
                                {p.plan.resumeBuilderCount} Resume Builds
                              </Badge>
                            )}
                            {p.plan?.activeJobPostings > 0 && (
                              <Badge variant="outline" className="border-indigo-150 bg-indigo-50/20 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-none">
                                {p.plan.activeJobPostings} Job Postings
                              </Badge>
                            )}
                            {p.plan?.candidateSearchPerDay > 0 && (
                              <Badge variant="outline" className="border-indigo-150 bg-indigo-50/20 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-none">
                                {p.plan.candidateSearchPerDay} Candidate Resumes/Day
                              </Badge>
                            )}
                            {p.plan?.userSeats > 1 && (
                              <Badge variant="outline" className="border-indigo-150 bg-indigo-50/20 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-none">
                                {p.plan.userSeats} Member Seats
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Razorpay transaction details */}
                      {p.razorpay_payment_id && p.razorpay_payment_id !== 'FREE_PAYMENT' && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-medium text-slate-500 font-mono">
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] mr-1">Payment ID:</span>
                            <span className="text-slate-800">{p.razorpay_payment_id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] mr-1">Order ID:</span>
                            <span className="text-slate-800">{p.razorpay_order_id}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <CreditCard size={28} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-semibold">No transactions found for this user</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Tax Invoice Viewer</h3>
                <p className="text-xs text-slate-400 mt-0.5">Preview formal commercial document matching this transaction.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePrint(selectedInvoice, user)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-3 py-2 flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print / Save PDF
                </Button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tax Invoice Preview Content */}
            <div className="p-8 md:p-12 bg-white text-slate-800 space-y-8 select-text">
              {/* Invoice Logo & Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Activity size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-black text-base tracking-tight text-slate-900">
                      Velaivaai<span className="text-emerald-600">pu</span>
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Professional Hub</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">Tax Invoice</h1>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    Invoice No: INV/{new Date(selectedInvoice.createdAt).getFullYear()}/{selectedInvoice._id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Billed From & Billed To */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billed From</h4>
                  <div className="text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">{billingSettings.billingName}</p>
                    <p>{billingSettings.address}</p>
                    <p>Pincode: {billingSettings.pincode || ''}</p>
                    <p className="font-mono text-[10px] mt-2">GSTIN: {billingSettings.gstNumber}</p>
                    <p>Email: {billingSettings.email}</p>
                    <p>Phone: {billingSettings.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billed To (Recipient)</h4>
                  <div className="text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    {user.display_id && <p className="font-mono text-[10px]">ID: {user.display_id}</p>}
                    <p>Email: {user.email}</p>
                    <p className="capitalize">Account Type: {user.role?.name || user.role}</p>
                    <p className="mt-2">Payment Mode: {selectedInvoice.paymentMethod || 'Razorpay'}</p>
                    <p className="font-mono text-[10px]">Payment ID: {selectedInvoice.razorpay_payment_id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Meta Dates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Invoice Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
                  <span className="font-semibold text-slate-800">Paid (Immediate)</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Period Start</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Period End</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInvoice.plan?.duration === 'Lifetime' ? 'Lifetime Access' : (
                      calculateExpiryDate(selectedInvoice.createdAt, selectedInvoice.plan?.duration, selectedInvoice.quantity)?.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) || 'N/A'
                    )}
                  </span>
                </div>
              </div>

              {/* Item Table */}
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-[10px]">Description</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-[10px] text-center">SAC Code</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-[10px] text-right">Unit Price</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-[10px] text-center">Qty</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 text-[10px] text-right">Taxable Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">{selectedInvoice.plan?.name || 'N/A'} Subscription Plan</p>
                        <p className="text-[10px] text-slate-400 mt-1">Duration: {selectedInvoice.plan?.duration || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-4 text-center font-mono">998311</td>
                      <td className="px-4 py-4 text-right">₹{selectedInvoice.baseAmount?.toLocaleString() || 0}</td>
                      <td className="px-4 py-4 text-center">{selectedInvoice.quantity || 1}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">₹{selectedInvoice.baseAmount?.toLocaleString() || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculations Block */}
              <div className="flex justify-end text-xs">
                <div className="w-full md:w-80 space-y-2.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount (Base):</span>
                    <span>₹{selectedInvoice.baseAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST ({(billingSettings.gstPercentage / 2)}%):</span>
                    <span>₹{(selectedInvoice.gstAmount / 2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST ({(billingSettings.gstPercentage / 2)}%):</span>
                    <span>₹{(selectedInvoice.gstAmount / 2).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 flex justify-between font-black text-sm text-slate-900">
                    <span>Total Amount (Incl. GST):</span>
                    <span>₹{selectedInvoice.amount?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {/* Declaration Note */}
              <div className="pt-8 border-t border-slate-100 space-y-4">
                <div className="text-[10px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-500">Declaration & Terms:</p>
                  <p>1. This is a computer-generated invoice and does not require physical signature or rubber stamp.</p>
                  <p>2. The services rendered are classified under SAC code 998311 (Job Portal & Recruitment Services).</p>
                  <p>3. All payment amounts shown are inclusive of GST as configured.</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                  <span>Velaivaaipu Support Team</span>
                  <span>System Authenticated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDetails;
