import React from 'react';
import { useAppStore, formatDate } from '../store';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';

const Alerts: React.FC = () => {
  const { alerts, markAlertAsRead } = useAppStore();
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'intrusion':
      case 'blacklist':
      case 'watchlist':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'overstay':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'visitor_registered':
        return <Bell size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };
  
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'intrusion':
      case 'blacklist':
        return 'border-red-500 bg-red-50';
      case 'watchlist':
      case 'overstay':
        return 'border-yellow-500 bg-yellow-50';
      case 'visitor_registered':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300';
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Security Alerts</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Recent Alerts</h2>
        </div>
        
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No alerts found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 ${!alert.read ? 'bg-indigo-50' : ''} hover:bg-gray-50`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.userName ? alert.userName : 'System'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(alert.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.message}
                    </p>
                    
                    <div className={`mt-2 p-2 rounded-md border-l-4 ${getAlertColor(alert.type)}`}>
                      <p className="text-sm">
                        {alert.type === 'intrusion' && 'Unauthorized access detected. Security response required.'}
                        {alert.type === 'blacklist' && 'Blacklisted individual attempted entry. Security response required.'}
                        {alert.type === 'watchlist' && 'Watchlisted individual detected. Monitor activity.'}
                        {alert.type === 'overstay' && 'Visitor has exceeded their authorized time limit.'}
                        {alert.type === 'visitor_registered' && 'New visitor has been registered in the system.'}
                      </p>
                    </div>
                    
                    {!alert.read && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;