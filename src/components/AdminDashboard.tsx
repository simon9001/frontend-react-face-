import React, { useState } from 'react';
import { useAppStore, getRoleColor, getRoleName } from '../store';
import { Users, AlertTriangle, Clock, Shield, Camera} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { users, logs, alerts } = useAppStore();
  const [timeRange, setTimeRange] = useState('today');
  
  // Count users by role
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count alerts by type
  const alertsByType = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count unread alerts
  const unreadAlerts = alerts.filter(alert => !alert.read).length;
  
  // Count today's entries
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = logs.filter(log => 
    log.timestamp.startsWith(today) && log.action === 'entry'
  ).length;
  
  // Count unauthorized attempts
  const unauthorizedAttempts = logs.filter(log => !log.authorized).length;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Users" 
          value={users.length} 
          icon={<Users size={24} className="text-indigo-600" />}
          change="+5% from last week"
        />
        <StatCard 
          title="Today's Entries" 
          value={todayEntries} 
          icon={<Clock size={24} className="text-green-600" />}
          change="+12% from yesterday"
        />
        <StatCard 
          title="Security Alerts" 
          value={unreadAlerts} 
          icon={<AlertTriangle size={24} className="text-red-600" />}
          change="-3% from last week"
          highlight={unreadAlerts > 0}
        />
        <StatCard 
          title="Unauthorized Attempts" 
          value={unauthorizedAttempts} 
          icon={<Shield size={24} className="text-orange-600" />}
          change="+2% from last week"
          highlight={unauthorizedAttempts > 0}
        />
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">User Distribution by Role</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {Object.entries(usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center">
                  <div className="w-32 text-sm">{getRoleName(role as any)}</div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full ${getRoleColor(role as any)}`}
                        style={{ width: `${(count / users.length) * 100}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Alert Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Security Alerts by Type</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {Object.entries(alertsByType).map(([type, count]) => {
                let color = 'bg-gray-500';
                let typeName = '';
                
                switch (type) {
                  case 'intrusion':
                    color = 'bg-red-500';
                    typeName = 'Intrusion Attempts';
                    break;
                  case 'blacklist':
                    color = 'bg-red-700';
                    typeName = 'Blacklisted Entries';
                    break;
                  case 'watchlist':
                    color = 'bg-yellow-500';
                    typeName = 'Watchlisted Entries';
                    break;
                  case 'overstay':
                    color = 'bg-orange-500';
                    typeName = 'Visitor Overstays';
                    break;
                  case 'visitor_registered':
                    color = 'bg-blue-500';
                    typeName = 'New Visitors';
                    break;
                }
                
                return (
                  <div key={type} className="flex items-center">
                    <div className="w-40 text-sm">{typeName}</div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full ${color}`}
                          style={{ width: `${(count / alerts.length) * 100}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Camera Feeds */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Live Camera Feeds</h2>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All Cameras
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CameraFeed name="Main Gate" status="active" />
            <CameraFeed name="Side Entrance" status="active" />
            <CameraFeed name="Parking Lot" status="inactive" />
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Recent Activity</h2>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All Activity
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(log.userRole)}`}>
                  <span className="text-white text-xs">{log.userName.charAt(0)}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {log.userName} ({getRoleName(log.userRole)})
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.action === 'entry' ? 'Entered' : 'Exited'} through {log.location} at {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                  {!log.authorized && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      Unauthorized access attempt
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  change: string;
  highlight?: boolean;
}> = ({ title, value, icon, change, highlight = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${highlight ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{change}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
};

const CameraFeed: React.FC<{
  name: string;
  status: 'active' | 'inactive';
}> = ({ name, status }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative h-40 bg-gray-900">
        {status === 'active' ? (
          <img 
            src={`https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80&t=${name}`} 
            alt={name} 
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-sm">Camera Offline</p>
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center">
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'} mr-1`}></span>
          <span className="text-white text-xs">{status === 'active' ? 'Live' : 'Offline'}</span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            <Camera size={12} className="inline mr-1" />
            {name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;