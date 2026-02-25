import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, Activity, User, LogOut, CheckCircle2, Clock, XCircle, Plus, Calendar } from 'lucide-react';
import { User as UserType, Proposal } from '../types';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function InfluencerDashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'proposal' | 'status' | 'meetings'>('dashboard');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reelsCount: 1,
    demographics: '',
    expectedReach: '',
    budget: ''
  });

  useEffect(() => {
    fetchProposals();
    fetchMeetings();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch(`/api/proposals?userId=${user.id}&role=influencer`);
      const data = await res.json();
      setProposals(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`/api/meetings?userId=${user.id}&role=influencer`);
      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, influencerId: user.id }),
      });
      if (res.ok) {
        setFormData({ title: '', description: '', reelsCount: 1, demographics: '', expectedReach: '', budget: '' });
        setActiveTab('status');
        fetchProposals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-amber-500" size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-beige">
      {/* Sidebar */}
      <aside className="w-64 bg-forest text-white p-6 flex flex-col">
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold">EVERGREENS</h2>
          <p className="text-sage text-xs">Influencer Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('proposal')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'proposal' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <FileText size={20} />
            New Proposal
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'status' ? 'bg-sage/20 text-white' : 'text-sage hover:bg-sage/10'}`}
          >
            <Activity size={20} />
            Campaign Status
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
              {user.name[0]}
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
          <h1 className="text-3xl font-display font-bold text-forest">
            {activeTab === 'dashboard' && 'Welcome back!'}
            {activeTab === 'proposal' && 'Collaboration Proposal'}
            {activeTab === 'status' && 'Campaign Progress'}
            {activeTab === 'meetings' && 'Scheduled Meetings'}
          </h1>
          <div className="text-right">
            <p className="text-xs text-sage uppercase tracking-widest font-bold">Mumbai, India</p>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 col-span-2">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : proposals.length > 0 ? (
                <div className="space-y-4">
                  {proposals.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-beige/50 rounded-xl">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-sage">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(p.status)}
                        <span className="text-sm capitalize font-medium">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sage mb-4">No proposals yet. Start your first collaboration!</p>
                  <button onClick={() => setActiveTab('proposal')} className="btn-primary flex items-center gap-2 mx-auto">
                    <Plus size={18} /> Create Proposal
                  </button>
                </div>
              )}
            </div>
            
            <div className="glass-card p-6 bg-forest text-white">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sage text-xs uppercase font-bold">Active Campaigns</p>
                  <p className="text-3xl font-display font-bold">
                    {proposals.filter(p => p.status === 'approved' && p.progress !== 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-sage text-xs uppercase font-bold">Total Proposals</p>
                  <p className="text-3xl font-display font-bold">{proposals.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposal' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
            <form onSubmit={handleProposalSubmit} className="glass-card p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Project Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Summer Collection Reel"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Campaign Description</label>
                  <textarea
                    className="input-field h-32 resize-none"
                    placeholder="Describe your creative vision..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Number of Reels</label>
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      value={formData.reelsCount}
                      onChange={(e) => setFormData({ ...formData, reelsCount: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Proposed Budget (₹)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 15,000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Audience Demographics</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 18-24, Female, India"
                      value={formData.demographics}
                      onChange={(e) => setFormData({ ...formData, demographics: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Expected Reach</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 50k - 100k"
                      value={formData.expectedReach}
                      onChange={(e) => setFormData({ ...formData, expectedReach: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Submit Proposal</button>
            </form>
          </motion.div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-6">
            {meetings.length > 0 ? (
              meetings.map((m) => (
                <div key={m.id} className="glass-card p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sage/10 text-forest rounded-xl">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-forest">{m.date} at {m.time}</p>
                      <p className="text-sm text-sage capitalize">{m.mode} Meeting</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    m.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-24 glass-card">
                <p className="text-sage">No meetings scheduled. Use the AI Assistant to request one!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
