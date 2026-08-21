import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Settings, ChevronDown, BadgeCheck, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const roleConfig = {
  jobseeker: {
    label: 'Job Seeker',
    color: 'bg-primary/10 text-primary border-primary/20',
    navItems: [
      { label: 'Jobs', href: '/jobs' },
      { label: 'Companies', href: '/companies' },
      { label: 'Services', href: '/services' },
    ],
  },
  recruiter: {
    label: 'Recruiter',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    navItems: [
      { label: 'Post Job', href: '/company/jobs/new' },
      { label: 'Applicants', href: '/company/applicants' },
      { label: 'Analytics', href: '/company/analytics' },
      { label: 'Settings', href: '/company/settings' },
    ],
  },
  company: {
    label: 'Company',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    navItems: [
      { label: 'Post Job', href: '/company/jobs/new' },
      { label: 'Applicants', href: '/company/applicants' },
      { label: 'Analytics', href: '/company/analytics' },
      { label: 'Settings', href: '/company/settings' },
    ],
  },
  admin: {
    label: 'Admin',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    navItems: [
      { label: 'Users', href: '/admin/users' },
      { label: 'Companies', href: '/admin/companies' },
      { label: 'Reports', href: '/admin/reports' },
    ],
  },
  subadmin: {
    label: 'Sub-Admin',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    navItems: [
      { label: 'Moderation', href: '/subadmin/moderation' },
      { label: 'Reports', href: '/subadmin/reports' },
    ],
  },
  college: {
    label: 'College',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    navItems: [
      { label: 'Students', href: '/college/students' },
      { label: 'Campus Drives', href: '/college/drives' },
      { label: 'Reports', href: '/college/reports' },
    ],
  },
  org_employee: {
    label: 'Employee',
    color: 'bg-primary/10 text-primary border-primary/20',
    navItems: [
      { label: 'Jobs', href: '/jobs' },
      { label: 'Companies', href: '/companies' },
      { label: 'Services', href: '/services' },
    ],
  },
  drive_incharge: {
    label: 'Drive In-Charge',
    color: 'bg-primary/10 text-primary border-primary/20',
    navItems: [
      { label: 'Manage Drive', href: '/incharge' },
    ],
  },
};

const Header = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const role = user?.role || 'jobseeker';
  const config = roleConfig[role] || roleConfig.jobseeker;
  const navItems = [...(config.navItems || []), { label: 'Blog', href: '/blog' }];

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/notifications?limit=30`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }).catch(err => console.error('Failed to load notifications:', err));
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const receiveNotification = notification => {
      setNotifications(current => [notification, ...current].slice(0, 30));
      setUnreadCount(current => current + 1);
    };
    socket.on('notification:new', receiveNotification);
    return () => socket.off('notification:new', receiveNotification);
  }, [socket]);

  const openNotification = async notification => {
    if (!notification.isRead) {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${notification._id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
      setNotifications(current => current.map(item => item._id === notification._id ? { ...item, isRead: true } : item));
      setUnreadCount(current => Math.max(0, current - 1));
    }
    if (notification.link) navigate(notification.link);
  };

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem('token');
    await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(current => current.map(item => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
                    <span className="text-white font-black text-base">V</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">Velaivaaipu</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Professional Hub</span>
                </div>
            </Link>
        </div>

        {/* Search */}
        <div className="hidden xl:flex flex-1 justify-center max-w-md">
            <div className="w-full relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                    placeholder="Identify roles, companies or skillsets..." 
                    className="h-11 pl-11 rounded-xl bg-slate-50 border-transparent focus:border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
                <Link 
                    key={item.href} 
                    to={item.href}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest transition-all hover:translate-y-[-1px]"
                >
                    {item.label}
                </Link>
            ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white border-2 border-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[360px] mt-3 rounded-2xl border border-slate-100 shadow-xl p-0 bg-white overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{unreadCount} unread</p>
                  </div>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="h-8 text-[10px] font-bold text-emerald-600">
                      <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-medium text-slate-400">No notifications yet</p>
                    </div>
                  ) : notifications.map(notification => (
                    <DropdownMenuItem
                      key={notification._id}
                      onClick={() => openNotification(notification)}
                      className={`block px-5 py-4 rounded-none border-b border-slate-50 cursor-pointer focus:bg-slate-50 ${notification.isRead ? 'bg-white' : 'bg-emerald-50/60'}`}
                    >
                      <div className="flex gap-3">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notification.isRead ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{notification.message}</p>
                          <p className="text-[9px] text-slate-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer pl-6 border-l border-slate-100 h-10 group transition-all">
                        <div className="hidden sm:flex flex-col items-end leading-none">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                              {user?.name || 'Authorized User'}
                              {user?.profileVerificationStatus === 'Verified' && <BadgeCheck size={14} className="text-blue-500 shrink-0" />}
                            </p>
                            <span className="text-[8px] px-2 py-0.5 rounded-full border border-slate-100 bg-slate-50/50 mt-1 uppercase tracking-widest font-bold text-slate-400">
                                {config.label}
                            </span>
                        </div>
                        <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-emerald-100 transition-all">
                            {user?.avatar && (
                                <AvatarImage 
                                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_DOMAIN}${user.avatar}`} 
                                    className="object-cover" 
                                />
                            )}
                            <AvatarFallback className="bg-emerald-50 text-emerald-600 text-xs font-black">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <ChevronDown size={14} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-2 bg-white animate-in slide-in-from-top-2 duration-300">
                    <DropdownMenuLabel className="px-4 py-4 mb-1">
                        <div className="flex flex-col space-y-1.5">
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              {user?.name || 'User Account'}
                              {user?.profileVerificationStatus === 'Verified' && <BadgeCheck size={14} className="text-blue-500 shrink-0" />}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-50" />
                    <div className="p-1 space-y-1">
                      <DropdownMenuItem 
                          onClick={() => {
                              const routes = {
                                  jobseeker: '/candidate/settings',
                                  recruiter: '/company/settings',
                                  company: '/company/settings',
                                  college: '/college/settings',
                                  admin: '/admin/settings',
                                  subadmin: '/subadmin/settings',
                                  org_employee: '/employee/settings'
                              };
                              navigate(routes[user?.role] || '/candidate/settings');
                          }}
                          className="rounded-xl px-4 py-3 text-xs font-bold text-slate-600 cursor-pointer focus:bg-emerald-50 focus:text-emerald-600 transition-all uppercase tracking-widest"
                      >
                          <Settings className="w-4 h-4 mr-3" />
                          <span>Account Settings</span>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-50" />
                    <div className="p-1">
                      <DropdownMenuItem 
                          onClick={() => { logout(); navigate('/'); }}
                          className="rounded-xl px-4 py-3 text-xs font-bold text-rose-500 cursor-pointer focus:bg-rose-50 focus:text-rose-600 transition-all uppercase tracking-widest"
                      >
                          <LogOut className="w-4 h-4 mr-3" />
                          <span>Terminate Session</span>
                      </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
