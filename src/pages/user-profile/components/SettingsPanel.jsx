import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import ThemeSelector from '../../../components/ui/ThemeSelector';

const SettingsPanel = ({ settings, onSettingsUpdate }) => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [privacySettings, setPrivacySettings] = useState(settings?.privacy);

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: 'Palette' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'privacy', label: 'Privacy', icon: 'Eye' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' }
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' }
  ];

  const handlePasswordChange = async () => {
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    // Mock password change
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    }, 2000);
  };

  const handlePrivacyUpdate = (field, value) => {
    const updated = { ...privacySettings, [field]: value };
    setPrivacySettings(updated);
    onSettingsUpdate({ ...settings, privacy: updated });
  };



  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {sections?.map((section) => (
            <button
              key={section?.id}
              onClick={() => setActiveSection(section?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro ${
                activeSection === section?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={section?.icon} size={16} />
              <span>{section?.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance Section */}
      {activeSection === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Palette" size={20} className="text-primary" />
              <span>Theme & Appearance</span>
            </h3>

            <ThemeSelector showLabels={true} />
          </div>

          {/* Localization */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Globe" size={20} className="text-primary" />
              <span>Localization</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Language"
                options={languageOptions}
                value={settings?.language}
                onChange={(value) => onSettingsUpdate({ ...settings, language: value })}
              />

              <Select
                label="Timezone"
                options={timezoneOptions}
                value={settings?.timezone}
                onChange={(value) => onSettingsUpdate({ ...settings, timezone: value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          {/* Password Change */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Lock" size={20} className="text-primary" />
              <span>Change Password</span>
            </h3>
            
            <div className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={passwordData?.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e?.target?.value }))}
                required
              />
              
              <Input
                label="New Password"
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e?.target?.value }))}
                description="Must be at least 8 characters long"
                required
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e?.target?.value }))}
                required
              />
              
              <Button
                variant="default"
                loading={isChangingPassword}
                onClick={handlePasswordChange}
                disabled={!passwordData?.currentPassword || !passwordData?.newPassword || !passwordData?.confirmPassword}
                iconName="Save"
                iconPosition="left"
              >
                Update Password
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Smartphone" size={20} className="text-primary" />
              <span>Two-Factor Authentication</span>
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground mb-1">Secure your account with 2FA</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" iconName="Plus" iconPosition="left">
                Enable 2FA
              </Button>
            </div>
          </div>

          {/* Login Sessions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Monitor" size={20} className="text-primary" />
              <span>Active Sessions</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Monitor" size={20} className="text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Current Session</p>
                    <p className="text-xs text-muted-foreground">Chrome on Windows • Istanbul, Turkey</p>
                  </div>
                </div>
                <span className="text-xs text-success">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Smartphone" size={20} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Mobile App</p>
                    <p className="text-xs text-muted-foreground">iOS Safari • Last seen 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Privacy Section */}
      {activeSection === 'privacy' && (
        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Eye" size={20} className="text-primary" />
              <span>Profile Visibility</span>
            </h3>
            
            <div className="space-y-4">
              <Checkbox
                label="Public Profile"
                description="Allow others to view your profile and statistics"
                checked={privacySettings?.publicProfile}
                onChange={(e) => handlePrivacyUpdate('publicProfile', e?.target?.checked)}
              />
              
              <Checkbox
                label="Show in Leaderboards"
                description="Display your username in global and league leaderboards"
                checked={privacySettings?.showInLeaderboards}
                onChange={(e) => handlePrivacyUpdate('showInLeaderboards', e?.target?.checked)}
              />
              
              <Checkbox
                label="Allow Friend Requests"
                description="Let other users send you friend requests"
                checked={privacySettings?.allowFriendRequests}
                onChange={(e) => handlePrivacyUpdate('allowFriendRequests', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Data Sharing */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Share2" size={20} className="text-primary" />
              <span>Data Sharing</span>
            </h3>
            
            <div className="space-y-4">
              <Checkbox
                label="Analytics & Performance"
                description="Help improve the app by sharing anonymous usage data"
                checked={privacySettings?.analytics}
                onChange={(e) => handlePrivacyUpdate('analytics', e?.target?.checked)}
              />
              
              <Checkbox
                label="Marketing Communications"
                description="Receive promotional emails and updates about new features"
                checked={privacySettings?.marketing}
                onChange={(e) => handlePrivacyUpdate('marketing', e?.target?.checked)}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SettingsPanel;