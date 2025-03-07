import React, { useState } from 'react';
import { useAppStore, getRoleColor, getRoleName, formatDate } from '../store';
import { Search, Download, Filter } from 'lucide-react';

const AccessLogs: React.FC = () => {
  const { logs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    role: '',
    authorized: '',
    action: ''
  });
  
  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filter.role === '' || log.userRole === filter.role;
    const matchesAuthorized = filter.authorized === '' || 
      (filter.authorized === 'true' && log.authorized) ||
      (filter.authorized === 'false' && !log.authorized);
    const matchesAction = filter.action === '' || log.action === filter.action;
    
    return matchesSearch && matchesRole && matchesAuthorized && matchesAction;
  });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const exportCSV = () => {
    // In a real application, this would generate and download a CSV file
    alert('In a real application, this would download a CSV of the filtered logs');
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Access Logs</h1>
        <button
          onClick={exportCSV}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="relative flex-1 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or location..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
            <div className="flex items-center mb-2 md:mb-0">
              <Filter size={18} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Filters:</span>
            </div>
            
            <select
              name="role"
              value={filter.role}
              onChange={handleFilterChange}
              className="border rounded-md px-3 py-2 text-sm mb-2 md:mb-0"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="worker">Worker</option>
              <option value="security">Security</option>
              <option value="visitor">Visitor</option>
              <option value="alien">Unknown</option>
            </select>
            
            <select
              name="authorized"
              value={filter.authorized}
              onChange={handleFilterChange}
              className="border rounded-md px-3 py-2 text-sm mb-2 md:mb-0"
            >
              <option value="">All Access</option>
              <option value="true">Authorized</option>
              <option value="false">Unauthorized</option>
            </select>
            
            <select
              name="action"
              value={filter.action}
              onChange={handleFilterChange}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Actions</option>
              <option value="entry">Entry</option>
              <option value="exit">Exit</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(log.userRole)} text-white`}>
                        {getRoleName(log.userRole)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.action === 'entry' ? 'Entry' : 'Exit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.authorized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {log.authorized ? 'Authorized' : 'Unauthorized'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;