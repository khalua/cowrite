export interface User {
  id: number;
  email: string;
  name: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface UserSummary {
  id: number;
  email: string;
  name: string;
}

export interface Circle {
  id: number;
  name: string;
  description?: string;
  created_by_id: number;
  created_at: string;
  members: CircleMember[];
  stories_count: number;
}

export interface CircleMember {
  id: number;
  user_id: number;
  circle_id: number;
  role: 'admin' | 'member';
  user: User;
  joined_at: string;
}

export interface Story {
  id: number;
  title: string;
  prompt?: string;
  circle_id: number;
  started_by_id: number;
  status: 'active' | 'completed';
  created_at: string;
  contributions: Contribution[];
  contributions_count: number;
  word_count: number;
  circle_members?: UserSummary[]; // Only included for super admins
}

export interface Contribution {
  id: number;
  story_id: number;
  user_id: number;
  content: string;
  word_count: number;
  position: number;
  created_at: string;
  written_at?: string; // Custom timestamp (if backdated)
  user: User;
  impersonated?: boolean; // Only visible to super admins
  written_by?: UserSummary; // The actual writer (if impersonated)
}

export interface Invitation {
  id: number;
  circle_id: number;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_by_id: number;
  created_at: string;
}

// Admin types
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_super_admin: boolean;
  created_at: string;
  circles_count: number;
  contributions_count: number;
}

export interface AdminUserDetail extends AdminUser {
  circles: Array<{ id: number; name: string; role: 'admin' | 'member' }>;
  contributions: Array<{
    id: number;
    story_id: number;
    story_title: string;
    word_count: number;
    created_at: string;
  }>;
}

export interface AdminCircle {
  id: number;
  name: string;
  description?: string;
  created_by_id: number;
  created_at: string;
  stories_count: number;
  members_count: number;
  creator: UserSummary;
  members: Array<{
    id: number;
    user_id: number;
    role: 'admin' | 'member';
    joined_at: string;
    user: UserSummary;
  }>;
  stories: Array<{
    id: number;
    title: string;
    status: 'active' | 'completed';
    contributions_count: number;
    created_at: string;
  }>;
}

export interface AdminStory {
  id: number;
  title: string;
  prompt?: string;
  status: 'active' | 'completed';
  created_at: string;
  contributions_count: number;
  word_count: number;
  circle: {
    id: number;
    name: string;
  };
  starter: UserSummary;
}

export interface AdminStoryDetail extends AdminStory {
  circle: {
    id: number;
    name: string;
    members: UserSummary[];
  };
  contributions: Array<{
    id: number;
    content: string;
    word_count: number;
    position: number;
    created_at: string;
    user: UserSummary;
    impersonation?: {
      written_by: UserSummary;
      written_at: string;
    };
  }>;
}
