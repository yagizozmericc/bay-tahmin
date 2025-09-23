import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { updateUserProfile } from '../../../services/userProfileService';

const ProfileForm = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    favoriteTeam: user?.favoriteTeam || '',
    preferredCompetitions: user?.preferredCompetitions || [],
    notifications: user?.notifications || {
      matchReminders: true,
      leagueUpdates: true,
      achievements: true,
      weeklySummary: false
    }
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

  const teamOptions = [
    { value: 'galatasaray', label: 'Galatasaray' },
    { value: 'fenerbahce', label: 'Fenerbahçe' },
    { value: 'besiktas', label: 'Beşiktaş' },
    { value: 'trabzonspor', label: 'Trabzonspor' },
    { value: 'real-madrid', label: 'Real Madrid' },
    { value: 'barcelona', label: 'Barcelona' },
    { value: 'manchester-united', label: 'Manchester United' },
    { value: 'manchester-city', label: 'Manchester City' },
    { value: 'liverpool', label: 'Liverpool' },
    { value: 'arsenal', label: 'Arsenal' },
    { value: 'chelsea', label: 'Chelsea' },
    { value: 'bayern-munich', label: 'Bayern Munich' },
    { value: 'juventus', label: 'Juventus' },
    { value: 'ac-milan', label: 'AC Milan' },
    { value: 'inter-milan', label: 'Inter Milan' },
    { value: 'psg', label: 'Paris Saint-Germain' }
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

    try {
      // Save to Firebase
      if (user?.uid) {
        await updateUserProfile(user.uid, formData);
      }

      // Update parent component state
      onSave(formData);

      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Failed to save profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
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

        <div className="mt-4">
          <Input
            label="Bio"
            type="textarea"
            value={formData?.bio}
            onChange={(e) => handleInputChange('bio', e?.target?.value)}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Location"
            type="text"
            value={formData?.location}
            onChange={(e) => handleInputChange('location', e?.target?.value)}
            placeholder="e.g. Istanbul, Turkey"
          />

          <Select
            label="Favorite Team"
            options={teamOptions}
            value={formData?.favoriteTeam}
            onChange={(value) => handleInputChange('favoriteTeam', value)}
            placeholder="Select your favorite team"
            searchable
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