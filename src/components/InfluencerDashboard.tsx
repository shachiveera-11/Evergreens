import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, Activity, User, LogOut, CheckCircle2, Clock, XCircle, Plus, Calendar, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittingInsightId, setSubmittingInsightId] = useState<number | null>(null);
  const [insightData, setInsightData] = useState({
    reel_link: '',
    content_url: '',
    actual_reach: 0,
    performance_insights: ''
  });

  const isApproved = proposals.some(p => p.status === 'approved');

  // Form State
  const [formData, setFormData] = useState({
    influencerName: user.name || '',
    influencerEmail: user.email || '',
    platformHandle: '',
    followersCount: 0,
    description: '',
    reelsCount: 0,
    expectedReach: 0,
    budget: 0
  });

  useEffect(() => {
    fetchProposals();
    fetchMeetings();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch(`/api/proposals?userId=${user.id}&role=influencer`);
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
      const res = await fetch(`/api/meetings?userId=${user.id}&role=influencer`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
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
        setFormData({ 
          influencerName: user.name || '', 
          influencerEmail: user.email || '', 
          platformHandle: '', 
          followersCount: 0, 
          description: '', 
          reelsCount: 0, 
          expectedReach: 0, 
          budget: 0 
        });
        setActiveTab('status');
        fetchProposals();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1a3a32', '#d4d9cc', '#f9f9f7']
        });
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInsightSubmit = async (proposalId: number) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insightData),
      });
      if (res.ok) {
        setSubmittingInsightId(null);
        setInsightData({ reel_link: '', content_url: '', actual_reach: 0, performance_insights: '' });
        fetchProposals();
        alert("Campaign insights submitted successfully!");
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
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-forest" size={40} />
              </div>
              <h2 className="text-2xl font-display font-bold text-forest mb-4">Proposal Submitted!</h2>
              <p className="text-sage mb-8">
                Thank you for your interest in EVERGREENS. Our team will review your profile and get back to you within 48 hours.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="btn-primary w-full py-4 rounded-2xl text-lg"
              >
                Great, thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display font-bold text-forest">
              {activeTab === 'dashboard' && 'Welcome back!'}
              {activeTab === 'proposal' && 'Collaboration Proposal'}
              {activeTab === 'status' && 'Campaign Status'}
              {activeTab === 'meetings' && 'Scheduled Meetings'}
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

        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="glass-card p-6 col-span-2">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : proposals.length > 0 ? (
                <div className="space-y-4">
                  {proposals.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-beige/50 rounded-xl">
                      <div>
                        <p className="font-medium">{p.description.substring(0, 30)}...</p>
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
            
            <div className="glass-card p-6 bg-forest text-white relative overflow-hidden">
              {!isApproved && (
                <div className="absolute inset-0 bg-forest/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <Lock size={32} className="mb-4 text-sage" />
                  <p className="text-sm font-bold uppercase tracking-widest mb-2">Locked</p>
                  <p className="text-xs text-sage">Insights will be unlocked once your proposal is approved.</p>
                </div>
              )}
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
          </motion.div>
        )}

        {activeTab === 'proposal' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="max-w-2xl"
          >
            <form onSubmit={handleProposalSubmit} className="glass-card p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Your Name"
                      value={formData.influencerName}
                      onChange={(e) => setFormData({ ...formData, influencerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Email Address (Gmail)</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="yourname@gmail.com"
                      value={formData.influencerEmail}
                      onChange={(e) => setFormData({ ...formData, influencerEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Social Media Platform & Handle</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Instagram – @username"
                      value={formData.platformHandle}
                      onChange={(e) => setFormData({ ...formData, platformHandle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Number of Followers</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Total Followers"
                      value={formData.followersCount || ''}
                      onChange={(e) => setFormData({ ...formData, followersCount: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest mb-2">Collaboration Overview / Proposal Description</label>
                  <textarea
                    className="input-field h-40 resize-none p-4"
                    placeholder="What type of collaboration do you have in mind? How would you feature the EVERGREENS products? (e.g. Unboxing, Styling, Review)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Number of Reels / Posts</label>
                    <input
                      type="number"
                      name="reelsCount"
                      autoComplete="off"
                      className="input-field"
                      placeholder="Count"
                      value={formData.reelsCount || ''}
                      onChange={(e) => setFormData({ ...formData, reelsCount: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Expected Reach</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Est. Views"
                      value={formData.expectedReach || ''}
                      onChange={(e) => setFormData({ ...formData, expectedReach: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">Proposal Budget (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Expected Budget"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Submit Proposal</button>
            </form>
          </motion.div>
        )}

        {activeTab === 'status' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-x-auto"
          >
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-sage/10 text-forest text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Platform / Handle</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {proposals.length > 0 ? (
                  proposals.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-sage/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-forest">{p.platform_handle}</p>
                          <p className="text-xs text-sage truncate max-w-[200px]">{p.description}</p>
                        </td>
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
                          {p.status === 'approved' ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 w-24 bg-beige rounded-full h-1.5">
                                <div 
                                  className="bg-forest h-1.5 rounded-full" 
                                  style={{ width: p.progress === 'completed' ? '100%' : p.progress === 'in_progress' ? '50%' : '10%' }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-forest capitalize">{p.progress.replace('_', ' ')}</span>
                            </div>
                          ) : (
                            <span className="text-sage text-xs italic">Pending approval</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {p.status === 'approved' && p.progress !== 'completed' && (
                            <button 
                              onClick={() => setSubmittingInsightId(submittingInsightId === p.id ? null : p.id)}
                              className="text-xs font-bold text-forest underline"
                            >
                              {submittingInsightId === p.id ? 'Cancel' : 'Submit Insights'}
                            </button>
                          )}
                          {p.progress === 'completed' && (
                            <span className="text-green-600 text-xs font-bold">Completed</span>
                          )}
                        </td>
                      </tr>
                      {submittingInsightId === p.id && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-beige/30">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-4 max-w-2xl"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-sage mb-1">Reel/Post Link</label>
                                  <input 
                                    type="url" 
                                    className="input-field py-2 text-sm" 
                                    placeholder="https://instagram.com/..."
                                    value={insightData.reel_link}
                                    onChange={(e) => setInsightData({...insightData, reel_link: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-sage mb-1">Actual Reach/Views</label>
                                  <input 
                                    type="number" 
                                    className="input-field py-2 text-sm" 
                                    placeholder="Total Views"
                                    value={insightData.actual_reach || ''}
                                    onChange={(e) => setInsightData({...insightData, actual_reach: parseInt(e.target.value) || 0})}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-sage mb-1">Performance Insights</label>
                                <textarea 
                                  className="input-field py-2 text-sm h-20 resize-none" 
                                  placeholder="How did the audience react? Any key takeaways?"
                                  value={insightData.performance_insights}
                                  onChange={(e) => setInsightData({...insightData, performance_insights: e.target.value})}
                                />
                              </div>
                              <button 
                                onClick={() => handleInsightSubmit(p.id)}
                                className="btn-primary w-full py-2 text-sm"
                              >
                                Submit Campaign Data
                              </button>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sage">
                      No campaigns yet. Submit a proposal to get started!
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
            className="space-y-6 relative"
          >
            {!isApproved && (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mb-6">
                  <Lock size={32} className="text-forest" />
                </div>
                <h3 className="text-xl font-bold text-forest mb-2">Meeting Access Restricted</h3>
                <p className="text-sage max-w-sm">
                  You can schedule and view meetings once your collaboration proposal has been approved by our team.
                </p>
              </div>
            )}
            
            {isApproved && (
              <>
                {meetings.length > 0 ? (
                  meetings.map((m, index) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-6 flex items-center justify-between"
                    >
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
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-24 glass-card">
                    <p className="text-sage">No meetings scheduled. Use the AI Assistant to request one!</p>
                  </div>
                )}
              </>
            )}
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
      </main>
    </div>
  );
}
