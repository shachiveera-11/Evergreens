import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, Users, LogOut, Check, X, Eye, TrendingUp, Package, Clock, Calendar } from 'lucide-react';
import { User as UserType, Proposal, Meeting } from '../types';

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
      const data = await res.json();
      setProposals(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`/api/meetings?role=admin`);
      const data = await res.json();
      setMeetings(data);
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
              <p className="text-sm font-medium truncate">Evergreens Admin</p>
              <p className="text-xs text-sage truncate">admin@evergreens.com</p>
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
          <h1 className="text-3xl font-display font-bold text-forest">
            {activeTab === 'overview' && 'Brand Overview'}
            {activeTab === 'proposals' && 'Influencer Proposals'}
            {activeTab === 'campaigns' && 'Campaign Management'}
            {activeTab === 'meetings' && 'Meeting Requests'}
          </h1>
          <div className="text-right">
            <p className="text-xs text-sage uppercase tracking-widest font-bold">Mumbai, India</p>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Recent Proposals</h3>
                <div className="space-y-4">
                  {proposals.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-beige/50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">{p.influencer_name}</p>
                        <p className="text-xs text-sage">{p.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        p.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        p.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 bg-forest text-white">
                <h3 className="text-lg font-bold mb-4">Campaign Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Not Started</span>
                      <span>{proposals.filter(p => p.progress === 'not_started' && p.status === 'approved').length}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full">
                      <div className="bg-sage h-1.5 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>In Progress</span>
                      <span>{proposals.filter(p => p.progress === 'in_progress').length}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completed</span>
                      <span>{proposals.filter(p => p.progress === 'completed').length}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full">
                      <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-sage/10 text-forest text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Influencer</th>
                  <th className="px-6 py-4">Campaign Title</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {proposals.map(p => (
                  <tr key={p.id} className="hover:bg-sage/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.influencer_name}</td>
                    <td className="px-6 py-4 text-sm">{p.title}</td>
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
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.filter(p => p.status === 'approved').map(p => (
              <div key={p.id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-forest">{p.title}</h3>
                    <p className="text-xs text-sage">Influencer: {p.influencer_name}</p>
                  </div>
                  <Package size={20} className="text-sage" />
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold uppercase">Progress</span>
                    <span className="capitalize">{p.progress.replace('_', ' ')}</span>
                  </div>
                  <div className="w-full bg-beige rounded-full h-2">
                    <div 
                      className="bg-forest h-2 rounded-full transition-all duration-500" 
                      style={{ width: p.progress === 'completed' ? '100%' : p.progress === 'in_progress' ? '50%' : '10%' }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateProgress(p.id, 'in_progress')}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${p.progress === 'in_progress' ? 'bg-forest text-white' : 'bg-sage/10 text-forest hover:bg-sage/20'}`}
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => handleUpdateProgress(p.id, 'completed')}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${p.progress === 'completed' ? 'bg-forest text-white' : 'bg-sage/10 text-forest hover:bg-sage/20'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
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
          </div>
        )}

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
                    <p className="text-xs text-sage font-bold uppercase mb-1">Budget</p>
                    <p className="font-medium">₹{selectedProposal.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Reels Count</p>
                    <p className="font-medium">{selectedProposal.reels_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage font-bold uppercase mb-1">Expected Reach</p>
                    <p className="font-medium">{selectedProposal.expected_reach}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-sage font-bold uppercase mb-1">Campaign Description</p>
                  <p className="text-sm leading-relaxed">{selectedProposal.description}</p>
                </div>
                <div>
                  <p className="text-xs text-sage font-bold uppercase mb-1">Audience Demographics</p>
                  <p className="text-sm">{selectedProposal.demographics}</p>
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
