import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const JoinLeagueSection = ({ onJoinLeague }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(null);

  // Mock public leagues data
  const publicLeagues = [
    {
      id: 'pub-1',
      name: 'Champions League Masters',
      description: 'Elite predictions for Champions League matches',
      competition: 'UEFA Champions League',
      memberCount: 45,
      maxMembers: 50,
      currentLeader: 'FootballGuru',
      leaderPoints: 127,
      createdBy: 'PredictionKing',
      isPrivate: false
    },
    {
      id: 'pub-2',
      name: 'Turkish Football Fanatics',
      description: 'Passionate predictions for Turkish Super League',
      competition: 'Turkish Super League',
      memberCount: 32,
      maxMembers: 100,
      currentLeader: 'GalatasarayFan',
      leaderPoints: 89,
      createdBy: 'TurkishFootball',
      isPrivate: false
    },
    {
      id: 'pub-3',
      name: 'Premier League Predictors',
      description: 'Weekly predictions for Premier League matches',
      competition: 'Premier League',
      memberCount: 78,
      maxMembers: 100,
      currentLeader: 'ManUtdFan',
      leaderPoints: 156,
      createdBy: 'EPLExpert',
      isPrivate: false
    },
    {
      id: 'pub-4',
      name: 'La Liga Legends',
      description: 'Spanish football prediction championship',
      competition: 'La Liga',
      memberCount: 23,
      maxMembers: 50,
      currentLeader: 'BarcelonaFan',
      leaderPoints: 98,
      createdBy: 'SpanishFootball',
      isPrivate: false
    }
  ];

  const filteredLeagues = publicLeagues?.filter(league =>
    league?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    league?.competition?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    league?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleJoinByCode = () => {
    if (inviteCode?.trim()) {
      // Mock league data for invite code
      const mockLeague = {
        id: 'inv-1',
        name: 'Private Champions Circle',
        description: 'Exclusive league for serious predictors',
        competition: 'UEFA Champions League',
        memberCount: 12,
        maxMembers: 20,
        isPrivate: true,
        inviteCode: inviteCode
      };
      
      onJoinLeague(mockLeague);
      setInviteCode('');
    }
  };

  const handleJoinPublicLeague = (league) => {
    onJoinLeague(league);
  };

  const handlePreviewLeague = (league) => {
    setSelectedLeague(league);
  };

  return (
    <div className="space-y-6">
      {/* Join by Invite Code */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Key" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Join with Invite Code</h3>
        </div>
        
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="Invitation Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e?.target?.value?.toUpperCase())}
              maxLength={6}
            />
          </div>
          <Button
            variant="default"
            onClick={handleJoinByCode}
            disabled={inviteCode?.length !== 6}
            iconName="LogIn"
            iconPosition="left"
          >
            Join League
          </Button>
        </div>
      </div>
      {/* Browse Public Leagues */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Globe" size={20} className="text-success" />
            <h3 className="text-lg font-semibold text-foreground">Public Leagues</h3>
          </div>
          <div className="w-64">
            <Input
              type="search"
              placeholder="Search leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredLeagues?.map((league) => (
            <div
              key={league?.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-micro"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-foreground">{league?.name}</h4>
                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                      Public
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{league?.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={12} />
                      <span>{league?.memberCount}/{league?.maxMembers === 0 ? '∞' : league?.maxMembers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Trophy" size={12} />
                      <span>{league?.competition}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Crown" size={12} />
                      <span>{league?.currentLeader} ({league?.leaderPoints} pts)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={12} />
                      <span>by {league?.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewLeague(league)}
                    iconName="Eye"
                    iconPosition="left"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleJoinPublicLeague(league)}
                    disabled={league?.memberCount >= league?.maxMembers && league?.maxMembers !== 0}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    {league?.memberCount >= league?.maxMembers && league?.maxMembers !== 0 ? 'Full' : 'Join'}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredLeagues?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No leagues found matching your search.</p>
            </div>
          )}
        </div>
      </div>
      {/* League Preview Modal */}
      {selectedLeague && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">League Preview</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLeague(null)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">{selectedLeague?.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedLeague?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Competition:</span>
                  <p className="font-medium text-foreground">{selectedLeague?.competition}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Members:</span>
                  <p className="font-medium text-foreground">
                    {selectedLeague?.memberCount}/{selectedLeague?.maxMembers === 0 ? '∞' : selectedLeague?.maxMembers}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Leader:</span>
                  <p className="font-medium text-foreground">{selectedLeague?.currentLeader}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Top Score:</span>
                  <p className="font-medium text-foreground">{selectedLeague?.leaderPoints} pts</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLeague(null)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleJoinPublicLeague(selectedLeague);
                    setSelectedLeague(null);
                  }}
                  fullWidth
                  iconName="Plus"
                  iconPosition="left"
                >
                  Join League
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinLeagueSection;