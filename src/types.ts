export type UserRole = 'admin' | 'influencer';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface Proposal {
  id: number;
  influencer_id: number;
  influencer_name?: string;
  title: string;
  description: string;
  reels_count: number;
  demographics: string;
  expected_reach: string;
  budget: string;
  status: 'pending' | 'approved' | 'rejected';
  progress: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
}

export interface Meeting {
  id: number;
  influencer_id: number;
  influencer_name?: string;
  date: string;
  time: string;
  mode: string;
  status: 'pending' | 'confirmed';
  created_at: string;
}
