import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const ProfileForm = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    preferredCompetitions: user?.preferredCompetitions,
    notifications: user?.notifications
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const competitionOptions = [
    { value: 'champions-league', label: 'UEFA Champions League' },
    { value: 'turkish-super-league', label: 'Turkish Super League' },
    { value: 'premier-league', label: 'Premier League' },
    { value: 'la-liga', label: 'La Liga' },
    { value: 'bundesliga', label: 'Bundesliga' },
    { value: 'serie-a', label: 'Serie A' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev?.notifications,
        [field]: checked
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Mock save delay
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="User" size={20} className="text-primary" />
          <span>Personal Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Username"
            type="text"
            value={formData?.username}
            onChange={(e) => handleInputChange('username', e?.target?.value)}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            required
          />
          
          <Input
            label="First Name"
            type="text"
            value={formData?.firstName}
            onChange={(e) => handleInputChange('firstName', e?.target?.value)}
          />
          
          <Input
            label="Last Name"
            type="text"
            value={formData?.lastName}
            onChange={(e) => handleInputChange('lastName', e?.target?.value)}
          />
        </div>
      </div>
      {/* Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Settings" size={20} className="text-primary" />
          <span>Preferences</span>
        </h3>
        
        <Select
          label="Preferred Competitions"
          description="Select the competitions you want to follow"
          multiple
          searchable
          options={competitionOptions}
          value={formData?.preferredCompetitions}
          onChange={(value) => handleInputChange('preferredCompetitions', value)}
          className="mb-4"
        />
      </div>
      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Bell" size={20} className="text-primary" />
          <span>Notification Settings</span>
        </h3>
        
        <div className="space-y-4">
          <Checkbox
            label="Match Reminders"
            description="Get notified before matches start"
            checked={formData?.notifications?.matchReminders}
            onChange={(e) => handleNotificationChange('matchReminders', e?.target?.checked)}
          />
          
          <Checkbox
            label="League Updates"
            description="Receive updates about your leagues"
            checked={formData?.notifications?.leagueUpdates}
            onChange={(e) => handleNotificationChange('leagueUpdates', e?.target?.checked)}
          />
          
          <Checkbox
            label="Achievement Notifications"
            description="Get notified when you earn new achievements"
            checked={formData?.notifications?.achievements}
            onChange={(e) => handleNotificationChange('achievements', e?.target?.checked)}
          />
          
          <Checkbox
            label="Weekly Summary"
            description="Receive weekly performance summaries"
            checked={formData?.notifications?.weeklySummary}
            onChange={(e) => handleNotificationChange('weeklySummary', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saveMessage && (
            <div className="flex items-center space-x-2 text-success">
              <Icon name="CheckCircle" size={16} />
              <span className="text-sm">{saveMessage}</span>
            </div>
          )}
        </div>
        
        <Button
          variant="default"
          loading={isSaving}
          onClick={handleSave}
          iconName="Save"
          iconPosition="left"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;