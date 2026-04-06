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
  User, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Upload,
  Eye,
  ArrowLeft,
  Filter,
  Search
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
  EvidenceRow 
} from './types';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_REQUIREMENTS } from './constants';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function App() {
  const [role, setRole] = useState<Role>('Maker');
  const [submissions, setSubmissions] = useState<AuditSubmission[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState<AuditSubmission | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<AuditSubmission>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    frequency: 'Monthly',
    maker: 'Maker User',
    checker: 'Checker User',
    status: 'Draft',
    evidence: []
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('compliance_submissions');
    if (saved) {
      setSubmissions(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('compliance_submissions', JSON.stringify(submissions));
  }, [submissions]);

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
      remarks: ''
    }));
    setFormData({ ...formData, categoryId: val, evidence });
  };

  const handleEvidenceChange = (id: string, field: keyof EvidenceRow, value: string) => {
    const newEvidence = formData.evidence?.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    setFormData({ ...formData, evidence: newEvidence });
  };

  const handleSubmit = (status: AuditStatus) => {
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    const newSubmission: AuditSubmission = {
      ...formData as AuditSubmission,
      id: Math.random().toString(36).substr(2, 9),
      status: status
    };

    setSubmissions([newSubmission, ...submissions]);
    setIsFormOpen(false);
    toast.success(status === 'Pending Review' ? 'Audit submitted for review' : 'Draft saved');
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: '',
      frequency: 'Monthly',
      maker: 'Maker User',
      checker: 'Checker User',
      status: 'Draft',
      evidence: []
    });
  };

  const handleReview = (id: string, status: 'Approved' | 'Rejected', comments: string) => {
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, status, checkerComments: comments } : s
    ));
    setSelectedSubmission(null);
    toast.success(`Audit ${status.toLowerCase()} successfully`);
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'Pending Review': return <Badge className="bg-amber-500">Pending Review</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

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
            <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
              <button 
                onClick={() => setRole('Maker')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${role === 'Maker' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Maker
              </button>
              <button 
                onClick={() => setRole('Checker')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${role === 'Checker' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Checker
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {role === 'Maker' ? 'M' : 'C'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-none">{role === 'Maker' ? 'Maker User' : 'Checker User'}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{role}</p>
              </div>
            </div>
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
            </TabsList>
          </Tabs>

          {role === 'Maker' && activeTab === 'submissions' && (
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
          ) : (
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
                            <TableCell className="text-slate-600 text-sm">{sub.maker}</TableCell>
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
                          <TableCell className="align-top space-y-3">
                            <Textarea 
                              placeholder="Describe your findings..." 
                              className="min-h-[80px] text-sm bg-white border-slate-200 focus:ring-indigo-500"
                              value={row.textResponse}
                              onChange={e => handleEvidenceChange(row.id, 'textResponse', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-wider">
                                <Upload size={12} className="mr-1.5" />
                                Upload File
                              </Button>
                              <span className="text-[10px] text-slate-400 font-medium">PDF, PNG, JPG (Max 5MB)</span>
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
                      Submitted by {selectedSubmission.maker} on {selectedSubmission.date}
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
                  <DetailItem label="Maker" value={selectedSubmission.maker} />
                  <DetailItem label="Checker" value={selectedSubmission.checker} />
                </div>

                {/* Evidence Table (Read Only) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Evidence Provided</h3>
                  <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
                    <Table className="min-w-[800px]">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[300px] font-bold">Requirement</TableHead>
                          <TableHead className="font-bold">Maker Response</TableHead>
                          <TableHead className="font-bold">Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSubmission.evidence.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="align-top font-medium text-slate-700">{row.requirementDescription}</TableCell>
                            <TableCell className="align-top">
                              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{row.textResponse || 'No response provided'}</p>
                              {row.fileAttachment && (
                                <Button variant="link" size="sm" className="px-0 h-auto text-indigo-600 font-bold text-xs mt-2">
                                  View Attachment
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="align-top text-sm text-slate-500 italic">{row.remarks || '-'}</TableCell>
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
                {role === 'Checker' && selectedSubmission.status === 'Pending Review' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reviewer Comments</Label>
                      <Textarea 
                        id="checker-comments"
                        placeholder="Provide feedback for approval or rejection..." 
                        className="min-h-[100px] bg-slate-50 border-slate-200 focus:ring-indigo-500"
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
                          handleReview(selectedSubmission.id, 'Rejected', comments);
                        }}
                      >
                        <XCircle size={18} className="mr-2" />
                        Reject Submission
                      </Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100"
                        onClick={() => {
                          const comments = (document.getElementById('checker-comments') as HTMLTextAreaElement).value;
                          handleReview(selectedSubmission.id, 'Approved', comments);
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
