import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Trash2, 
  Search, 
  Loader2, 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  ExternalLink,
  Plus,
  Mail,
  Eye,
  ShieldCheck,
  Edit2,
  Download,
  Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    industry: '',
    employeeCount: '',
    foundedYear: '',
    website: '',
    description: '',
    tagline: '',
    admin_email: ''
  });

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/companies`);
      if (Array.isArray(res.data)) {
        setCompanies(res.data);
      } else {
        console.error('API returned non-array data for companies:', res.data);
        setCompanies([]);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      toast.error('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/companies/${id}`);
      toast.success('Company deleted successfully');
      setCompanies(companies.filter(c => c._id !== id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete company');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setViewModalOpen(true);
  };

  const handleEditClick = (company) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name || '',
      location: company.location || '',
      industry: company.industry || '',
      employeeCount: company.employeeCount || '',
      foundedYear: company.foundedYear || '',
      website: company.website || '',
      description: company.description || company.about_us || '',
      tagline: company.tagline || '',
      admin_email: company.admin_email || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/admin/companies/${selectedCompany._id}`, editForm);
      toast.success('Company updated successfully');
      setEditModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to update company');
    }
  };

  const filteredCompanies = (Array.isArray(companies) ? companies : []).filter(company => 
    (company.name && company.name.toLowerCase().includes(search.toLowerCase())) || 
    (company.admin_email && company.admin_email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header - Simple & Professional */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">Organization Registry</h1>
            <p className="text-base text-slate-500 font-medium">Global directory of verified corporate participants and institutional partners.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
              <Input
                type="text"
                className="pl-12 h-12 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-0 font-medium text-sm bg-white shadow-sm transition-all"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-sm shadow-sm gap-2 px-6">
              <Plus size={18} /> Register Entity
            </Button>
          </div>
        </div>
        <div className="h-px bg-slate-200 w-full" />
      </div>

      {/* Metrics Row - Elegant Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Registry', value: (companies || []).length, color: 'text-slate-900', bg: 'bg-slate-50/50' },
          { label: 'Verified Nodes', value: (Array.isArray(companies) ? companies : []).filter(c => c.is_verified).length, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'Audit Queue', value: (Array.isArray(companies) ? companies : []).filter(c => !c.is_verified).length, color: 'text-amber-600', bg: 'bg-amber-50/50' }
        ].map((stat, i) => (
          <Card key={i} className="p-6 rounded-[24px] border-slate-200 shadow-sm bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} tracking-tight tabular-nums`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="rounded-[24px] border-slate-200 overflow-hidden shadow-sm bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white gap-4">
            <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
            <p className="text-xs font-bold text-slate-400">Syncing directory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Corporate Identity</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Management</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Classification</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Status</th>
                  <th className="p-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(filteredCompanies || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 font-medium text-sm italic">No business records identified.</td>
                  </tr>
                ) : (
                  Array.isArray(filteredCompanies) && filteredCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-xl border border-slate-200 p-0.5 bg-white shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={company.logo} className="rounded-lg" />
                            <AvatarFallback className="bg-slate-100 text-slate-400 font-bold rounded-lg uppercase">
                              {company.name ? company.name.charAt(0).toUpperCase() : 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold text-slate-900 tracking-tight">{company.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              <MapPin size={12} className="text-emerald-600" /> {company.location || 'Remote Base'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            {company.admin_email || 'No Administrator'}
                        </div>
                        {company.website && (
                          <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-1 font-bold uppercase tracking-tight">
                            <Globe size={10} className="text-emerald-600" /> Node Established
                          </div>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="text-xs font-bold text-slate-900 tracking-tight">{company.industry || 'Undisclosed'}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1.5 uppercase tracking-tight">
                           <Users size={12} className="text-emerald-600" /> {company.employeeCount || '1-10'} Personnel
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${company.is_verified ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${company.is_verified ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {company.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(company)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Inspect">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(company)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="Edit">
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(company._id)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
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
        )}
      </Card>

      {/* Detailed Inspection Modal - Elegant Style */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[24px] p-0 border-slate-200 shadow-2xl overflow-hidden bg-white">
          {selectedCompany && (
            <div className="flex flex-col">
              {/* Profile Header Block */}
              <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-8">
                  <Avatar className="h-24 w-24 rounded-[24px] border border-slate-200 shadow-sm bg-white p-1">
                    <AvatarImage src={selectedCompany.logo} className="rounded-[20px]" />
                    <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-bold rounded-[20px] uppercase">
                      {selectedCompany.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedCompany.name}</h2>
                      {selectedCompany.is_verified && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100"><ShieldCheck size={14} className="mr-1.5" /> Verified Entity</Badge>}
                    </div>
                    <p className="text-sm text-emerald-600 font-bold uppercase tracking-tight">{selectedCompany.tagline || 'Organizational Identity Profile'}</p>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Globe size={14} className="text-slate-400" /> {selectedCompany.website || 'No URL'}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <MapPin size={14} className="text-slate-400" /> {selectedCompany.location || 'Remote Base'}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Grid Section */}
              <div className="p-10 overflow-y-auto space-y-12 max-h-[60vh] custom-scrollbar">
                {/* Information Card - Mimicking reference image */}
                <Card className="p-8 rounded-[20px] border-slate-100 shadow-sm bg-white space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="text-base font-bold text-slate-900">Corporate Metadata</h3>
                         <p className="text-xs text-slate-500">Global business identifiers and contact records.</p>
                      </div>
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                         Audit Complete
                      </Badge>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Industry Classification</Label>
                         <div className="flex items-center gap-3 py-2 border-b border-slate-50 group">
                            <Building2 size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-sm font-bold text-slate-700">{selectedCompany.industry || 'Undisclosed'}</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Workforce Metrics</Label>
                         <div className="flex items-center gap-3 py-2 border-b border-slate-50 group">
                            <Users size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-sm font-bold text-slate-700">{selectedCompany.employeeCount || '0'} Personnel</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Administrative Contact</Label>
                         <div className="flex items-center gap-3 py-2 border-b border-slate-50 group">
                            <Mail size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-sm font-bold text-slate-700 truncate">{selectedCompany.admin_email}</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Inception Data</Label>
                         <div className="flex items-center gap-3 py-2 border-b border-slate-50 group">
                            <Calendar size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-sm font-bold text-slate-700">{selectedCompany.foundedYear || 'Not Logged'}</span>
                         </div>
                      </div>
                   </div>
                </Card>

                {selectedCompany.description && (
                  <section className="space-y-4 px-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Business Narrative</Label>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedCompany.description}
                    </p>
                  </section>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                <Button variant="ghost" className="rounded-xl font-bold text-xs h-11 px-8 text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-tight" onClick={() => setViewModalOpen(false)}>Close Panel</Button>
                <Button className="rounded-xl font-bold text-xs h-11 px-8 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm" asChild>
                  <a href={selectedCompany.website} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} className="mr-2" /> Asset Portal
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Organization Modal - Elegant Style */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-4xl rounded-[24px] p-0 border-slate-200 shadow-2xl bg-white overflow-hidden">
          <DialogHeader className="p-8 border-b border-slate-100 bg-white">
             <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-[#0f172a] tracking-tight">Entity Configuration</DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium">Update official business metadata and organizational records.</DialogDescription>
             </div>
          </DialogHeader>

          <form onSubmit={handleUpdateCompany} className="flex flex-col bg-white">
            <div className="p-8 overflow-y-auto space-y-10 max-h-[70vh] custom-scrollbar">
               {/* Identity Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Trade Name</Label>
                     <Input 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Admin Email</Label>
                     <Input 
                        value={editForm.admin_email} 
                        onChange={(e) => setEditForm({...editForm, admin_email: e.target.value})}
                        className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                        required
                     />
                  </div>
               </div>

               {/* Metrics Section */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Industry</Label>
                     <Input 
                        value={editForm.industry} 
                        onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                        className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Personnel Count</Label>
                     <Input 
                        value={editForm.employeeCount} 
                        onChange={(e) => setEditForm({...editForm, employeeCount: e.target.value})}
                        className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Founded</Label>
                     <Input 
                        value={editForm.foundedYear} 
                        onChange={(e) => setEditForm({...editForm, foundedYear: e.target.value})}
                        className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                     />
                  </div>
               </div>

               {/* Digital Presence */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Location</Label>
                        <Input 
                           value={editForm.location} 
                           onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                           className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Website URL</Label>
                        <Input 
                           value={editForm.website} 
                           onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                           className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Tagline</Label>
                        <Input 
                           value={editForm.tagline} 
                           onChange={(e) => setEditForm({...editForm, tagline: e.target.value})}
                           className="rounded-xl border-slate-200 h-12 font-medium text-sm focus:border-emerald-600 focus:ring-0 bg-white"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Corporate Narrative</Label>
                     <Textarea 
                        value={editForm.description} 
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="rounded-xl border-slate-200 min-h-[220px] font-medium text-sm focus:border-emerald-600 focus:ring-0 resize-none bg-slate-50/30 p-5 leading-relaxed transition-all"
                     />
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 justify-end">
               <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-xl h-11 px-8 font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all" 
                  onClick={() => setEditModalOpen(false)}
               >
                  Discard
               </Button>
               <Button 
                  type="submit" 
                  className="rounded-xl h-11 px-8 font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
               >
                  Save Changes
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this company?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageCompanies;
