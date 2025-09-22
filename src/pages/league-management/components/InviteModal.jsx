import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InviteModal = ({ league, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('link'); // 'link' or 'code'

  if (!isOpen || !league) return null;

  // Mock invite data
  const inviteLink = `https://scoreguess.pro/join/${league?.id}?invite=ABC123`;
  const inviteCode = 'ABC123';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard?.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Join my Bay Tahmin league "${league?.name}"! Use this link: ${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    const subject = `Join my Bay Tahmin league: ${league?.name}`;
    const body = `Hi!\n\nI'd like to invite you to join my prediction league "${league?.name}" on Bay Tahmin Pro.\n\nLeague Details:\n- Competition: ${league?.competition}\n- Members: ${league?.memberCount}\n- Current Leader: ${league?.currentLeader}\n\nJoin using this link: ${inviteLink}\n\nOr use invite code: ${inviteCode}\n\nLet's see who's the better predictor!\n\nCheers!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invite Members</h2>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Method Selection */}
          <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setInviteMethod('link')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-micro ${
                inviteMethod === 'link' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Invite Link
            </button>
            <button
              onClick={() => setInviteMethod('code')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-micro ${
                inviteMethod === 'code' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Invite Code
            </button>
          </div>

          {/* Invite Link */}
          {inviteMethod === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Share this link
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground font-mono break-all">
                    {inviteLink}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className={copied ? 'text-success' : ''}
                  >
                    <Icon name={copied ? "Check" : "Copy"} size={16} />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-success mt-1">Link copied to clipboard!</p>
                )}
              </div>

              {/* Quick Share Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Quick share</p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    iconName="MessageCircle"
                    iconPosition="left"
                    className="flex-1"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShareEmail}
                    iconName="Mail"
                    iconPosition="left"
                    className="flex-1"
                  >
                    Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Invite Code */}
          {inviteMethod === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Share this code
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-4 py-3 bg-muted border border-border rounded-md text-center">
                    <span className="text-2xl font-bold text-foreground font-mono tracking-wider">
                      {inviteCode}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className={copied ? 'text-success' : ''}
                  >
                    <Icon name={copied ? "Check" : "Copy"} size={16} />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-success mt-1">Code copied to clipboard!</p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Members can join by entering this 6-digit code in the "Join League" section.
                </p>
              </div>
            </div>
          )}

          {/* League Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">League Information</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Competition:</span>
                <span className="text-foreground">{league?.competition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Current Members:</span>
                <span className="text-foreground">{league?.memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Privacy:</span>
                <span className="text-foreground">{league?.isPrivate ? 'Private' : 'Public'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;