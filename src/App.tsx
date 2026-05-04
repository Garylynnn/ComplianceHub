/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  ShieldCheck, 
  Eye,
  Search,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { 
  AuditSubmission, 
  AuditStatus, 
  Role, 
  EvidenceRow,
  User as UserType,
  AuditLog
} from './types';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_REQUIREMENTS } from './constants';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

// --- Helper Components ---

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: 'indigo' | 'emerald' | 'amber' | 'rose' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          </div>
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginPage({ onLogin }: { onLogin: (user: UserType, token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user, data.token);
      toast.success(`Welcome ${data.user.name}!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center bg-indigo-600 text-white rounded-t-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 mb-4 text-white">
            <ShieldCheck size={32} />
          </div>
          <CardTitle className="text-2xl font-bold">ComplianceHub</CardTitle>
          <CardDescription className="text-indigo-100">Audit Management System v2.1</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="agent@organization.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4 h-12 font-bold" disabled={loading}>
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider text-center">
              Restricted Access
            </p>
            <p className="text-[10px] text-amber-600 mt-1 text-center">
              Registration is disabled. Contact your System Administrator for account provisioning.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [submissions, setSubmissions] = useState<AuditSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState<AuditSubmission | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(COMPLIANCE_CATEGORIES[0].id);
  const [frequency, setFrequency] = useState('Monthly');
  const [newUserRole, setNewUserRole] = useState('Maker');

  useEffect(() => {
    async function verify() {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (res.ok) setUser(data.user);
          else localStorage.removeItem('token');
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
      setIsAuthReady(true);
    }
    verify();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const sRes = await fetch('/api/submissions', { headers: { 'Authorization': `Bearer ${token}` } });
      if (sRes.ok) setSubmissions(await sRes.json());
      
      if (user?.role === 'Checker' || user?.role === 'Admin') {
        const lRes = await fetch('/api/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } });
        if (lRes.ok) setAuditLogs(await lRes.json());
      }

      if (user?.role === 'Admin') {
        const uRes = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (uRes.ok) setUsersList(await uRes.json());
      }
    } catch (e) {
      console.error('Fetch failed', e);
    }
  };

  useEffect(() => {
    if (isAuthReady && user) fetchData();
  }, [isAuthReady, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out');
  };

  const dashboardStats = useMemo(() => {
    const pending = submissions.filter(s => s.status === 'Pending Review').length;
    const approved = submissions.filter(s => s.status === 'Approved').length;
    const rejected = submissions.filter(s => s.status === 'Rejected').length;
    return { total: submissions.length, pending, approved, rejected };
  }, [submissions]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-indigo-600 animate-pulse">Initializing...</div>;
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={(u, t) => { setUser(u); setToken(t); }} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Toaster position="top-right" richColors />
      
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="font-black text-slate-800 tracking-tight leading-none">ComplianceHub</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maker-Checker V2.1</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-800">{user.name}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase">{user.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-rose-600 transition-colors">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <LayoutDashboard size={16} className="mr-2" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <FileText size={16} className="mr-2" /> Submissions
              </TabsTrigger>
              {(user.role === 'Checker' || user.role === 'Admin' || user.role === 'Agent') && (
                <TabsTrigger value="audit-logs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <ShieldCheck size={16} className="mr-2" /> Logs
                </TabsTrigger>
              )}
              {user.role === 'Admin' && (
                <TabsTrigger value="users" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <Users size={16} className="mr-2" /> Users
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <Settings size={16} className="mr-2" /> Settings
              </TabsTrigger>
            </TabsList>
            
            {(user.role === 'Maker' || user.role === 'Agent') && (
              <Button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold">
                <Plus size={18} className="mr-2" /> New Submission
              </Button>
            )}
          </div>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Audits" value={dashboardStats.total} icon={<FileText />} color="indigo" />
              <StatCard title="Pending Review" value={dashboardStats.pending} icon={<Clock />} color="amber" />
              <StatCard title="Approved" value={dashboardStats.approved} icon={<CheckCircle2 />} color="emerald" />
              <StatCard title="Rejected" value={dashboardStats.rejected} icon={<XCircle />} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600" />
                    Regulatory Compliance Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={submissions.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => format(new Date(val), 'MMM dd')} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <RechartsTooltip />
                      <Bar dataKey="id" name="Audit Points" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Approved', value: dashboardStats.approved },
                          { name: 'Pending', value: dashboardStats.pending },
                          { name: 'Rejected', value: dashboardStats.rejected },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <Card className="border-none shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Category</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Maker</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-900">{s.id}</TableCell>
                      <TableCell className="font-medium">{COMPLIANCE_CATEGORIES.find(c => c.id === s.categoryId)?.name || s.categoryId}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{format(new Date(s.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-slate-500">{s.makerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-bold border-none ${
                          s.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                          s.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-indigo-50 hover:text-indigo-600" onClick={() => setSelectedSubmission(s)}>
                          <Eye size={16} className="mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400 font-medium italic">No submissions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="audit-logs">
             <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest w-40">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest w-40">User</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-slate-500 font-mono">{format(new Date(log.timestamp), 'dd/MM HH:mm')}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-700">{log.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-200">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage organization users and their roles.</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger render={<Button variant="default" size="sm" className="bg-indigo-600"><Plus size={16} className="mr-1" /> Create User</Button>} />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Provision New Audit User</DialogTitle>
                      <DialogDescription>Create a new account with specific compliance roles.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4 pt-4" onSubmit={async (e) => {
                      e.preventDefault();
                      const f = e.target as HTMLFormElement;
                      const name = (f.elements.namedItem('new-u-name') as HTMLInputElement).value;
                      const email = (f.elements.namedItem('new-u-email') as HTMLInputElement).value;
                      const password = (f.elements.namedItem('new-u-pass') as HTMLInputElement).value;
                      const role = (f.querySelector('[name="new-u-role"]') as any).value;
                      
                      try {
                        const res = await fetch('/api/users', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ name, email, password, role })
                        });
                        if (res.ok) {
                          toast.success('User created successfully');
                          f.reset();
                          fetchData();
                        } else {
                          const err = await res.json();
                          toast.error(err.error);
                        }
                      } catch (err) { toast.error('Failed to create user'); }
                    }}>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input name="new-u-name" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input name="new-u-email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Temporary Password</Label>
                        <Input name="new-u-pass" type="password" required />
                      </div>
                      <div className="space-y-2">
                        <Label>System Role</Label>
                        <Select name="new-u-role" value={newUserRole} onValueChange={setNewUserRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Maker">Maker (Compliance Agent)</SelectItem>
                            <SelectItem value="Checker">Checker (Compliance Auditor)</SelectItem>
                            <SelectItem value="Agent">IT Agent (Maker + Checker)</SelectItem>
                            <SelectItem value="Admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600">Provision Account</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Email</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Role</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((u) => (
                    <TableRow key={u.uid}>
                      <TableCell className="font-bold">{u.name}</TableCell>
                      <TableCell className="text-slate-500">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-bold uppercase tracking-wider text-[10px]">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your personal account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={user.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={user.role} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Change your password periodically to stay secure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const current = (form.elements.namedItem('current-password') as HTMLInputElement).value;
                    const newPass = (form.elements.namedItem('new-password') as HTMLInputElement).value;
                    
                    if (!current || !newPass) return toast.error('Both fields are required');

                    try {
                      const res = await fetch('/api/auth/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        toast.success('Password updated successfully');
                        form.reset();
                      } else {
                        toast.error(data.error);
                      }
                    } catch (err) {
                      toast.error('Failed to update password');
                    }
                  }}>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600">Update Password</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Compliance Framework Configuration</CardTitle>
                  <CardDescription>Current mapping of regulatory requirements to internal owners (ISO 27001).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COMPLIANCE_CATEGORIES.map(cat => (
                      <div key={cat.id} className="p-4 border rounded-xl bg-slate-50">
                        <h4 className="font-bold text-slate-800 flex items-center justify-between">
                          {cat.name}
                          <Badge variant="outline" className="text-[9px]">{cat.id}</Badge>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 mb-3">{cat.description}</p>
                        <div className="space-y-2">
                          {COMPLIANCE_REQUIREMENTS.filter(r => r.categoryId === cat.id).map(req => (
                            <div key={req.id} className="text-[10px] bg-white p-2 rounded border border-slate-100 flex justify-between items-center">
                              <span className="truncate pr-2">{req.description}</span>
                              <div className="flex gap-1 shrink-0">
                                {req.maker && <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-50 text-[8px] px-1 h-4">{req.maker}</Badge>}
                                {req.checker && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 text-[8px] px-1 h-4">{req.checker}</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* New Submission Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 border-none">
          <div className="bg-indigo-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black">New Audit Submission</h2>
                <p className="text-indigo-100 text-sm">Complete the compliance requirements and upload evidence for review.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFormOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <LogOut size={20} className="rotate-90" />
              </Button>
            </div>
          </div>

          <form className="space-y-0" onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target as HTMLFormElement;
            const categoryId = selectedCategoryId;
            const frequency = (f.querySelector('[name="frequency"]') as any).value;
            const date = (f.elements.namedItem('audit-date') as HTMLInputElement).value;
            
            // Collect evidence rows
            const evidence: EvidenceRow[] = COMPLIANCE_REQUIREMENTS
              .filter(r => r.categoryId === categoryId)
              .map(r => {
                const textResponse = (f.elements.namedItem(`response-${r.id}`) as HTMLTextAreaElement).value;
                const remarks = (f.elements.namedItem(`remarks-${r.id}`) as HTMLInputElement).value;
                const makerVerdict = (f.elements.namedItem(`verdict-${r.id}`) as any)?.value || 'Pass';
                const fileAttachment = (f.elements.namedItem(`file-data-${r.id}`) as HTMLInputElement)?.value;
                
                return {
                  id: r.id,
                  requirementDescription: r.description,
                  textResponse,
                  remarks,
                  fileAttachment,
                  makerVerdict: makerVerdict as 'Pass' | 'Fail',
                  maker: user.name,
                  status: 'Pending Review'
                };
              });

            if (evidence.some(e => !e.textResponse)) {
              return toast.error('Please provide a response for all requirement points');
            }

            try {
              const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                  date,
                  categoryId,
                  frequency,
                  status: 'Pending Review',
                  evidence
                })
              });

              if (res.ok) {
                toast.success('Audit point submitted for review');
                setIsFormOpen(false);
                fetchData();
              } else {
                const err = await res.json();
                toast.error(err.error);
              }
            } catch (err) {
              toast.error('Submission failed');
            }
          }}>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Audit Date</Label>
                <Input name="audit-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="bg-slate-50 border-slate-200 h-10" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</Label>
                <Select name="category" required value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLIANCE_CATEGORIES.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Frequency</Label>
                <Select name="frequency" value={frequency} onValueChange={setFrequency} required>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Evidence Requirements</h3>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3">
                  {COMPLIANCE_REQUIREMENTS.filter(r => r.categoryId === selectedCategoryId).length} Points to Audit
                </Badge>
              </div>
              
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Requirement</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Owner (M/C)</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Response / Evidence</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Pass / Fail (Maker)</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COMPLIANCE_REQUIREMENTS.filter(r => r.categoryId === selectedCategoryId).map(req => (
                      <TableRow key={req.id} className="align-top">
                        <TableCell className="w-[25%] py-6 text-sm font-medium text-slate-700 leading-relaxed">
                          {req.description}
                        </TableCell>
                        <TableCell className="w-[12%] py-6">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <Badge className="h-4 w-4 p-0 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[8px] font-bold border-none">M</Badge>
                               <span className="text-[10px] font-bold text-slate-600">{req.maker || 'Unassigned'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <Badge className="h-4 w-4 p-0 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[8px] font-bold border-none">C</Badge>
                               <span className="text-[10px] font-bold text-slate-500">{req.checker || 'Unassigned'}</span>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[30%] py-6 space-y-3">
                          <Textarea 
                            name={`response-${req.id}`} 
                            placeholder="Describe your findings..." 
                            required 
                            className="text-xs min-h-[80px] bg-slate-50/50 border-slate-200 resize-none focus:bg-white transition-colors" 
                          />
                          <div className="flex items-center gap-3">
                             <input
                               type="file"
                               id={`file-${req.id}`}
                               className="hidden"
                               onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                   if (file.size > 5 * 1024 * 1024) {
                                     return toast.error('File size exceeds 5MB limit');
                                   }
                                   const reader = new FileReader();
                                   reader.onloadend = () => {
                                     const base64String = reader.result as string;
                                     // We'll store the base64 in a hidden input to pick it up on submit
                                     const hiddenInput = document.getElementById(`file-data-${req.id}`) as HTMLInputElement;
                                     if (hiddenInput) hiddenInput.value = base64String;
                                     
                                     const fileNameSpan = document.getElementById(`file-name-${req.id}`);
                                     if (fileNameSpan) fileNameSpan.textContent = file.name;
                                     
                                     toast.success(`Attached: ${file.name}`);
                                   };
                                   reader.readAsDataURL(file);
                                 }
                               }}
                             />
                             <input type="hidden" name={`file-data-${req.id}`} id={`file-data-${req.id}`} />
                             <Button 
                               type="button" 
                               variant="outline" 
                               size="sm" 
                               className="h-8 text-[10px] font-black uppercase tracking-wider bg-white border-slate-200 hover:bg-slate-50"
                               onClick={() => document.getElementById(`file-${req.id}`)?.click()}
                             >
                               <Plus size={14} className="mr-1 text-slate-400" /> Upload File
                             </Button>
                             <div className="flex flex-col">
                               <span id={`file-name-${req.id}`} className="text-[10px] text-indigo-600 font-bold truncate max-w-[150px]"></span>
                               <span className="text-[9px] text-slate-400 font-medium">PDF, PNG, JPG (Max 5MB)</span>
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[13%] py-6">
                           <Select name={`verdict-${req.id}`} defaultValue="Pass" required>
                             <SelectTrigger className="h-9 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="Pass" className="text-emerald-600 text-[10px] font-bold">Pass</SelectItem>
                               <SelectItem value="Fail" className="text-rose-600 text-[10px] font-bold">Fail</SelectItem>
                             </SelectContent>
                           </Select>
                        </TableCell>
                        <TableCell className="w-[20%] py-6">
                          <Input 
                            name={`remarks-${req.id}`} 
                            placeholder="Additional notes..." 
                            className="text-xs bg-slate-50/50 border-slate-200 h-10" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3 rounded-b-xl">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="text-slate-500 font-bold">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-black px-10 h-11 text-sm tracking-wide shadow-lg shadow-indigo-100">
                Submit for Review
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(o) => !o && setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">Audit Review: {selectedSubmission.id}</DialogTitle>
                  <Badge className={
                    selectedSubmission.status === 'Approved' ? 'bg-emerald-600' :
                    selectedSubmission.status === 'Rejected' ? 'bg-rose-600' : 'bg-indigo-600'
                  }>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Submitted by {selectedSubmission.makerName} on {format(new Date(selectedSubmission.date), 'PPP')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Maker</span>
                    <span className="text-sm font-bold">{selectedSubmission.makerName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Checker</span>
                    <span className="text-sm font-bold">{selectedSubmission.checkerName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Category</span>
                    <span className="text-sm font-bold">{COMPLIANCE_CATEGORIES.find(c => c.id === selectedSubmission.categoryId)?.name}</span>
                  </div>
                   <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Frequency</span>
                    <span className="text-sm font-bold">{selectedSubmission.frequency}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Evidence Verification Results</h4>
                    <span className="text-[10px] font-bold text-slate-400">Total Points: {selectedSubmission.evidence.length}</span>
                  </div>
                  
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[10px] font-bold uppercase py-3">Point</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase py-3">Maker Verdict</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase py-3">Evidence / Remarks</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase py-3 text-right">Checker Verdict</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSubmission.evidence.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="max-w-[200px]">
                              <p className="text-xs font-bold text-slate-700 leading-tight">{row.requirementDescription}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                (row.makerVerdict || 'Pass') === 'Pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }>
                                {row.makerVerdict || 'Pass'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                               <div className="space-y-1">
                                 <p className="text-xs italic text-slate-600">"{row.textResponse}"</p>
                                 <div className="flex items-center gap-2">
                                   {row.remarks && <p className="text-[10px] text-slate-400">Notes: {row.remarks}</p>}
                                   {row.fileAttachment && (
                                     <a 
                                       href={row.fileAttachment} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                     >
                                       <Paperclip size={10} /> View Attachment
                                     </a>
                                   )}
                                 </div>
                               </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-1">
                                  <Badge 
                                    className={`cursor-pointer hover:opacity-80 ${(row.status || 'Pending Review') === 'Approved' ? 'bg-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                                    onClick={() => {
                                      if (selectedSubmission.status !== 'Pending Review') return;
                                      const newEvidence = [...selectedSubmission.evidence];
                                      newEvidence[idx] = { ...newEvidence[idx], status: 'Approved' };
                                      setSelectedSubmission({ ...selectedSubmission, evidence: newEvidence });
                                    }}
                                  >
                                    Pass
                                  </Badge>
                                  <Badge 
                                    className={`cursor-pointer hover:opacity-80 ${(row.status || 'Pending Review') === 'Rejected' ? 'bg-rose-600' : 'bg-slate-100 text-slate-400'}`}
                                    onClick={() => {
                                      if (selectedSubmission.status !== 'Pending Review') return;
                                      const newEvidence = [...selectedSubmission.evidence];
                                      newEvidence[idx] = { ...newEvidence[idx], status: 'Rejected' };
                                      setSelectedSubmission({ ...selectedSubmission, evidence: newEvidence });
                                    }}
                                  >
                                    Fail
                                  </Badge>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {(selectedSubmission.status === 'Approved' || selectedSubmission.status === 'Rejected') && (
                  <div className={`p-4 rounded-xl border ${selectedSubmission.status === 'Approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <h5 className={`text-xs font-bold uppercase mb-2 ${selectedSubmission.status === 'Approved' ? 'text-emerald-700' : 'text-rose-700'}`}>Checker Comments</h5>
                    <p className="text-sm italic">"{selectedSubmission.checkerComments || 'No comments'}"</p>
                  </div>
                )}

                {(user.role === 'Checker' || user.role === 'Agent' || user.role === 'Admin') && selectedSubmission.status === 'Pending Review' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Checker Review Comments</Label>
                      <Textarea id="checker-comments" placeholder="Add your review notes here..." className="bg-slate-50" />
                    </div>
                    <div className="flex gap-3">
                       <Button 
                        variant="outline" 
                        className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                        onClick={async () => {
                          const comments = (document.getElementById('checker-comments') as HTMLTextAreaElement).value;
                          if (!comments) return toast.error('Comments required for rejection');
                          
                          const response = await fetch(`/api/submissions/${selectedSubmission.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ 
                              status: 'Rejected', 
                              checkerComments: comments,
                              evidence: selectedSubmission.evidence
                            })
                          });
                          if (response.ok) { toast.success('Audit Rejected'); setSelectedSubmission(null); fetchData(); }
                        }}
                       >
                         Reject Audit
                       </Button>
                       <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={async () => {
                          const comments = (document.getElementById('checker-comments') as HTMLTextAreaElement).value;
                          const response = await fetch(`/api/submissions/${selectedSubmission.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ 
                              status: 'Approved', 
                              checkerComments: comments || 'Verified by checker.',
                              evidence: selectedSubmission.evidence
                            })
                          });
                          if (response.ok) { toast.success('Audit Approved'); setSelectedSubmission(null); fetchData(); }
                        }}
                       >
                         Approve Audit
                       </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
