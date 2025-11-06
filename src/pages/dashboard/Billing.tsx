import { useState } from 'react';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export function Billing() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payment-methods'>('invoices');

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-10-01',
      amount: 1299.00,
      status: 'paid',
      description: 'G.4GB - Monthly Subscription',
    },
    {
      id: 'INV-2024-002',
      date: '2024-09-01',
      amount: 1299.00,
      status: 'paid',
      description: 'G.4GB - Monthly Subscription',
    },
    {
      id: 'INV-2024-003',
      date: '2024-08-01',
      amount: 1299.00,
      status: 'paid',
      description: 'G.4GB - Monthly Subscription',
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-slate-400">Manage your invoices and payment methods</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Balance</h3>
            <p className="text-sm text-slate-400">Your account balance</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-cyan-400">₹0.00</p>
            <p className="text-sm text-slate-400">No outstanding balance</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden">
        <div className="border-b border-cyan-500/30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'invoices'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'payment-methods'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              Payment Methods
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No invoices yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cyan-500/30">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Invoice ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Description</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Amount</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-cyan-500/10 hover:bg-slate-950 transition">
                          <td className="py-4 px-4 text-sm font-medium text-white">{invoice.id}</td>
                          <td className="py-4 px-4 text-sm text-slate-400">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400">{invoice.description}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-white text-right">
                            ₹{invoice.amount.toFixed(2)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center">
                              <span
                                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  invoice.status
                                )}`}
                              >
                                {getStatusIcon(invoice.status)}
                                <span className="capitalize">{invoice.status}</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center">
                              <button className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition">
                                <Download className="h-3.5 w-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment-methods' && (
            <div className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No payment methods added</p>
                  <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50">
                    Add Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-cyan-500/30"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-sm text-slate-400">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                          {method.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <button className="px-4 py-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition">
                            Set Default
                          </button>
                        )}
                        <button className="px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full px-6 py-3 bg-slate-950 border border-cyan-500/30 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-500/10 transition">
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
