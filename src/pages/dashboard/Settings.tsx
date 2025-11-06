import { useState } from 'react';
import { User, Lock, Bell, Shield, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Settings() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || '',
    email: '',
    phone: '',
    company: '',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    serverAlerts: true,
    billingAlerts: true,
    maintenanceAlerts: true,
    marketingEmails: false,
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account settings and preferences</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden">
        <div className="border-b border-cyan-500/30">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === 'profile'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === 'security'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === 'notifications'
                  ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-950'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b border-cyan-500/30">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{profile?.full_name}</h3>
                  <p className="text-sm text-slate-400 capitalize">{profile?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-1">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-400 mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-semibold hover:bg-cyan-500/30 transition">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSecuritySubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Email Notifications</p>
                        <p className="text-xs text-slate-400">Receive notifications via email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })
                      }
                      className="w-5 h-5 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Server Alerts</p>
                        <p className="text-xs text-slate-400">Get notified about server status changes</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.serverAlerts}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, serverAlerts: e.target.checked })
                      }
                      className="w-5 h-5 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Billing Alerts</p>
                        <p className="text-xs text-slate-400">Get notified about billing and payments</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.billingAlerts}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, billingAlerts: e.target.checked })
                      }
                      className="w-5 h-5 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Maintenance Alerts</p>
                        <p className="text-xs text-slate-400">Get notified about scheduled maintenance</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.maintenanceAlerts}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, maintenanceAlerts: e.target.checked })
                      }
                      className="w-5 h-5 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-cyan-500/30 cursor-pointer hover:border-cyan-500/50 transition">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Marketing Emails</p>
                        <p className="text-xs text-slate-400">Receive updates about new features and offers</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, marketingEmails: e.target.checked })
                      }
                      className="w-5 h-5 text-cyan-500 border-cyan-500/30 rounded focus:ring-cyan-500 bg-slate-800"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
