export type UserRole = 'student' | 'lecturer' | 'worker' | 'security' | 'alien' | 'visitor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  image: string;
  registeredBy?: string;
  registeredAt?: string;
  validUntil?: string;
  blacklisted?: boolean;
  watchlisted?: boolean;
  notes?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  action: 'entry' | 'exit';
  location: string;
  authorized: boolean;
}

export interface Alert {
  id: string;
  type: 'intrusion' | 'overstay' | 'blacklist' | 'watchlist' | 'visitor_registered';
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  timestamp: string;
  message: string;
  read: boolean;
}