import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Key, History, Activity, Lock, Users, MonitorSmartphone, Mail, User, Edit2, CheckCircle2, CreditCard, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.avatar || '',
    adminRoleType: 'Root Super Admin',
    permissions: ['manage_billing', 'approve_refunds', 'ban_users', 'edit_banners'],
    accountStatus: 'Active',
    twoFactorAuth: { enabled: false },
    lastLogin: new Date().toISOString(),
    loginIpAddress: '192.168.1.104',
    deviceFingerprint: 'Chrome on Windows 11',
    createdAt: new Date().toISOString(),
    admin_id: 'admin-uuid-placeholder'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [billingSettings, setBillingSettings] = useState({
    billingName: '',
    gstNumber: '',
    gstPercentage: 18,
    address: '',
    pincode: '',
    email: '',
    phone: ''
  });
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [tempBillingSettings, setTempBillingSettings] = useState({
    billingName: '',
    gstNumber: '',
    gstPercentage: 18,
    address: '',
    pincode: '',
    email: '',
    phone: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchBillingSettings();
  }, []);

  const fetchBillingSettings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/settings`);
      if (res.data) {
        const data = {
          billingName: res.data.billingName || '',
          gstNumber: res.data.gstNumber || '',
          gstPercentage: res.data.gstPercentage ?? 18,
          address: res.data.address || '',
          pincode: res.data.pincode || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        };
        setBillingSettings(data);
        setTempBillingSettings(data);
      }
    } catch (error) {
      console.error('Error fetching billing settings:', error);
    }
  };

  const handleSaveBillingSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/settings`,
        tempBillingSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Billing & GST settings updated successfully');
      setBillingSettings(res.data);
      setTempBillingSettings(res.data);
      setIsEditingBilling(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to save billing settings');
    } finally {
      setSavingSettings(false);
    }
  };
  const [newAvatar, setNewAvatar] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const togglePasswordVisibility = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        admin_id: user.admin_id || user._id || prev.admin_id,
        profilePicture: user.avatar || prev.profilePicture,
        twoFactorAuth: user.twoFactorAuth || prev.twoFactorAuth
      }));
    }
  }, [user]);

  const handleOpenEditModal = () => {
    setEditForm({ name: profileData.name, email: profileData.email });
    setNewAvatar(null);
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData if dealing with images
      let payload = { name: editForm.name, email: editForm.email };
      // Note: Full avatar upload via FormData is omitted for brevity if no file input endpoint, but we can pass string if it's base64 or a direct URL later.
      // For now, let's just send JSON
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/admin/profile`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.requireEmailOTP) {
        setIsEditModalOpen(false);
        setIsOtpModalOpen(true);
        toast.success(res.data.msg);
      } else {
        setProfileData(prev => ({
          ...prev,
          name: res.data.name,
          email: res.data.email
        }));
        setIsEditModalOpen(false);
        toast.success('Admin profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/verify-email-otp`, { otp: emailOtp }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfileData(prev => ({ ...prev, email: res.data.admin.email }));
      setIsOtpModalOpen(false);
      setEmailOtp('');
      toast.success('Email updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (passwords.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    setLoading(true);
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/admin/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated securely');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const toggle2FA = async () => {
    setLoading(true);
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/admin/2fa`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setProfileData(prev => ({
        ...prev,
        twoFactorAuth: { ...prev.twoFactorAuth, enabled: res.data.enabled }
      }));
      toast.success(res.data.msg);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to toggle 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your administrative identity, roles, and security settings.</p>
        </div>
        <Button onClick={handleOpenEditModal} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
          <Edit2 size={16} /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - 1. Account & Security Identity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User size={18} className="text-emerald-600" />
                Account Identity (View Mode)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-20 h-20 border-2 border-emerald-100">
                  <AvatarImage src={profileData.profilePicture} />
                  <AvatarFallback className="bg-emerald-50 text-emerald-600 text-xl font-bold">
                    {profileData.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{profileData.name}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Mail size={14}/> {profileData.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name / Display Name</label>
                  <p className="text-sm font-medium text-slate-900">{profileData.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Secure Email Address</label>
                  <p className="text-sm font-medium text-slate-900">{profileData.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key size={18} className="text-emerald-600" />
                Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Update */}
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-4">Update Admin Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { field: 'currentPassword', placeholder: 'Current Password' },
                    { field: 'newPassword', placeholder: 'New Password' },
                    { field: 'confirmPassword', placeholder: 'Confirm Password' },
                  ].map(({ field, placeholder }) => (
                    <div key={field} className="relative">
                      <Input
                        type={showPasswords[field] ? 'text' : 'password'} placeholder={placeholder} required
                        value={passwords[field]}
                        onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" disabled={loading}>Update Password</Button>
                </div>
              </form>

              {/* 2FA Status */}
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Lock size={16} className={profileData.twoFactorAuth.enabled ? 'text-emerald-500' : 'text-amber-500'}/>
                      Two-Factor Authentication (OTP via Email)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">If enabled, you will receive a 4-digit OTP via email during login.</p>
                  </div>
                  <Button 
                    onClick={toggle2FA}
                    disabled={loading}
                    variant={profileData.twoFactorAuth.enabled ? 'outline' : 'default'} 
                    className={!profileData.twoFactorAuth.enabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                  >
                    {profileData.twoFactorAuth.enabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>
                {profileData.twoFactorAuth.enabled && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                    <CheckCircle2 size={14} /> 2FA is currently active for your account
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing & GST Settings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                Platform Billing & GST Settings
              </CardTitle>
              {!isEditingBilling && (
                <Button 
                  onClick={() => {
                    setTempBillingSettings({ ...billingSettings });
                    setIsEditingBilling(true);
                  }}
                  variant="outline" 
                  size="sm"
                  className="rounded-xl border-slate-200 text-slate-700 font-semibold"
                >
                  Edit Settings
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!isEditingBilling ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billing Name / Entity Name</label>
                      <p className="text-sm font-bold text-slate-800">{billingSettings.billingName || 'Not Configured'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN (GST Number)</label>
                      <p className="text-sm font-mono font-bold text-slate-800">{billingSettings.gstNumber || 'Not Configured'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GST Percentage (%)</label>
                      <p className="text-sm font-medium text-slate-800">{billingSettings.gstPercentage}%</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billing Support Phone</label>
                      <p className="text-sm font-medium text-slate-800">{billingSettings.phone || 'Not Configured'}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billing Support Email</label>
                    <p className="text-sm font-medium text-slate-800">{billingSettings.email || 'Not Configured'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Corporate Address</label>
                      <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                        {billingSettings.address || 'Not Configured'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pincode</label>
                      <p className="text-sm font-mono font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {billingSettings.pincode || 'Not Configured'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveBillingSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing Name / Entity Name</label>
                      <Input 
                        value={tempBillingSettings.billingName}
                        onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, billingName: e.target.value })}
                        placeholder="e.g. Velaivaaipu Tech Private Limited"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GSTIN (GST Number)</label>
                      <Input 
                        value={tempBillingSettings.gstNumber}
                        onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, gstNumber: e.target.value })}
                        placeholder="e.g. 33AAECV1209F1Z4"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GST Percentage (%)</label>
                      <Input 
                        type="number"
                        value={tempBillingSettings.gstPercentage}
                        onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, gstPercentage: Number(e.target.value) })}
                        placeholder="18"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing Support Phone</label>
                      <Input 
                        value={tempBillingSettings.phone}
                        onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, phone: e.target.value })}
                        placeholder="e.g. +91 99445 09441"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billing Support Email</label>
                    <Input 
                      type="email"
                      value={tempBillingSettings.email}
                      onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, email: e.target.value })}
                      placeholder="e.g. support@velaivaaipu.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Corporate Address</label>
                      <textarea
                        value={tempBillingSettings.address}
                        onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, address: e.target.value })}
                        placeholder="Enter complete corporate billing address..."
                        className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pincode</label>
                      <Input 
                        value={tempBillingSettings.pincode}
                        onChange={(e) => setTempBillingSettings({ ...tempBillingSettings, pincode: e.target.value })}
                        placeholder="e.g. 600020"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditingBilling(false)}
                      className="rounded-xl border-slate-200 text-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      {savingSettings ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* 2. Role & Permission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-medium uppercase">Admin Role Type</label>
                <div className="font-semibold text-slate-900 mt-1 flex items-center gap-2">
                  {profileData.adminRoleType}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    profileData.accountStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {profileData.accountStatus}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-medium uppercase mb-2 block">Access Scope (Permissions)</label>
                <div className="flex flex-wrap gap-2">
                  {profileData.permissions.map(perm => (
                    <span key={perm} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                      {perm.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Audit & Tracking Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History size={18} className="text-emerald-600" />
                Audit & Tracking Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-500 font-medium block">Admin ID (Unique Identifier)</label>
                <code className="bg-slate-50 px-2 py-1 rounded text-xs text-slate-700 border border-slate-200 mt-1 block truncate">
                  {profileData.admin_id}
                </code>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-slate-500 font-medium flex items-center gap-1"><Activity size={14}/> Last Login</label>
                  <p className="text-slate-900 mt-1 text-xs">{new Date(profileData.lastLogin).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium flex items-center gap-1"><MonitorSmartphone size={14}/> IP / Device</label>
                  <p className="text-slate-900 mt-1 text-xs">{profileData.loginIpAddress}</p>
                  <p className="text-slate-500 text-[10px] truncate">{profileData.deviceFingerprint}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t mt-2">
                <p className="text-[10px] text-slate-400">
                  Profile Created: {new Date(profileData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate} className="space-y-6 pt-4">
            
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-emerald-100">
                <AvatarImage src={newAvatar ? URL.createObjectURL(newAvatar) : profileData.profilePicture} />
                <AvatarFallback className="bg-emerald-50 text-emerald-600 text-2xl font-bold">
                  {editForm.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-1 w-full max-w-xs">
                <label className="w-full">
                  <span className="sr-only">Choose profile photo</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-emerald-50 file:text-emerald-700
                    hover:file:bg-emerald-100 cursor-pointer
                  "/>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <Input 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <Input 
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verify Email OTP Modal */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify Email Change</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVerifyEmailOtp} className="space-y-4 pt-4">
            <p className="text-sm text-slate-500">We've sent a 4-digit OTP to your new email. Enter it below to verify.</p>
            <Input 
              type="text" 
              placeholder="Enter 4-digit OTP" 
              maxLength={4}
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              required
              className="text-center tracking-widest font-mono text-lg"
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading || emailOtp.length < 4} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
