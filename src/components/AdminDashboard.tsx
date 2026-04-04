import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, Users, LogOut, Check, X, Eye, TrendingUp, Package, Clock, Calendar, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { User as UserType, Proposal, Meeting } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'campaigns' | 'meetings'>('overview');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
    fetchMeetings();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch(`/api/proposals?role=admin`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`/api/meetings?role=admin`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchProposals();
        setSelectedProposal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (id: number, progress: string) => {
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      if (res.ok) {
        fetchProposals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    active: proposals.filter(p => p.status === 'approved' && p.progress !== 'completed').length,
  };

  // Data for Charts
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#D97706' },
    { name: 'Approved', value: stats.approved, color: '#16A34A' },
    { name: 'Rejected', value: proposals.filter(p => p.status === 'rejected').length, color: '#DC2626' },
  ].filter(d => d.value > 0);

  const budgetData = proposals
    .filter(p => p.status === 'approved')
    .map(p => ({
      name: p.platform_handle.length > 10 ? p.platform_handle.substring(0, 10) + '...' : p.platform_handle,
      budget: p.budget,
    }))
    .slice(0, 8);

  const reachData = proposals
    .filter(p => p.status === 'approved' && p.progress === 'completed')
    .map(p => ({
      name: p.platform_handle.length > 10 ? p.platform_handle.substring(0, 10) + '...' : p.platform_handle,
      expected: p.expected_reach,
      actual: p.actual_reach || 0,
    }))
    .slice(0, 8);

  return (
    <div className="flex min-h-screen bg-beige">
      {/* Sidebar */}
      <aside className="w-64 bg-forest text-white p-6 flex flex-col">
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold">EVERGREENS</h2>
          <p className="text-sage text-xs">Admin Console</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'proposals' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <FileText size={20} />
            Proposals
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'campaigns' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <TrendingUp size={20} />
            Active Campaigns
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'meetings' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <Calendar size={20} />
            Meetings
          </button>
        </nav>

        <div className="pt-6 border-t border-sage/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-forest font-bold">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sage truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sage hover:text-white transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display font-bold text-forest">
              {activeTab === 'overview' && 'Brand Overview'}
              {activeTab === 'proposals' && 'Influencer Proposals'}
              {activeTab === 'campaigns' && 'Campaign Status'}
              {activeTab === 'meetings' && 'Meeting Requests'}
            </h1>
            <button 
              onClick={() => {
                setIsLoading(true);
                fetchProposals();
                fetchMeetings();
              }}
              className="p-2 text-sage hover:text-forest transition-colors"
              title="Refresh Data"
            >
              <Activity size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-sage uppercase tracking-widest font-bold">Mumbai, India</p>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Proposals', value: stats.total, icon: FileText, color: 'text-forest' },
                { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600' },
                { label: 'Approved', value: stats.approved, icon: Check, color: 'text-green-600' },
                { label: 'Active Campaigns', value: stats.active, icon: TrendingUp, color: 'text-blue-600' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <p className="text-3xl font-display font-bold text-forest">{stat.value}</p>
                  <p className="text-xs text-sage font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Budget Distribution Chart */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 size={18} className="text-forest" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-forest">Budget Distribution (Approved)</h3>
                </div>
                <div className="h-[300px] w-full">
                  {budgetData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3E0" />
                        <XAxis dataKey="name" fontSize={10} tick={{ fill: '#8E9299' }} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} tick={{ fill: '#8E9299' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a3a32', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                          cursor={{ fill: '#f5f5f0' }}
                        />
                        <Bar dataKey="budget" fill="#1a3a32" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sage text-sm italic">No approved proposals yet</div>
                  )}
                </div>
              </div>

              {/* Reach Analysis Chart */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity size={18} className="text-forest" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-forest">Reach Performance (Completed)</h3>
                </div>
                <div className="h-[300px] w-full">
                  {reachData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reachData}>
                        <defs>
                          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8E9299" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8E9299" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1a3a32" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#1a3a32" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3E0" />
                        <XAxis dataKey="name" fontSize={10} tick={{ fill: '#8E9299' }} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} tick={{ fill: '#8E9299' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a3a32', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area type="monotone" dataKey="expected" stroke="#8E9299" fillOpacity={1} fill="url(#colorExpected)" strokeWidth={2} name="Expected Reach" />
                        <Area type="monotone" dataKey="actual" stroke="#1a3a32" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} name="Actual Reach" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sage text-sm italic">No completed campaigns yet</div>
                  )}
                </div>
              </div>

              {/* Status Distribution Pie Chart */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PieChartIcon size={18} className="text-forest" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-forest">Proposal Status Distribution</h3>
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a3a32', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sage text-sm italic">No proposals yet</div>
                  )}
                </div>
              </div>

              {/* Resend Config Card */}
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-forest">Email Configuration</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-beige/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-sage mb-1">Target Admin Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/test-email', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          alert("Test email sent successfully! Check your inbox (and spam).");
                        } else {
                          alert(`Failed: ${data.message || (data.error ? JSON.stringify(data.error) : 'Unknown error')}`);
                        }
                      } catch (err) {
                        alert("Error triggering test email. Check server logs.");
                      }
                    }}
                    className="w-full py-3 bg-forest text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition-all shadow-md"
                  >
                    Send Test Email Now
                  </button>

                  <p className="text-[10px] text-sage italic">
                    Note: If using Resend's free tier, you can only send emails to the address used to sign up for Resend. Ensure <strong>OWNER_EMAIL</strong> matches your Resend account email.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Proposals Section */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-forest">Recent Proposals</h3>
                <button 
                  onClick={() => setActiveTab('proposals')}
                  className="text-xs font-bold uppercase text-sage hover:text-forest transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-sage/10 text-forest text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">Influencer</th>
                      <th className="px-4 py-3">Handle</th>
                      <th className="px-4 py-3">Budget</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/10">
                    {proposals.slice(0, 5).map(p => (
                      <tr key={p.id} className="hover:bg-sage/5 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{p.influencer_name}</td>
                        <td className="px-4 py-3 text-xs text-sage">{p.platform_handle}</td>
                        <td className="px-4 py-3 text-sm font-medium">₹{p.budget}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            p.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            p.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {proposals.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sage text-sm italic">
                          No proposals received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'proposals' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-x-auto"
          >
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-sage/10 text-forest text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Influencer</th>
                  <th className="px-6 py-4">Platform / Handle</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {proposals.map(p => (
                  <tr key={p.id} className="hover:bg-sage/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.influencer_name}</td>
                    <td className="px-6 py-4 text-sm">{p.platform_handle}</td>
                    <td className="px-6 py-4 text-sm">₹{p.budget}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        p.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        p.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedProposal(p)}
                        className="text-forest hover:scale-110 transition-transform"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'campaigns' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-x-auto"
          >
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-sage/10 text-forest text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Influencer</th>
                  <th className="px-6 py-4">Platform / Handle</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Actual Reach</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {proposals.filter(p => p.status === 'approved').map((p) => (
                  <tr key={p.id} className="hover:bg-sage/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.influencer_name}</td>
                    <td className="px-6 py-4 text-sm">{p.platform_handle}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 bg-beige rounded-full h-1.5">
                          <div 
                            className="bg-forest h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: p.progress === 'completed' ? '100%' : p.progress === 'in_progress' ? '50%' : '10%' }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-forest capitalize">{p.progress.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {p.progress === 'completed' ? (
                        <span className="font-bold text-forest">{p.actual_reach?.toLocaleString() || '0'}</span>
                      ) : (
                        <span className="text-sage italic">In progress...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateProgress(p.id, 'in_progress')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${p.progress === 'in_progress' ? 'bg-forest text-white' : 'bg-sage/10 text-forest hover:bg-sage/20'}`}
                        >
                          In Progress
                        </button>
                        <button 
                          onClick={() => handleUpdateProgress(p.id, 'completed')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${p.progress === 'completed' ? 'bg-forest text-white' : 'bg-sage/10 text-forest hover:bg-sage/20'}`}
                        >
                          Completed
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {proposals.filter(p => p.status === 'approved').length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sage">
                      No active campaigns yet. Approve a proposal to start one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'meetings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-x-auto"
          >
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-sage/10 text-forest text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Influencer</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {meetings.map(m => (
                  <tr key={m.id} className="hover:bg-sage/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{m.influencer_name}</td>
                    <td className="px-6 py-4 text-sm">{m.date} at {m.time}</td>
                    <td className="px-6 py-4 text-sm capitalize">{m.mode}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        m.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-sage/10 text-center text-xs text-sage">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start">
              <p className="font-display font-bold text-forest text-lg mb-1">EVERGREENS</p>
              <p>Mumbai, India • Crafted for the Modern World</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-forest transition-colors">Instagram</a>
              <a href="#" className="hover:text-forest transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-forest transition-colors">Contact Us</a>
            </div>
            <p>© 2026 EVERGREENS. All rights reserved.</p>
          </div>
        </footer>

        {/* Proposal Detail Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-forest text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Proposal Details</h3>
                <button onClick={() => setSelectedProposal(null)}><X size={24} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Influencer</p>
                    <p className="font-medium">{selectedProposal.influencer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Email</p>
                    <p className="font-medium">{selectedProposal.influencer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Platform / Handle</p>
                    <p className="font-medium">{selectedProposal.platform_handle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Followers</p>
                    <p className="font-medium">{selectedProposal.followers_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Budget</p>
                    <p className="font-medium">₹{selectedProposal.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Reels Count</p>
                    <p className="font-medium">{selectedProposal.reels_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Expected Reach</p>
                    <p className="font-medium">{selectedProposal.expected_reach.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-sage font-bold uppercase mb-1">Collaboration Overview</p>
                  <p className="text-sm leading-relaxed">{selectedProposal.description}</p>
                </div>

                {selectedProposal.status === 'pending' && (
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => handleUpdateStatus(selectedProposal.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                    >
                      <Check size={20} /> Accept Proposal
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedProposal.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <X size={20} /> Reject Proposal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
