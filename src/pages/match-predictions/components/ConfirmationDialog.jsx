import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, type, data }) => {
  if (!isOpen) return null;

  const getDialogContent = () => {
    switch (type) {
      case 'save-all':
        return {
          title: 'Save All Predictions',
          message: `Are you sure you want to save all ${data?.count || 0} predictions? This action cannot be undone after match deadlines pass.`,
          icon: 'Save',
          confirmText: 'Save All',
          confirmVariant: 'default'
        };
      case 'clear-all':
        return {
          title: 'Clear All Predictions',
          message: 'Are you sure you want to clear all your predictions? This action cannot be undone.',
          icon: 'Trash2',
          confirmText: 'Clear All',
          confirmVariant: 'destructive'
        };
      case 'deadline-warning':
        return {
          title: 'Prediction Deadline Warning',
          message: `Some matches have prediction deadlines in less than 2 hours. Make sure to complete your predictions before the deadline.`,
          icon: 'Clock',
          confirmText: 'Continue',
          confirmVariant: 'default'
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          icon: 'AlertCircle',
          confirmText: 'Confirm',
          confirmVariant: 'default'
        };
    }
  };

  const content = getDialogContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-elevation-2 p-6 w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full ${
            content?.confirmVariant === 'destructive' ?'bg-destructive/10 text-destructive' :'bg-primary/10 text-primary'
          }`}>
            <Icon name={content?.icon} size={20} />
          </div>
          <h3 className="font-semibold text-foreground">{content?.title}</h3>
        </div>

        {/* Message */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {content?.message}
        </p>

        {/* Additional Info for Save All */}
        {type === 'save-all' && data && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Predictions:</span>
                <span className="font-medium text-foreground ml-2">{data?.count}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Complete Predictions:</span>
                <span className="font-medium text-foreground ml-2">{data?.complete}</span>
              </div>
            </div>
            {data?.incomplete > 0 && (
              <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded text-sm text-warning">
                <Icon name="AlertTriangle" size={14} className="inline mr-1" />
                {data?.incomplete} predictions are incomplete (missing scores)
              </div>
            )}
          </div>
        )}

        {/* Deadline Warning List */}
        {type === 'deadline-warning' && data?.urgentMatches && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-warning mb-2">Urgent Matches:</h4>
            <div className="space-y-2">
              {data?.urgentMatches?.slice(0, 3)?.map((match) => (
                <div key={match?.id} className="text-sm text-muted-foreground">
                  {match?.homeTeam?.name} vs {match?.awayTeam?.name}
                  <span className="text-warning ml-2">
                    ({match?.timeRemaining})
                  </span>
                </div>
              ))}
              {data?.urgentMatches?.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{data?.urgentMatches?.length - 3} more matches
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant={content?.confirmVariant}
            onClick={onConfirm}
            iconName={content?.icon}
            iconPosition="left"
          >
            {content?.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;