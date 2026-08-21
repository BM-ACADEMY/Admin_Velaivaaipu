import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Trash2, 
  Search, 
  Loader2, 
  Eye, 
  ShieldAlert, 
  ShieldCheck,
  BadgeCheck,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  Users,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// Note: Dialog kept for the Edit modal
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from '@/components/shared/Pagination';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('jobseeker');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { role: activeTab, page, limit: 20 };
      if (search) params.search = search;
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setRoles(res.data);
      } else {
        console.error('API returned non-array data for roles:', res.data);
        setRoles([]);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, page]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };

  const handleSearchEnter = (e) => {
    if (e.key !== 'Enter') return;
    setPage(1);
    if (page === 1) fetchUsers();
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.msg);
      setUsers(users.map(u => u._id === id ? { ...u, isAdminBlocked: res.data.isAdminBlocked } : u));
    } catch (err) {
      toast.error('Failed to update block status');
    }
  };

  const handleViewDetails = (user) => {
    navigate(`/admin/users/${user._id}`);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${userId}/verification-status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile status updated');
      setUsers(users.map(u => u._id === userId ? { ...u, profileVerificationStatus: res.data.profileVerificationStatus } : u));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };


  const handleStartConversation = async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/messages/conversation`, 
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/admin/messages', { state: { conversationId: res.data._id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start conversation");
    }
  };

  const UserTable = ({ data, roleLabel }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Identity</th>
            <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Email Auth</th>
            <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Admin Verification</th>
            <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Registration</th>
            <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {(data || []).length === 0 ? (
            <tr>
              <td colSpan="5" className="p-20 text-center text-slate-400 font-medium text-sm italic">No {roleLabel} records identified.</td>
            </tr>
          ) : (
            Array.isArray(data) && data.map((user) => (
              <tr key={user._id} className={`hover:bg-slate-50/50 transition-colors group ${user.isAdminBlocked ? 'bg-red-50/20' : ''}`}>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 rounded-xl border border-slate-200 p-0.5 bg-white shadow-sm transition-transform group-hover:scale-105">
                      <AvatarImage src={user.avatar} className="rounded-lg" />
                      <AvatarFallback className="bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold uppercase">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {user.name}
                        {user?.profileVerificationStatus === 'Verified' && (
                          <BadgeCheck size={16} className="text-blue-500 shrink-0" title="Verified Profile" />
                        )}
                        {user.isAdminBlocked && (
                          <span className="text-[8px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                             BLOCKED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {user.email}
                        {user.display_id && <span className="ml-2 px-1.5 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-emerald-700 tracking-widest">{user.display_id}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="flex justify-center">
                    {user.isVerified ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 text-[9px] font-bold uppercase px-3 py-1">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-200 bg-slate-50 text-[9px] font-bold uppercase px-3 py-1">Unverified</Badge>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Switch
                      checked={user.profileVerificationStatus === 'Verified'}
                      onCheckedChange={(checked) => handleStatusChange(user._id, checked ? 'Verified' : 'Pending')}
                      className={`${user.profileVerificationStatus === 'Verified' ? 'data-[state=checked]:bg-emerald-600' : 'data-[state=unchecked]:bg-slate-200'}`}
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${
                      user.profileVerificationStatus === 'Verified' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {user.profileVerificationStatus === 'Verified' ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </td>
                <td className="p-6 text-center">
                   <span className="text-xs text-slate-400 font-bold tabular-nums">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                   </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(user)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Inspect">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleBlock(user._id)} className={`h-9 w-9 rounded-lg transition-all ${
                        user.isAdminBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                      }`} title={user.isAdminBlocked ? 'Unblock' : 'Block'}>
                      {user.isAdminBlocked ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleStartConversation(user._id)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all" title="Direct Message">
                      <MessageSquare size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user._id)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header - Simple & Professional */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Identity Directory</h1>
            <p className="text-base text-slate-500 font-medium">Manage platform participants and institutional access levels.</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
            <Input
              type="text"
              className="pl-12 h-12 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-0 font-medium text-sm bg-white shadow-sm transition-all"
              placeholder="Search by name, email, or unique ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
          </div>
        </div>
        <div className="h-px bg-slate-200 w-full" />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
        <TabsList className="bg-slate-100/50 p-1 flex gap-1 rounded-xl border border-slate-200 w-fit">
          <TabsTrigger value="jobseeker" className="rounded-lg px-6 py-2 font-bold text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all uppercase tracking-tight">
            Job Seekers
          </TabsTrigger>
          <TabsTrigger value="recruiter" className="rounded-lg px-6 py-2 font-bold text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all uppercase tracking-tight">
            Recruiters
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg px-6 py-2 font-bold text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all uppercase tracking-tight">
            Organizations
          </TabsTrigger>
          <TabsTrigger value="org_employee" className="rounded-lg px-6 py-2 font-bold text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all uppercase tracking-tight">
            Team Members
          </TabsTrigger>
          <TabsTrigger value="college" className="rounded-lg px-6 py-2 font-bold text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all uppercase tracking-tight">
            Colleges
          </TabsTrigger>
        </TabsList>

        <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white gap-4">
              <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-400">Syncing directory...</p>
            </div>
          ) : (
            <TabsContent value={activeTab} className="m-0">
              <UserTable data={users} roleLabel={activeTab} />
              <Pagination page={page} pages={pages} total={total} onPageChange={setPage} itemLabel="users" />
            </TabsContent>
          )}
        </Card>
      </Tabs>


      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this user?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageUsers;
