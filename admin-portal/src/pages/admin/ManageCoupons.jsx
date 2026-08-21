import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Tag, Plus, Edit2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    percentage: 0,
    totalUses: 0,
    isActive: true
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        name: coupon.name,
        percentage: coupon.percentage,
        totalUses: coupon.totalUses,
        isActive: coupon.isActive
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        name: '',
        percentage: 0,
        totalUses: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await axios.patch(`${API_BASE_URL}/coupons/${editingCoupon._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Coupon updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/coupons`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Coupon created successfully');
      }
      fetchCoupons();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Operation failed');
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      await axios.patch(`${API_BASE_URL}/coupons/${coupon._id}`, { isActive: !coupon.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Coupons Management</h2>
          <p className="text-sm text-slate-500">Create and manage subscription discount coupons</p>
        </div>
        <Button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus size={16} /> Add Coupon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4">Uses</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">{c.code}</td>
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                      {c.percentage}% OFF
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.currentUses} / {c.totalUses === 0 ? 'Unlimited' : c.totalUses}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {c.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(c)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors mr-2">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => toggleStatus(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${c.isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No coupons found. Click "Add Coupon" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCoupon}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="e.g. SUMMER50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Coupon Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                  placeholder="Summer Sale Discount"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.percentage}
                    onChange={e => setFormData({ ...formData, percentage: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Uses (0=Unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.totalUses}
                    onChange={e => setFormData({ ...formData, totalUses: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={closeModal} variant="outline" className="flex-1 border-slate-200 text-slate-600">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {editingCoupon ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
