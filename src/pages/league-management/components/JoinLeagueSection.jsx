import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { getPublicLeagues, joinLeagueByCode } from '../../../services/leagueService';
import { useAuth } from '../../../context/AuthContext';

const JoinLeagueSection = ({ onJoinLeague }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [publicLeagues, setPublicLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningByCode, setJoiningByCode] = useState(false);
  const [joiningPublic, setJoiningPublic] = useState(null);

  // Load public leagues from Firestore
  useEffect(() => {
    loadPublicLeagues();
  }, []);

  const loadPublicLeagues = async () => {
    try {
      setLoading(true);
      setError(null);
      const leagues = await getPublicLeagues(20);
      setPublicLeagues(leagues);
    } catch (err) {
      console.error('Error loading public leagues:', err);
      setError(`Failed to load public leagues: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = publicLeagues?.filter(league =>
    league?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    league?.competition?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    league?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleJoinByCode = async () => {
    if (!inviteCode?.trim() || !user?.uid) return;

    try {
      setJoiningByCode(true);
      setError(null);

      const joinedLeague = await joinLeagueByCode(
        inviteCode.trim(),
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.email || ''
      );

      onJoinLeague(joinedLeague);
      setInviteCode('');
    } catch (err) {
      console.error('Error joining league by code:', err);
      setError(err.message || 'Failed to join league');
    } finally {
      setJoiningByCode(false);
    }
  };

  const handleJoinPublicLeague = async (league) => {
    if (!user?.uid) return;

    try {
      setJoiningPublic(league.id);
      setError(null);

      const joinedLeague = await joinLeagueByCode(
        league.inviteCode,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.email || ''
      );

      onJoinLeague(joinedLeague);
    } catch (err) {
      console.error('Error joining public league:', err);
      setError(err.message || 'Failed to join league');
    } finally {
      setJoiningPublic(null);
    }
  };

  const handlePreviewLeague = (league) => {
    setSelectedLeague(league);
  };


  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        </div>
      )}

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
            disabled={inviteCode?.length !== 6 || joiningByCode || !user?.uid}
            loading={joiningByCode}
            iconName={joiningByCode ? "Loader2" : "LogIn"}
            iconPosition="left"
          >
            {joiningByCode ? 'Joining...' : 'Join League'}
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={32} className="text-primary animate-spin" />
          </div>
        ) : error && publicLeagues.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-3" />
            <p className="text-destructive mb-4">Failed to load public leagues</p>
            <Button onClick={loadPublicLeagues} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
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
                      <Icon name="User" size={12} />
                      <span>by {league?.ownerName}</span>
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
                    disabled={league?.memberCount >= league?.maxMembers && league?.maxMembers !== 0 || joiningPublic === league.id || !user?.uid}
                    loading={joiningPublic === league.id}
                    iconName={joiningPublic === league.id ? "Loader2" : "Plus"}
                    iconPosition="left"
                  >
                    {joiningPublic === league.id ? 'Joining...' : (league?.memberCount >= league?.maxMembers && league?.maxMembers !== 0 ? 'Full' : 'Join')}
                  </Button>
                </div>
              </div>
            </div>
          ))}

            {filteredLeagues?.length === 0 && (
              <div className="text-center py-8">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No leagues found matching your search.' : 'No public leagues available.'}
                </p>
              </div>
            )}
          </div>
        )}
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
                  <span className="text-muted-foreground">Created by:</span>
                  <p className="font-medium text-foreground">{selectedLeague?.ownerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium text-foreground">
                    {selectedLeague?.createdAt?.toDate ? selectedLeague.createdAt.toDate().toLocaleDateString() : 'Recently'}
                  </p>
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