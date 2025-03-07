import { create } from 'zustand';
import { User, AccessLog, Alert, UserRole } from './types';
import { format } from 'date-fns';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'student',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'lecturer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '3',
    name: 'Michael Chen',
    role: 'worker',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '4',
    name: 'David Williams',
    role: 'security',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '5',
    name: 'Unknown Person',
    role: 'alien',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '6',
    name: 'Emily Davis',
    role: 'visitor',
    registeredBy: 'David Williams',
    registeredAt: '2023-06-15T10:30:00',
    validUntil: '2023-06-15T17:30:00',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  },
  {
    id: '7',
    name: 'James Wilson',
    role: 'student',
    blacklisted: true,
    notes: 'Suspended for misconduct',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
  }
];

const mockLogs: AccessLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Smith',
    userRole: 'student',
    timestamp: '2023-06-15T08:30:00',
    action: 'entry',
    location: 'Main Gate',
    authorized: true
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Johnson',
    userRole: 'lecturer',
    timestamp: '2023-06-15T09:15:00',
    action: 'entry',
    location: 'Main Gate',
    authorized: true
  },
  {
    id: '3',
    userId: '5',
    userName: 'Unknown Person',
    userRole: 'alien',
    timestamp: '2023-06-15T10:05:00',
    action: 'entry',
    location: 'Side Gate',
    authorized: false
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'intrusion',
    userId: '5',
    userName: 'Unknown Person',
    userRole: 'alien',
    timestamp: '2023-06-15T10:05:00',
    message: 'Unauthorized person detected at Side Gate',
    read: false
  },
  {
    id: '2',
    type: 'visitor_registered',
    userId: '6',
    userName: 'Emily Davis',
    userRole: 'visitor',
    timestamp: '2023-06-15T10:30:00',
    message: 'New visitor registered by David Williams',
    read: true
  },
  {
    id: '3',
    type: 'blacklist',
    userId: '7',
    userName: 'James Wilson',
    userRole: 'student',
    timestamp: '2023-06-15T11:45:00',
    message: 'Blacklisted individual attempted entry at Main Gate',
    read: false
  }
];

interface AppState {
  users: User[];
  logs: AccessLog[];
  alerts: Alert[];
  currentUser: 'admin' | 'gatekeeper';
  detectedFaces: User[];
  
  // Actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  removeUser: (id: string) => void;
  registerVisitor: (visitorData: Omit<User, 'id' | 'role'>) => void;
  addAccessLog: (log: Omit<AccessLog, 'id'>) => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  markAlertAsRead: (id: string) => void;
  setCurrentUser: (user: 'admin' | 'gatekeeper') => void;
  simulateDetection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  users: mockUsers,
  logs: mockLogs,
  alerts: mockAlerts,
  currentUser: 'gatekeeper',
  detectedFaces: [],
  
  addUser: (userData) => set((state) => {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData
    };
    
    // Create an alert for admin if a visitor is registered
    let newAlerts = [...state.alerts];
    if (userData.role === 'visitor') {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'visitor_registered',
        userId: newUser.id,
        userName: newUser.name,
        userRole: newUser.role,
        timestamp: new Date().toISOString(),
        message: `New visitor ${newUser.name} registered by ${userData.registeredBy}`,
        read: false
      });
    }
    
    return { 
      users: [...state.users, newUser],
      alerts: newAlerts
    };
  }),
  
  updateUser: (id, userData) => set((state) => ({
    users: state.users.map(user => 
      user.id === id ? { ...user, ...userData } : user
    )
  })),
  
  removeUser: (id) => set((state) => ({
    users: state.users.filter(user => user.id !== id)
  })),
  
  registerVisitor: (visitorData) => set((state) => {
    const newVisitor: User = {
      id: Date.now().toString(),
      role: 'visitor',
      registeredAt: new Date().toISOString(),
      ...visitorData
    };
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: 'visitor_registered',
      userId: newVisitor.id,
      userName: newVisitor.name,
      userRole: 'visitor',
      timestamp: new Date().toISOString(),
      message: `New visitor ${newVisitor.name} registered by ${visitorData.registeredBy}`,
      read: false
    };
    
    return {
      users: [...state.users, newVisitor],
      alerts: [...state.alerts, newAlert]
    };
  }),
  
  addAccessLog: (logData) => set((state) => ({
    logs: [...state.logs, {
      id: Date.now().toString(),
      ...logData
    }]
  })),
  
  addAlert: (alertData) => set((state) => ({
    alerts: [...state.alerts, {
      id: Date.now().toString(),
      ...alertData
    }]
  })),
  
  markAlertAsRead: (id) => set((state) => ({
    alerts: state.alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    )
  })),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  simulateDetection: () => set((state) => {
    // Randomly select 1-3 users to simulate detection
    const shuffled = [...state.users].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
    
    // Add access logs for detected users
    const newLogs = [...state.logs];
    const newAlerts = [...state.alerts];
    
    selected.forEach(user => {
      // Add access log
      const log: AccessLog = {
        id: Date.now().toString() + user.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        timestamp: new Date().toISOString(),
        action: 'entry',
        location: 'Main Gate',
        authorized: user.role !== 'alien' && !user.blacklisted
      };
      newLogs.push(log);
      
      // Generate alerts if needed
      if (user.role === 'alien') {
        newAlerts.push({
          id: Date.now().toString() + user.id,
          type: 'intrusion',
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          timestamp: new Date().toISOString(),
          message: `Unauthorized person detected at Main Gate`,
          read: false
        });
      } else if (user.blacklisted) {
        newAlerts.push({
          id: Date.now().toString() + user.id,
          type: 'blacklist',
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          timestamp: new Date().toISOString(),
          message: `Blacklisted individual ${user.name} attempted entry at Main Gate`,
          read: false
        });
      } else if (user.watchlisted) {
        newAlerts.push({
          id: Date.now().toString() + user.id,
          type: 'watchlist',
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          timestamp: new Date().toISOString(),
          message: `Watchlisted individual ${user.name} entered at Main Gate`,
          read: false
        });
      }
    });
    
    return {
      detectedFaces: selected,
      logs: newLogs,
      alerts: newAlerts
    };
  })
}));

// Helper function to get role color
export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'student': return 'bg-green-500';
    case 'lecturer': return 'bg-blue-500';
    case 'worker': return 'bg-yellow-500';
    case 'security': return 'bg-black text-white';
    case 'alien': return 'bg-red-500';
    case 'visitor': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case 'student': return 'Student';
    case 'lecturer': return 'Lecturer';
    case 'worker': return 'Worker';
    case 'security': return 'Security';
    case 'alien': return 'Unknown';
    case 'visitor': return 'Visitor';
    default: return 'Unknown';
  }
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
};