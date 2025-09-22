import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MemberManagementModal = ({ league, isOpen, onClose, onRemoveMember, onPromoteToAdmin }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !league) return null;

  // Mock members data
  const members = [
    {
      id: 'mem-1',
      username: 'FootballGuru',
      email: 'guru@email.com',
      joinDate: '2024-09-15',
      totalPoints: 127,
      predictions: 23,
      accuracy: 78,
      isAdmin: false,
      isOwner: false,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'mem-2',
      username: 'PredictionMaster',
      email: 'master@email.com',
      joinDate: '2024-09-14',
      totalPoints: 89,
      predictions: 18,
      accuracy: 72,
      isAdmin: true,
      isOwner: false,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'mem-3',
      username: 'ScoreWizard',
      email: 'wizard@email.com',
      joinDate: '2024-09-13',
      totalPoints: 156,
      predictions: 25,
      accuracy: 84,
      isAdmin: false,
      isOwner: true,
      avatar: 'https://randomuser.me/api/portraits/men/56.jpg'
    },
    {
      id: 'mem-4',
      username: 'ChampionsLeagueFan',
      email: 'fan@email.com',
      joinDate: '2024-09-12',
      totalPoints: 67,
      predictions: 15,
      accuracy: 65,
      isAdmin: false,
      isOwner: false,
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    {
      id: 'mem-5',
      username: 'TacticalGenius',
      email: 'genius@email.com',
      joinDate: '2024-09-11',
      totalPoints: 98,
      predictions: 20,
      accuracy: 75,
      isAdmin: false,
      isOwner: false,
      avatar: 'https://randomuser.me/api/portraits/men/73.jpg'
    }
  ];

  const filteredMembers = members?.filter(member =>
    member?.username?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    member?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const getRoleDisplay = (member) => {
    if (member?.isOwner) return { text: 'Owner', color: 'text-primary', bg: 'bg-primary/10' };
    if (member?.isAdmin) return { text: 'Admin', color: 'text-warning', bg: 'bg-warning/10' };
    return { text: 'Member', color: 'text-muted-foreground', bg: 'bg-muted' };
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
                <span>{members?.filter(m => m?.isAdmin)?.length} admins</span>
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
          <div className="divide-y divide-border">
            {filteredMembers?.map((member) => {
              const role = getRoleDisplay(member);
              
              return (
                <div key={member?.id} className="p-4 hover:bg-muted/30 transition-micro">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <img
                          src={member?.avatar}
                          alt={member?.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/images/no_image.png';
                          }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-foreground">{member?.username}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${role?.bg} ${role?.color}`}>
                            {role?.text}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{member?.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>Joined {member?.joinDate}</span>
                          <span>{member?.totalPoints} points</span>
                          <span>{member?.predictions} predictions</span>
                          <span>{member?.accuracy}% accuracy</span>
                        </div>
                      </div>
                    </div>

                    {!member?.isOwner && (
                      <div className="flex items-center space-x-2">
                        {!member?.isAdmin && (
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

          {filteredMembers?.length === 0 && (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No members found matching your search.</p>
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