/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserRegistration {
  id: string;
  fullName: string;
  classVal: string;
  studentId: string;
  phone: string;
  email: string;
  whyJoin: string;
  status: 'Submitted' | 'Under Review' | 'Approved';
  createdAt: string;
}

export interface WhyJoinCard {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface ActivityCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface MemberFeedback {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export interface LeadershipInfo {
  teacher: {
    name: string;
    role: string;
    contact: string;
  };
  unitLeader: string;
  teamLeaders: string;
  executiveTeam: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  whatsapp: string;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
  };
  about: string;
  whyJoin: WhyJoinCard[];
  activities: ActivityCard[];
  feedbacks: MemberFeedback[];
  leadership: LeadershipInfo;
  socials: SocialLinks;
  googleSheetsUrl?: string;
  gmailEnabled?: boolean;
  gmailSubject?: string;
  gmailBody?: string;
}
