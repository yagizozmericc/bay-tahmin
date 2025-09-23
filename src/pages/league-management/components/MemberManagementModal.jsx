import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { getLeagueMembers } from '../../../services/leagueService';

const MemberManagementModal = ({ league, isOpen, onClose, onRemoveMember, onPromoteToAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load members when modal opens or league changes
  useEffect(() => {
    if (isOpen && league?.id) {
      loadMembers();
    }
  }, [isOpen, league?.id]);

  const loadMembers = async () => {
    if (!league?.id) return;

    try {
      setLoading(true);
      setError(null);
      const memberData = await getLeagueMembers(league.id);
      setMembers(memberData);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !league) return null;

  const filteredMembers = members?.filter(member =>
    member?.userName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    member?.userEmail?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const getRoleDisplay = (member) => {
    if (member?.role === 'owner') return { text: 'Owner', color: 'text-primary', bg: 'bg-primary/10' };
    if (member?.role === 'admin') return { text: 'Admin', color: 'text-warning', bg: 'bg-warning/10' };
    return { text: 'Member', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';

    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Manage Members</h2>
            <p className="text-sm text-muted-foreground">{league?.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="Users" size={16} />
                <span>{members?.length} total members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Shield" size={16} />
                <span>{members?.filter(m => m?.role === 'admin')?.length} admins</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Crown" size={16} />
                <span>1 owner</span>
              </div>
            </div>
            <div className="w-64">
              <Input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
              />
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-3" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadMembers} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMembers?.map((member) => {
                const role = getRoleDisplay(member);

                return (
                  <div key={member?.id} className="p-4 hover:bg-muted/30 transition-micro">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Profile Icon Instead of Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Icon name="User" size={20} color="white" />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-foreground">{member?.userName}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${role?.bg} ${role?.color}`}>
                              {role?.text}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{member?.userEmail}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>Joined {formatDate(member?.joinedAt)}</span>
                            <span>{member?.totalPoints || 0} points</span>
                            <span>{member?.totalPredictions || 0} predictions</span>
                            <span>{member?.accuracy || 0}% accuracy</span>
                          </div>
                        </div>
                      </div>

                      {member?.role !== 'owner' && (
                        <div className="flex items-center space-x-2">
                          {member?.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onPromoteToAdmin(member)}
                              iconName="Shield"
                              iconPosition="left"
                            >
                              Make Admin
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveMember(member)}
                            className="text-destructive hover:text-destructive"
                            iconName="UserMinus"
                            iconPosition="left"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredMembers?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No members found matching your search.' : 'No members found.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagementModal;