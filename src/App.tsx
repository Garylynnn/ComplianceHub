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
  Check,
  X,
  Clock, 
  Plus, 
  User, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Upload,
  Eye,
  ArrowLeft,
  Filter,
  Search,
  Settings,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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
  DialogTrigger
} from '@/components/ui/dialog';

import { 
  AuditSubmission, 
  AuditStatus, 
  Role, 
  Frequency, 
  EvidenceRow,
  User as UserType,
  AuditLog
} from './types';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_REQUIREMENTS } from './constants';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

function LoginPage({ onLogin }: { onLogin: (user: UserType, token: string) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Maker');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, email, password, role } : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user, data.token);
      toast.success(isRegister ? 'Account created successfully!' : `Welcome back, ${data.user.name}!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-1 text-center bg-indigo-600 text-white rounded-t-xl py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-4">
              <ShieldCheck size={32} />
            </div>
            <CardTitle className="text-2xl font-bold">ComplianceHub</CardTitle>
            <CardDescription className="text-indigo-100">
              {isRegister ? 'Create your secure audit account' : 'Sign in to access the audit system'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200"
                  required
                />
              </div>

              {isRegister && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Role</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('Maker')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        role === 'Maker' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <Plus size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Maker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('Checker')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        role === 'Checker' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <CheckCircle2 size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Checker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('Admin')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        role === 'Admin' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <ShieldCheck size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Admin</span>
                    </button>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-bold shadow-lg shadow-indigo-100 mt-4"
                disabled={loading}
              >
                {loading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 rounded-b-xl py-4 flex justify-center">
            <p className="text-xs text-slate-500 font-medium">Compliance Management System v2.1 (Email Auth)</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [submissions, setSubmissions] = useState<AuditSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState<AuditSubmission | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AuditSubmission>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    frequency: 'Monthly',
    status: 'Draft',
    evidence: []
  });

  // Verify Auth State on load
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsAuthReady(true);
    }
    verifyAuth();
  }, []);

  // Fetch Submissions
  const fetchSubmissions = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data);
      } else {
        toast.error(data.error || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Fetch submissions failed:', error);
    }
  };

  const fetchAuditLogs = async () => {
    if (!token || (user?.role !== 'Checker' && user?.role !== 'Admin')) return;
    try {
      const response = await fetch('/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Fetch audit logs failed:', error);
    }
  };

  const fetchUsers = async () => {
    if (!token || user?.role !== 'Admin') return;
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Fetch users failed:', error);
    }
  };

  useEffect(() => {
    if (isAuthReady && user && token) {
      fetchSubmissions();
      if (user.role === 'Checker' || user.role === 'Admin') {
        fetchAuditLogs();
      }
      if (user.role === 'Admin') {
        fetchUsers();
      }
    }
  }, [isAuthReady, user, token]);

  const handleLogin = (newUser: UserType, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout logging failed:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'Pending Review').length;
    const approved = submissions.filter(s => s.status === 'Approved').length;
    const rejected = submissions.filter(s => s.status === 'Rejected').length;
    
    const chartData = [
      { name: 'Approved', value: approved },
      { name: 'Pending', value: pending },
      { name: 'Rejected', value: rejected },
    ];

    const categoryData = COMPLIANCE_CATEGORIES.map(cat => ({
      name: cat.name,
      count: submissions.filter(s => s.categoryId === cat.id).length
    }));

    return { total, pending, approved, rejected, chartData, categoryData };
  }, [submissions]);

  const handleCategoryChange = (val: string) => {
    const requirements = COMPLIANCE_REQUIREMENTS.filter(r => r.categoryId === val);
    const evidence: EvidenceRow[] = requirements.map(req => ({
      id: Math.random().toString(36).substr(2, 9),
      requirementDescription: req.description,
      textResponse: '',
      remarks: '',
      maker: req.maker,
      checker: req.checker
    }));
    setFormData({ ...formData, categoryId: val, evidence });
  };

  const handleEvidenceChange = (id: string, field: keyof EvidenceRow, value: string) => {
    const newEvidence = formData.evidence?.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    setFormData({ ...formData, evidence: newEvidence });
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newEvidence = formData.evidence?.map(row => 
        row.id === id ? { ...row, fileAttachment: base64String } : row
      );
      setFormData({ ...formData, evidence: newEvidence });
      toast.success(`File "${file.name}" uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (status: AuditStatus) => {
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!user || !token) return;

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit audit');
      }

      setIsFormOpen(false);
      toast.success(status === 'Pending Review' ? 'Audit submitted for review' : 'Draft saved');
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        categoryId: '',
        frequency: 'Monthly',
        status: 'Draft',
        evidence: []
      });
      fetchSubmissions();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleReview = async (id: string, status: 'Approved' | 'Rejected', comments: string, updatedEvidence?: EvidenceRow[]) => {
    if (!user || !token) return;

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          checkerComments: comments,
          evidence: updatedEvidence
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to review audit');
      }

      setSelectedSubmission(null);
      toast.success(`Audit ${status.toLowerCase()} successfully`);
      fetchSubmissions();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const updateReviewRow = (rowId: string, updates: Partial<EvidenceRow>) => {
    if (!selectedSubmission) return;
    const newEvidence = selectedSubmission.evidence.map(row => 
      row.id === rowId ? { ...row, ...updates } : row
    );
    setSelectedSubmission({ ...selectedSubmission, evidence: newEvidence });
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'Pending Review': return <Badge className="bg-amber-500">Pending Review</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-100" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Securing Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ComplianceHub</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Maker-Checker System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{user.role}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-rose-600">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                <LayoutDashboard size={16} className="mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                <FileText size={16} className="mr-2" />
                Submissions
              </TabsTrigger>
              {(user.role === 'Checker' || user.role === 'Admin') && (
                <TabsTrigger value="logs" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                  <ShieldCheck size={16} className="mr-2" />
                  Audit Logs
                </TabsTrigger>
              )}
              {user.role === 'Admin' && (
                <TabsTrigger value="users" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                  <Users size={16} className="mr-2" />
                  Users
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                <Settings size={16} className="mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {user.role === 'Maker' && activeTab === 'submissions' && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
              <Plus size={18} className="mr-2" />
              New Audit Submission
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Audits" value={stats.total} icon={<FileText className="text-indigo-600" />} color="indigo" />
                <StatCard title="Pending Review" value={stats.pending} icon={<Clock className="text-amber-600" />} color="amber" />
                <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 className="text-emerald-600" />} color="emerald" />
                <StatCard title="Rejected" value={stats.rejected} icon={<XCircle className="text-rose-600" />} color="rose" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Audit Status Distribution</CardTitle>
                    <CardDescription>Breakdown of submissions by their current status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Audits by Category</CardTitle>
                    <CardDescription>Volume of compliance checks across different modules</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.categoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts Section */}
              {stats.rejected > 0 && (
                <Card className="border-rose-100 bg-rose-50/50">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-rose-900">Non-Compliance Alerts</CardTitle>
                      <CardDescription className="text-rose-700">There are {stats.rejected} rejected submissions requiring immediate attention.</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              )}
            </motion.div>
          ) : activeTab === 'submissions' ? (
            <motion.div 
              key="submissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold">Audit Submissions</CardTitle>
                      <CardDescription>Manage and track all compliance audit records</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search audits..." className="pl-9 w-[200px] sm:w-[300px] h-9 bg-slate-50 border-none" />
                      </div>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Filter size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Category</TableHead>
                        <TableHead className="font-bold">Frequency</TableHead>
                        <TableHead className="font-bold">Maker</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="text-right font-bold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                        <TableBody>
                          {submissions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                No submissions found. Start by creating a new audit.
                              </TableCell>
                            </TableRow>
                          ) : (
                            submissions.map((sub) => (
                              <TableRow key={sub.id} className="group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium">{sub.date}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700">
                                      {COMPLIANCE_CATEGORIES.find(c => c.id === sub.categoryId)?.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">ID: {sub.id}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-medium">{sub.frequency}</Badge>
                                </TableCell>
                                <TableCell className="text-slate-600 text-sm">{sub.makerName}</TableCell>
                                <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => setSelectedSubmission(sub)}
                                  >
                                    <Eye size={16} className="mr-2" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          ) : activeTab === 'logs' ? (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-base font-bold">System Audit Logs</CardTitle>
                  <CardDescription>ISO 27001 compliant immutable activity tracking</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Timestamp</TableHead>
                        <TableHead className="font-bold">User</TableHead>
                        <TableHead className="font-bold">Action</TableHead>
                        <TableHead className="font-bold">Resource</TableHead>
                        <TableHead className="font-bold">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id} className="text-xs">
                          <TableCell className="text-slate-500 font-mono">
                            {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                          </TableCell>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {log.resourceType}: {log.resourceId}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate" title={log.details}>
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          ) : activeTab === 'users' ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">User Management</CardTitle>
                    <CardDescription>Manage system access and roles</CardDescription>
                  </div>
                  <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={16} className="mr-2" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to the system with a specific role.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                        const role = (form.elements.namedItem('role') as HTMLSelectElement).value;

                        try {
                          const response = await fetch('/api/users', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ name, email, password, role })
                          });
                          const data = await response.json();
                          if (response.ok) {
                            toast.success('User created successfully');
                            setIsUserDialogOpen(false);
                            fetchUsers();
                          } else {
                            toast.error(data.error || 'Failed to create user');
                          }
                        } catch (error) {
                          toast.error('An error occurred');
                        }
                      }} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Initial Password</Label>
                          <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">System Role</Label>
                          <Select name="role" defaultValue="Maker">
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Maker">Maker (Submitter)</SelectItem>
                              <SelectItem value="Checker">Checker (Reviewer)</SelectItem>
                              <SelectItem value="Admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Create User Account
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold">Email</TableHead>
                        <TableHead className="font-bold">Role</TableHead>
                        <TableHead className="font-bold">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.uid}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge className={
                              u.role === 'Admin' ? 'bg-rose-100 text-rose-600' :
                              u.role === 'Checker' ? 'bg-indigo-100 text-indigo-600' :
                              'bg-slate-100 text-slate-600'
                            }>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs">
                            {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Account Settings</CardTitle>
                  <CardDescription>Update your profile and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Change Password</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                      const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                      const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

                      if (newPassword !== confirmPassword) {
                        toast.error('New passwords do not match');
                        return;
                      }

                      try {
                        const response = await fetch('/api/auth/change-password', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ currentPassword, newPassword })
                        });
                        const data = await response.json();
                        if (response.ok) {
                          toast.success('Password updated successfully');
                          form.reset();
                        } else {
                          toast.error(data.error || 'Failed to update password');
                        }
                      } catch (error) {
                        toast.error('An error occurred');
                      }
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" required className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" name="newPassword" type="password" required className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required className="bg-slate-50" />
                      </div>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                        Update Password
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Audit Submission Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
          <DialogHeader className="p-6 bg-indigo-600 text-white rounded-t-xl">
            <DialogTitle className="text-xl font-bold">New Audit Submission</DialogTitle>
            <DialogDescription className="text-indigo-100">
              Complete the compliance requirements and upload evidence for review.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-8">
            {/* Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Date</Label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
                <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLIANCE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Frequency</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(val: Frequency) => setFormData({ ...formData, frequency: val })}
                >
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Evidence Table */}
            {formData.categoryId ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600">Evidence Requirements</h3>
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                    {formData.evidence?.length} Points to Audit
                  </Badge>
                </div>
                <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[300px] font-bold">Requirement</TableHead>
                        <TableHead className="w-[150px] font-bold">Owner (M/C)</TableHead>
                        <TableHead className="font-bold">Response / Evidence</TableHead>
                        <TableHead className="font-bold">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.evidence?.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="align-top">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{row.requirementDescription}</p>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              {row.maker && (
                                <div className="flex items-center gap-1.5">
                                  <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[9px] px-1 h-4">M</Badge>
                                  <span className="text-[10px] font-bold text-slate-600 truncate">{row.maker}</span>
                                </div>
                              )}
                              {row.checker && (
                                <div className="flex items-center gap-1.5">
                                  <Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] px-1 h-4">C</Badge>
                                  <span className="text-[10px] font-bold text-slate-500 truncate">{row.checker}</span>
                                </div>
                              )}
                              {!row.maker && !row.checker && <span className="text-[10px] text-slate-400">Not Assigned</span>}
                            </div>
                          </TableCell>
                          <TableCell className="align-top space-y-3">
                            <Textarea 
                              placeholder="Describe your findings..." 
                              className="min-h-[80px] text-sm bg-white border-slate-200 focus:ring-indigo-500"
                              value={row.textResponse}
                              onChange={e => handleEvidenceChange(row.id, 'textResponse', e.target.value)}
                            />
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-[10px] uppercase font-bold tracking-wider relative overflow-hidden"
                                  onClick={() => document.getElementById(`file-upload-${row.id}`)?.click()}
                                >
                                  <Upload size={12} className="mr-1.5" />
                                  {row.fileAttachment ? "Change File" : "Upload File"}
                                  <input 
                                    id={`file-upload-${row.id}`}
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*,application/pdf"
                                    onChange={(e) => handleFileUpload(row.id, e)}
                                  />
                                </Button>
                                <span className="text-[10px] text-slate-400 font-medium">PDF, PNG, JPG (Max 5MB)</span>
                              </div>
                              {row.fileAttachment && (
                                <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                                  <CheckCircle2 size={14} className="text-indigo-600" />
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase">File Attached</span>
                                  <Button 
                                    variant="ghost" 
                                    size="xs" 
                                    className="h-5 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 ml-auto"
                                    onClick={() => {
                                      const newEvidence = formData.evidence?.map(r => 
                                        r.id === row.id ? { ...r, fileAttachment: undefined } : r
                                      );
                                      setFormData({ ...formData, evidence: newEvidence });
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Input 
                              placeholder="Additional notes..." 
                              className="text-sm bg-white border-slate-200 focus:ring-indigo-500"
                              value={row.remarks}
                              onChange={e => handleEvidenceChange(row.id, 'remarks', e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Filter size={24} />
                </div>
                <p className="text-sm font-medium text-slate-500">Select a category to load audit requirements</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-3 m-0 rounded-b-xl">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="font-bold">Cancel</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSubmit('Draft')} className="font-bold">Save as Draft</Button>
              <Button onClick={() => handleSubmit('Pending Review')} className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
                Submit for Review
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
          {selectedSubmission && (
            <>
              <DialogHeader className={`p-6 text-white rounded-t-xl ${
                selectedSubmission.status === 'Approved' ? 'bg-emerald-600' : 
                selectedSubmission.status === 'Rejected' ? 'bg-rose-600' : 'bg-indigo-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold">Audit Review: {COMPLIANCE_CATEGORIES.find(c => c.id === selectedSubmission.categoryId)?.name}</DialogTitle>
                    <DialogDescription className="text-white/80">
                      Submitted by {selectedSubmission.makerName} on {selectedSubmission.date}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </DialogHeader>

              <div className="p-6 space-y-8">
                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <DetailItem label="Submission ID" value={selectedSubmission.id} />
                  <DetailItem label="Frequency" value={selectedSubmission.frequency} />
                  <DetailItem label="Maker" value={selectedSubmission.makerName} />
                  <DetailItem label="Checker" value={selectedSubmission.checkerName || 'Not Assigned'} />
                </div>

                {/* Evidence Table (Read Only) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Evidence Provided</h3>
                  <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[300px] font-bold">Requirement</TableHead>
                          <TableHead className="w-[150px] font-bold">Owner (M/C)</TableHead>
                          <TableHead className="font-bold">Maker Response</TableHead>
                          <TableHead className="font-bold">Remarks</TableHead>
                          <TableHead className="w-[180px] font-bold">Reviewer Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSubmission.evidence.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="align-top font-medium text-slate-700">{row.requirementDescription}</TableCell>
                            <TableCell className="align-top">
                              <div className="space-y-1">
                                {row.maker && (
                                  <div className="flex items-center gap-1.5">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[9px] px-1 h-4">M</Badge>
                                    <span className="text-[10px] font-bold text-slate-600 truncate">{row.maker}</span>
                                  </div>
                                )}
                                {row.checker && (
                                  <div className="flex items-center gap-1.5">
                                    <Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[9px] px-1 h-4">C</Badge>
                                    <span className="text-[10px] font-bold text-slate-500 truncate">{row.checker}</span>
                                  </div>
                                )}
                                {!row.maker && !row.checker && <span className="text-[10px] text-slate-400">Not Assigned</span>}
                              </div>
                            </TableCell>
                            <TableCell className="align-top">
                              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{row.textResponse || 'No response provided'}</p>
                              {row.fileAttachment && (
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="px-0 h-auto text-indigo-600 font-bold text-xs mt-2"
                                  onClick={() => {
                                    const newWindow = window.open();
                                    if (newWindow) {
                                      newWindow.document.write(`<iframe src="${row.fileAttachment}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                    } else {
                                      toast.error("Pop-up blocked. Please allow pop-ups to view attachments.");
                                    }
                                  }}
                                >
                                  View Attachment
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="align-top text-sm text-slate-500 italic">{row.remarks || '-'}</TableCell>
                            <TableCell className="align-top">
                              {user.role === 'Checker' && selectedSubmission.status === 'Pending Review' ? (
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Button 
                                      size="xs" 
                                      variant={row.status === 'Pass' ? 'default' : 'outline'}
                                      className={`h-7 px-2 text-[10px] font-bold transition-all ${row.status === 'Pass' ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' : 'text-slate-400 border-slate-200 hover:border-emerald-200 hover:text-emerald-600'}`}
                                      onClick={() => updateReviewRow(row.id, { status: 'Pass' })}
                                    >
                                      <Check size={12} className="mr-1" /> Pass
                                    </Button>
                                    <Button 
                                      size="xs" 
                                      variant={row.status === 'Fail' ? 'destructive' : 'outline'}
                                      className={`h-7 px-2 text-[10px] font-bold transition-all ${row.status === 'Fail' ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' : 'text-slate-400 border-slate-200 hover:border-rose-200 hover:text-rose-600'}`}
                                      onClick={() => updateReviewRow(row.id, { status: 'Fail' })}
                                    >
                                      <X size={12} className="mr-1" /> Fail
                                    </Button>
                                  </div>
                                  <Input 
                                    placeholder="Reviewer remarks..." 
                                    className="text-[10px] h-7 bg-white border-slate-200 focus:ring-1 focus:ring-indigo-500"
                                    value={row.checkerRemarks || ''}
                                    onChange={(e) => updateReviewRow(row.id, { checkerRemarks: e.target.value })}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {row.status ? (
                                    <Badge className={`text-[10px] font-bold uppercase tracking-wider ${
                                      row.status === 'Pass' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                                    }`}>
                                      {row.status === 'Pass' ? <Check size={10} className="mr-1 inline" /> : <X size={10} className="mr-1 inline" />}
                                      {row.status}
                                    </Badge>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Not reviewed</span>
                                  )}
                                  {row.checkerRemarks && (
                                    <p className="text-[10px] text-slate-500 italic leading-snug">"{row.checkerRemarks}"</p>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Checker Comments if Approved/Rejected */}
                {(selectedSubmission.status === 'Approved' || selectedSubmission.status === 'Rejected') && (
                  <div className={`p-4 rounded-xl border ${
                    selectedSubmission.status === 'Approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                  }`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      selectedSubmission.status === 'Approved' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>Checker Comments</h4>
                    <p className="text-sm text-slate-700 italic">"{selectedSubmission.checkerComments || 'No comments provided'}"</p>
                  </div>
                )}

                {/* Checker Actions */}
                {user.role === 'Checker' && selectedSubmission.status === 'Pending Review' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reviewer Comments</Label>
                      <Textarea 
                        id="checker-comments"
                        placeholder="Provide feedback for approval or rejection..." 
                        className="min-h-[100px] bg-slate-50 border-slate-200 focus:ring-indigo-500"
                        defaultValue={selectedSubmission.checkerComments}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button 
                        variant="outline" 
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                        onClick={() => {
                          const comments = (document.getElementById('checker-comments') as HTMLTextAreaElement).value;
                          if (!comments) {
                            toast.error('Comments are mandatory for rejection');
                            return;
                          }
                          handleReview(selectedSubmission.id, 'Rejected', comments, selectedSubmission.evidence);
                        }}
                      >
                        <XCircle size={18} className="mr-2" />
                        Reject Submission
                      </Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100"
                        onClick={() => {
                          const comments = (document.getElementById('checker-comments') as HTMLTextAreaElement).value;
                          const allReviewed = selectedSubmission.evidence.every(r => r.status);
                          if (!allReviewed) {
                            toast.error('Please review all points (Pass/Fail) before approval');
                            return;
                          }
                          handleReview(selectedSubmission.id, 'Approved', comments || 'All points verified.', selectedSubmission.evidence);
                        }}
                      >
                        <CheckCircle2 size={18} className="mr-2" />
                        Approve Audit
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="p-6 bg-slate-50 border-t m-0 rounded-b-xl">
                <Button variant="ghost" onClick={() => setSelectedSubmission(null)} className="font-bold">Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
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

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}
