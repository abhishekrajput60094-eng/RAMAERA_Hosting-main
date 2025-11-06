import { useState } from 'react';
import { MessageSquare, Plus, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function Support() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'new'>('tickets');
  const [searchQuery, setSearchQuery] = useState('');

  const tickets = [
    {
      id: 'TICK-001',
      subject: 'Server connectivity issue',
      status: 'open',
      priority: 'high',
      created: '2024-10-14',
      lastUpdated: '2024-10-14',
      messages: 3,
    },
    {
      id: 'TICK-002',
      subject: 'Billing inquiry',
      status: 'answered',
      priority: 'medium',
      created: '2024-10-12',
      lastUpdated: '2024-10-13',
      messages: 5,
    },
    {
      id: 'TICK-003',
      subject: 'Upgrade request',
      status: 'closed',
      priority: 'low',
      created: '2024-10-10',
      lastUpdated: '2024-10-11',
      messages: 2,
    },
  ];

  const [formData, setFormData] = useState({
    subject: '',
    priority: 'medium',
    department: 'technical',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ticket submitted:', formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'answered':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'closed':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'answered':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-slate-400">Get help from our support team</p>
        </div>
        <button
          onClick={() => setActiveTab('new')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50"
        >
          <Plus className="h-5 w-5" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden">
        <div className="border-b border-cyan-500/30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'tickets'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'new'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              New Ticket
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                />
              </div>

              {filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">
                    {searchQuery ? 'No tickets found' : 'No support tickets yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 bg-slate-950 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-mono text-slate-400">{ticket.id}</span>
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {getStatusIcon(ticket.status)}
                              <span className="capitalize">{ticket.status}</span>
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              <span className="capitalize">{ticket.priority}</span>
                            </span>
                          </div>
                          <h3 className="text-white font-semibold mb-1">{ticket.subject}</h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center space-x-4">
                          <span>Created: {new Date(ticket.created).toLocaleDateString()}</span>
                          <span>Updated: {new Date(ticket.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{ticket.messages}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                  >
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing</option>
                    <option value="sales">Sales</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400 resize-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="px-6 py-3 text-slate-400 hover:text-slate-300 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
