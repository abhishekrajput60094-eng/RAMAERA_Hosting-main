import { Server, Power, PowerOff, RefreshCw, Settings, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyServers() {
  const servers = [
    {
      id: 1,
      name: 'Production Web Server',
      hostname: 'web-prod-01.ramaera.cloud',
      status: 'active',
      ip: '192.168.1.100',
      plan: 'Professional',
      vcpu: 4,
      ram: 8,
      storage: 160,
      os: 'Ubuntu 22.04 LTS',
      created: '2024-01-15',
      expires: '2025-01-15',
    },
    {
      id: 2,
      name: 'Database Server',
      hostname: 'db-prod-01.ramaera.cloud',
      status: 'active',
      ip: '192.168.1.101',
      plan: 'Memory Plus',
      vcpu: 8,
      ram: 64,
      storage: 320,
      os: 'Ubuntu 22.04 LTS',
      created: '2024-02-01',
      expires: '2025-02-01',
    },
    {
      id: 3,
      name: 'Development Server',
      hostname: 'dev-01.ramaera.cloud',
      status: 'stopped',
      ip: '192.168.1.102',
      plan: 'Starter',
      vcpu: 2,
      ram: 4,
      storage: 80,
      os: 'Ubuntu 22.04 LTS',
      created: '2024-03-10',
      expires: '2025-03-10',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      stopped: 'bg-slate-800 text-slate-300',
      provisioning: 'bg-blue-100 text-blue-700',
      error: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors.stopped;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Servers</h2>
          <p className="text-slate-400">Manage and monitor all your servers</p>
        </div>
        <Link
          to="/pricing"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold border-2 border-cyan-500"
        >
          Deploy New Server
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {servers.map((server) => (
          <div key={server.id} className="bg-slate-900 rounded-xl shadow-sm border-2 border-cyan-500 overflow-hidden hover:shadow-lg hover:shadow-cyan-500/30 transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Server className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{server.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">{server.hostname}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(server.status)}`}>
                      {server.status}
                    </span>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-cyan-400">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 bg-slate-950 p-4 rounded-lg border-2 border-cyan-500/50">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Plan</p>
                  <p className="font-semibold text-white">{server.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">IP Address</p>
                  <p className="font-semibold text-white">{server.ip}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Resources</p>
                  <p className="font-semibold text-white">{server.vcpu} vCPU, {server.ram}GB RAM</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Storage</p>
                  <p className="font-semibold text-white">{server.storage}GB NVMe</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Operating System</p>
                  <p className="font-semibold text-white">{server.os}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-cyan-500">
                <div className="text-sm text-slate-400">
                  Created: {new Date(server.created).toLocaleDateString()} •
                  Expires: {new Date(server.expires).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  {server.status === 'active' ? (
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold flex items-center space-x-2">
                      <PowerOff className="h-4 w-4" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-semibold flex items-center space-x-2">
                      <Power className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  )}
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition font-semibold flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Reboot</span>
                  </button>
                  <Link
                    to={`/dashboard/servers/${server.id}`}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center space-x-2 border-2 border-cyan-500"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
