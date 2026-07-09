'use client'
import { useState, useEffect } from 'react';
import { 
  Users, Briefcase, ClipboardList, Activity, Menu, X, Settings, 
  LogOut, DollarSign, Package, Lock, User, Bell, Shield, 
  Save, Eye, EyeOff, AlertTriangle, Download, BarChart3, Star, Gift, HeadphonesIcon, FileText
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({
    commissionPercentage: 10,
    cancellationFee: 50,
    minimumBookingAmount: 100,
    maxCancellationHours: 24
  });

  // Referral program settings (backed by PlatformSettings.referral in the DB)
  const [referralSettings, setReferralSettings] = useState({
    enabled: true,
    refereeSignupBonus: 200,
    referrerBonus: 50,
    maxReferrals: 10,
    bonusSpendCapPercent: 20
  });
  const [referralLoading, setReferralLoading] = useState(true);

  useEffect(() => {
    const fetchReferralSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings?type=settings');
        const json = await res.json();
        if (json.success && json.data?.referral) {
          setReferralSettings(json.data.referral);
        }
      } catch (error) {
        console.error('Error fetching referral settings:', error);
      } finally {
        setReferralLoading(false);
      }
    };
    fetchReferralSettings();
  }, []);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters!');
      return;
    }

    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      alert('✅ Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaving(false);
    }, 1000);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      alert('✅ Settings saved successfully!');
      setSaving(false);
    }, 1000);
  };

  const handleSaveReferralSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', settings: { referral: referralSettings } })
      });
      const json = await res.json();
      if (json.success) {
        alert('✅ Referral settings saved successfully!');
        if (json.data?.referral) setReferralSettings(json.data.referral);
      } else {
        alert(`❌ ${json.message || 'Failed to save referral settings'}`);
      }
    } catch (error) {
      console.error('Error saving referral settings:', error);
      alert('❌ Failed to save referral settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      const res = await fetch('/api/admin/export?type=all&format=csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_data_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('❌ Failed to export');
    }
  };

  return (
    <>
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">Manage your admin account and platform settings.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'platform', label: 'Platform', icon: Settings },
            { id: 'referral', label: 'Referral Program', icon: Gift },
            { id: 'data', label: 'Data Export', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Admin Profile
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input
                  type="text"
                  defaultValue="Super Admin"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="admin@yann.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value="Super Admin"
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              Change Password
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
              >
                <Lock className="w-5 h-5" />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* Platform Tab */}
        {activeTab === 'platform' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Platform Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage (%)</label>
                <input
                  type="number"
                  value={platformSettings.commissionPercentage}
                  onChange={(e) => setPlatformSettings({...platformSettings, commissionPercentage: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="50"
                />
                <p className="text-xs text-gray-500 mt-1">Platform fee deducted from each booking</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Fee (₹)</label>
                <input
                  type="number"
                  value={platformSettings.cancellationFee}
                  onChange={(e) => setPlatformSettings({...platformSettings, cancellationFee: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Fee charged for late cancellations</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Booking Amount (₹)</label>
                <input
                  type="number"
                  value={platformSettings.minimumBookingAmount}
                  onChange={(e) => setPlatformSettings({...platformSettings, minimumBookingAmount: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum amount for a booking</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Cancellation Hours</label>
                <input
                  type="number"
                  value={platformSettings.maxCancellationHours}
                  onChange={(e) => setPlatformSettings({...platformSettings, maxCancellationHours: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Hours before booking for free cancellation</p>
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}

        {/* Referral Program Tab */}
        {activeTab === 'referral' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-600" />
              Referral Program
            </h3>
            {referralLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="referralEnabled"
                    checked={referralSettings.enabled}
                    onChange={(e) => setReferralSettings({ ...referralSettings, enabled: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <label htmlFor="referralEnabled" className="text-sm font-medium text-gray-700">
                    Referral program enabled
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New User Signup Bonus (₹)</label>
                    <input
                      type="number"
                      value={referralSettings.refereeSignupBonus}
                      onChange={(e) => setReferralSettings({ ...referralSettings, refereeSignupBonus: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Credited to a new homeowner who signs up with a referral code</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referrer Bonus (₹)</label>
                    <input
                      type="number"
                      value={referralSettings.referrerBonus}
                      onChange={(e) => setReferralSettings({ ...referralSettings, referrerBonus: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Credited to the existing homeowner whose code was used</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Rewarded Referrals per User</label>
                    <input
                      type="number"
                      value={referralSettings.maxReferrals}
                      onChange={(e) => setReferralSettings({ ...referralSettings, maxReferrals: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = unlimited referrals earn a bonus</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Wallet Spend Cap (%)</label>
                    <input
                      type="number"
                      value={referralSettings.bonusSpendCapPercent}
                      onChange={(e) => setReferralSettings({ ...referralSettings, bonusSpendCapPercent: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max % of bonus balance usable per wallet payment</p>
                  </div>
                </div>
                <button
                  onClick={handleSaveReferralSettings}
                  disabled={saving}
                  className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Referral Settings'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Data Export Tab */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Download className="w-6 h-6 text-blue-600" />
              Data Export
            </h3>
            <div className="space-y-4 max-w-lg">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Export All Providers</p>
                    <p className="text-sm text-gray-500">Download all service provider data</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/api/admin/export?type=providers&format=csv'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Export
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Export All Homeowners</p>
                    <p className="text-sm text-gray-500">Download all homeowner data</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/api/admin/export?type=homeowners&format=csv'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Export
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Export All Data</p>
                    <p className="text-sm text-gray-500">Download complete platform data</p>
                  </div>
                  <button
                    onClick={handleExportAllData}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Export All
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Data Privacy Notice</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Exported data contains personal information. Handle with care and ensure compliance with data protection regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
