import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LeagueCard = ({ league, onEdit, onDelete, onViewMembers, onGenerateInvite }) => {
  const getPrivacyIcon = () => {
    return league?.isPrivate ? 'Lock' : 'Globe';
  };

  const getPrivacyColor = () => {
    return league?.isPrivate ? 'text-warning' : 'text-success';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-1 transition-standard">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{league?.name}</h3>
            <Icon 
              name={getPrivacyIcon()} 
              size={16} 
              className={getPrivacyColor()}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{league?.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{league?.memberCount} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Trophy" size={14} />
              <span>{league?.competition}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>Created {league?.createdDate}</span>
            </div>
          </div>
        </div>
        
        {league?.isOwner && (
          <div className="flex items-center space-x-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(league)}
              className="h-8 w-8"
            >
              <Icon name="Settings" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(league)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Crown" size={12} color="white" />
          </div>
          <span className="text-sm font-medium text-foreground">{league?.currentLeader}</span>
          <span className="text-xs text-muted-foreground">({league?.leaderPoints} pts)</span>
        </div>

        <div className="flex items-center space-x-2">
          {league?.isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewMembers(league)}
                iconName="Users"
                iconPosition="left"
              >
                Members
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateInvite(league)}
                iconName="Share"
                iconPosition="left"
              >
                Invite
              </Button>
            </>
          )}
          <Link to="/league-leaderboards">
            <Button
              variant="default"
              size="sm"
              iconName="BarChart3"
              iconPosition="left"
            >
              View Board
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeagueCard;