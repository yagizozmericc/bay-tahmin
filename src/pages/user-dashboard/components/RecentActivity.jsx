import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = ({ items = [], loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Activity" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Activity" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="text-center py-10">
          <Icon name="AlertTriangle" size={32} className="mx-auto text-warning mb-3" />
          <p className="text-sm text-muted-foreground">Unable to load recent match activity.</p>
        </div>
      </div>
    );
  }

  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Icon name="RefreshCw" size={16} />
          <span className="text-xs">Match updates</span>
        </div>
      </div>

      {hasItems ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.map((activity, index) => (
            <div
              key={activity?.id || index}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-micro"
            >
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                <Icon name={activity?.icon || 'Activity'} size={18} className="text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-foreground">{activity?.title}</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{activity?.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{activity?.timestamp}</span>
                  {index === 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs text-success">New</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Icon name="Info" size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No recent match activity yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Finished matches will appear here automatically.</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-micro">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
