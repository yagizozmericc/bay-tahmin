import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LeagueCard from './components/LeagueCard';
import CreateLeagueForm from './components/CreateLeagueForm';
import JoinLeagueSection from './components/JoinLeagueSection';
import MemberManagementModal from './components/MemberManagementModal';
import InviteModal from './components/InviteModal';
import { getUserLeagues, deleteLeague } from '../../services/leagueService';
import { useAuth } from '../../context/AuthContext';

const LeagueManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leagues');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState(null);

  // Real Firestore data
  const [myLeagues, setMyLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'my-leagues', label: 'My Leagues', icon: 'Trophy', count: myLeagues?.length },
    { id: 'create', label: 'Create League', icon: 'Plus', count: null },
    { id: 'join', label: 'Join League', icon: 'UserPlus', count: null }
  ];

  // Load user's leagues
  useEffect(() => {
    if (user?.uid) {
      loadUserLeagues();
    } else {
      setLoading(false);
      setMyLeagues([]);
    }
  }, [user?.uid]);

  const loadUserLeagues = async () => {
    try {
      setLoading(true);
      setError(null);
      const leagues = await getUserLeagues(user.uid);
      setMyLeagues(leagues);
    } catch (err) {
      console.error('Error loading leagues:', err);
      setError('Failed to load your leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = (newLeague) => {
    // Add the new league to the list
    setMyLeagues(prev => [newLeague, ...prev]);
    setShowCreateForm(false);
    setActiveTab('my-leagues');
  };

  const handleJoinLeague = (league) => {
    // Refresh the user's leagues after joining
    loadUserLeagues();
    setActiveTab('my-leagues');
  };

  const handleEditLeague = (league) => {
    setSelectedLeague(league);
    setShowCreateForm(true);
  };

  const handleDeleteLeague = (league) => {
    setLeagueToDelete(league);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteLeague = async () => {
    if (!leagueToDelete || !user?.uid) return;

    try {
      await deleteLeague(leagueToDelete.id, user.uid);
      setMyLeagues(prev => prev?.filter(league => league?.id !== leagueToDelete?.id));
    } catch (err) {
      console.error('Error deleting league:', err);
      setError('Failed to delete league');
    } finally {
      setLeagueToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleViewMembers = (league) => {
    setSelectedLeague(league);
    setShowMemberModal(true);
  };

  const handleGenerateInvite = (league) => {
    setSelectedLeague(league);
    setShowInviteModal(true);
  };

  const handleRemoveMember = (member) => {
    console.log('Remove member:', member);
    // Implement member removal logic
  };

  const handlePromoteToAdmin = (member) => {
    console.log('Promote to admin:', member);
    // Implement admin promotion logic
  };

  const getTabContent = () => {
    if (activeTab === 'create' || showCreateForm) {
      return (
        <CreateLeagueForm
          onCreateLeague={handleCreateLeague}
          onCancel={() => {
            setShowCreateForm(false);
            setSelectedLeague(null);
            setActiveTab('my-leagues');
          }}
        />
      );
    }

    if (activeTab === 'join') {
      return <JoinLeagueSection onJoinLeague={handleJoinLeague} />;
    }

    // Loading state
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Leagues</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={loadUserLeagues}>Try Again</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Leagues</h2>
            <p className="text-muted-foreground">Manage your prediction leagues and competitions</p>
          </div>
          <Button
            variant="default"
            onClick={() => setActiveTab('create')}
            iconName="Plus"
            iconPosition="left"
          >
            Create League
          </Button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Trophy" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leagues</p>
                <p className="text-2xl font-bold text-foreground">{myLeagues?.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="Crown" size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Owned Leagues</p>
                <p className="text-2xl font-bold text-foreground">
                  {myLeagues?.filter(league => league?.isOwner)?.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-foreground">
                  {myLeagues?.reduce((sum, league) => sum + league?.memberCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Leagues Grid */}
        {myLeagues?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myLeagues?.map((league) => (
              <LeagueCard
                key={league?.id}
                league={league}
                onEdit={handleEditLeague}
                onDelete={handleDeleteLeague}
                onViewMembers={handleViewMembers}
                onGenerateInvite={handleGenerateInvite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trophy" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No leagues yet</h3>
            <p className="text-muted-foreground mb-6">Create your first league to start competing with friends</p>
            <Button
              variant="default"
              onClick={() => setActiveTab('create')}
              iconName="Plus"
              iconPosition="left"
            >
              Create Your First League
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>League Management - Bay Tahmin Pro</title>
        <meta name="description" content="Create and manage your prediction leagues. Compete with friends in custom football prediction competitions." />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background pt-16 lg:pt-20 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-6">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
            >
              {tabs?.map((tab) => (
                <option key={tab?.id} value={tab?.id}>
                  {tab?.label} {tab?.count !== null && `(${tab?.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex items-center space-x-1 mb-8 bg-muted rounded-lg p-1">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro ${
                  activeTab === tab?.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
                {tab?.count !== null && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {tab?.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {getTabContent()}
        </div>

        {/* Member Management Modal */}
        <MemberManagementModal
          league={selectedLeague}
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false);
            setSelectedLeague(null);
          }}
          onRemoveMember={handleRemoveMember}
          onPromoteToAdmin={handlePromoteToAdmin}
        />

        {/* Invite Modal */}
        <InviteModal
          league={selectedLeague}
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedLeague(null);
          }}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && leagueToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Delete League</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete "{leagueToDelete?.name}"? All league data, member information, and prediction history will be permanently removed.
              </p>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setLeagueToDelete(null);
                  }}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteLeague}
                  fullWidth
                  iconName="Trash2"
                  iconPosition="left"
                >
                  Delete League
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeagueManagement;