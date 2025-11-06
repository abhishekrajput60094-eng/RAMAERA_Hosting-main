import { useState, useEffect } from 'react';
import { Server, Search, Play, Pause, RotateCw, Trash2, Plus } from 'lucide-react';

type ServerStatus = 'active' | 'provisioning' | 'suspended' | 'terminated';
type ServerType = 'VPS' | 'Dedicated' | 'Shared';

interface ServerData {
  id: string;
  user_id: string;
  server_name: string;
  ip_address: string | null;
  server_status: ServerStatus;
  server_type: ServerType;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    region: string;
    os: string;
  };
  created_at: string; // ISO
  user_email?: string;
}

// ---- Mock helpers ----
const randomId = () => 'srv_' + Math.random().toString(36).slice(2, 10);
const randomIP = () =>
  `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}`;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const makeMockServer = (overrides: Partial<ServerData> = {}): ServerData => {
  const names = ['Apollo', 'Hermes', 'Zephyr', 'Orion', 'Nimbus', 'Atlas', 'Vulcan', 'Nova'];
  const types: ServerType[] = ['VPS', 'Dedicated', 'Shared'];
  const statuses: ServerStatus[] = ['active', 'provisioning', 'suspended'];

  const base: ServerData = {
    id: randomId(),
    user_id: 'u_' + Math.random().toString(36).slice(2, 10),
    server_name: `Server-${pick(names)}-${Math.floor(Math.random() * 900 + 100)}`,
    ip_address: Math.random() > 0.2 ? randomIP() : null, // 20% “Pending”
    server_status: pick(statuses),
    server_type: pick(types),
    specs: {
      cpu: pick(['2 vCPU', '4 vCPU', '8 vCPU']),
      ram: pick(['4 GB', '8 GB', '16 GB']),
      storage: pick(['80 GB SSD', '160 GB SSD', '320 GB NVMe']),
      region: pick(['Mumbai', 'Delhi', 'Bangalore', 'Singapore']),
      os: pick(['Ubuntu 22.04', 'Debian 12', 'CentOS 9 Stream']),
    },
    created_at: new Date(
      Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000
    ).toISOString(),
    user_email: pick([
      'admin@example.com',
      'ops@example.com',
      'user1234@example.com',
      'abhishek@example.com',
    ]),
  };

  return { ...base, ...overrides };
};

// Seed
const SEED_SERVERS: ServerData[] = [
  makeMockServer({ server_name: 'Server-Orion-101', server_status: 'active', server_type: 'VPS' }),
  makeMockServer({
    server_name: 'Server-Atlas-202',
    server_status: 'provisioning',
    server_type: 'Dedicated',
    ip_address: null,
  }),
  makeMockServer({
    server_name: 'Server-Nimbus-303',
    server_status: 'suspended',
    server_type: 'Shared',
  }),
  makeMockServer({ server_name: 'Server-Vulcan-404', server_status: 'active', server_type: 'VPS' }),
  makeMockServer({ server_name: 'Server-Apollo-505', server_status: 'active', server_type: 'VPS' }),
];

export function ServerManagement() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate async load
    const t = setTimeout(() => {
      setServers(
        SEED_SERVERS.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      );
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Local state updates for actions
  const handleServerAction = (serverId: string, action: 'start' | 'stop' | 'restart' | 'terminate') => {
    setServers((prev) =>
      prev.map((s) => {
        if (s.id !== serverId) return s;
        if (action === 'start') return { ...s, server_status: 'active', ip_address: s.ip_address || randomIP() };
        if (action === 'stop') return { ...s, server_status: 'suspended' };
        if (action === 'restart') {
          // brief “provisioning” impression then back to active
          return { ...s, server_status: 'active', ip_address: s.ip_address || randomIP() };
        }
        if (action === 'terminate') return { ...s, server_status: 'terminated' };
        return s;
      })
    );
  };

  const handleDeleteServer = (serverId: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return;
    setServers((prev) => prev.filter((s) => s.id !== serverId));
  };

  const handleProvision = () => {
    // Create a provisioning server and put it at the top
    const newSrv = makeMockServer({
      server_status: 'provisioning',
      ip_address: null,
      server_name: `Server-${pick(['Nova', 'Helios', 'Lyra', 'Quantum'])}-${Math.floor(
        Math.random() * 900 + 100
      )}`,
      created_at: new Date().toISOString(),
    });
    setServers((prev) => [newSrv, ...prev]);
    // Auto-complete provisioning after a moment
    setTimeout(() => {
      setServers((prev) =>
        prev.map((s) =>
          s.id === newSrv.id
            ? { ...s, server_status: 'active', ip_address: randomIP() }
            : s
        )
      );
    }, 1500);
  };

  const filteredServers = servers.filter((server) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      server.server_name.toLowerCase().includes(q) ||
      (server.ip_address || '').toLowerCase().includes(q) ||
      (server.user_email || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || server.server_status === (statusFilter as ServerStatus);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'provisioning':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'suspended':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'terminated':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="h-7 w-7 text-cyan-400" />
            Server Management
          </h2>
          <p className="text-slate-400">Manage all hosted servers</p>
        </div>
        <button
          onClick={handleProvision}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-400 hover:to-teal-400 transition font-semibold flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Provision Server
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border-2 border-cyan-500 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="provisioning">Provisioning</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="text-slate-400 mt-4">Loading servers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Server Name</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">IP Address</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Owner</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Created</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/20">
                {filteredServers.map((server) => (
                  <tr key={server.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{server.server_name}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{server.ip_address ?? 'Pending'}</td>
                    <td className="py-4 px-4 text-slate-300">{server.user_email ?? 'N/A'}</td>
                    <td className="py-4 px-4 text-slate-300">{server.server_type}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                          server.server_status
                        )}`}
                      >
                        {server.server_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {new Date(server.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {server.server_status === 'suspended' && (
                          <button
                            onClick={() => handleServerAction(server.id, 'start')}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition"
                            title="Start Server"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {server.server_status === 'active' && (
                          <>
                            <button
                              onClick={() => handleServerAction(server.id, 'restart')}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                              title="Restart Server"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleServerAction(server.id, 'stop')}
                              className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition"
                              title="Stop Server"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleServerAction(server.id, 'terminate')}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          title="Terminate Server"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteServer(server.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServers.length === 0 && (
              <div className="text-center py-12">
                <Server className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No servers found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
