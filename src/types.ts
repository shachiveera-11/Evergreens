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
  influencer_name: string;
  influencer_email: string;
  platform_handle: string;
  followers_count: number;
  description: string;
  reels_count: number;
  expected_reach: number;
  budget: number;
  status: 'pending' | 'approved' | 'rejected';
  progress: 'not_started' | 'in_progress' | 'completed';
  reel_link?: string;
  content_url?: string;
  actual_reach?: number;
  performance_insights?: string;
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
