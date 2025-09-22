import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CreateLeagueForm = ({ onCreateLeague, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    competition: '',
    isPrivate: false,
    maxMembers: 20,
    scoringRules: {
      correctWinner: 1,
      exactScore: 3,
      correctScorer: 1
    }
  });

  const [errors, setErrors] = useState({});

  const competitionOptions = [
    { value: 'champions-league', label: 'UEFA Champions League' },
    { value: 'turkish-super-league', label: 'Turkish Super League' },
    { value: 'premier-league', label: 'Premier League' },
    { value: 'la-liga', label: 'La Liga' },
    { value: 'bundesliga', label: 'Bundesliga' },
    { value: 'serie-a', label: 'Serie A' }
  ];

  const maxMemberOptions = [
    { value: 10, label: '10 members' },
    { value: 20, label: '20 members' },
    { value: 50, label: '50 members' },
    { value: 100, label: '100 members' },
    { value: 0, label: 'Unlimited' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleScoringRuleChange = (rule, value) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      scoringRules: {
        ...prev?.scoringRules,
        [rule]: numValue
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'League name is required';
    } else if (formData?.name?.length < 3) {
      newErrors.name = 'League name must be at least 3 characters';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData?.competition) {
      newErrors.competition = 'Please select a competition';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      onCreateLeague(formData);
    }
  };

  const calculateTotalPoints = () => {
    const { correctWinner, exactScore, correctScorer } = formData?.scoringRules;
    return correctWinner + exactScore + correctScorer;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Plus" size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Create New League</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
            
            <Input
              label="League Name"
              type="text"
              placeholder="Enter league name"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={3}
                placeholder="Describe your league..."
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
              />
              {errors?.description && (
                <p className="text-sm text-destructive mt-1">{errors?.description}</p>
              )}
            </div>

            <Select
              label="Competition"
              placeholder="Select competition"
              options={competitionOptions}
              value={formData?.competition}
              onChange={(value) => handleInputChange('competition', value)}
              error={errors?.competition}
              required
            />

            <Select
              label="Maximum Members"
              options={maxMemberOptions}
              value={formData?.maxMembers}
              onChange={(value) => handleInputChange('maxMembers', value)}
            />
          </div>

          {/* Settings & Scoring */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">League Settings</h3>
            
            <div className="space-y-4">
              <Checkbox
                label="Private League"
                description="Require invitation to join"
                checked={formData?.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e?.target?.checked)}
              />
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Scoring Rules</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Correct Winner</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-16 px-2 py-1 text-sm border border-border rounded bg-input text-foreground"
                    value={formData?.scoringRules?.correctWinner}
                    onChange={(e) => handleScoringRuleChange('correctWinner', e?.target?.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exact Score</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-16 px-2 py-1 text-sm border border-border rounded bg-input text-foreground"
                    value={formData?.scoringRules?.exactScore}
                    onChange={(e) => handleScoringRuleChange('exactScore', e?.target?.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Correct Scorer</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-16 px-2 py-1 text-sm border border-border rounded bg-input text-foreground"
                    value={formData?.scoringRules?.correctScorer}
                    onChange={(e) => handleScoringRuleChange('correctScorer', e?.target?.value)}
                  />
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Perfect Prediction</span>
                  <span className="font-semibold text-primary">{calculateTotalPoints()} points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            iconName="Plus"
            iconPosition="left"
          >
            Create League
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLeagueForm;