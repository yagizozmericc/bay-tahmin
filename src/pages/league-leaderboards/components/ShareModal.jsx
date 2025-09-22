import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ShareModal = ({ isOpen, onClose, userRank, leagueName }) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  if (!isOpen) return null;

  const shareUrl = `https://scoreguess.pro/league-leaderboards?ref=${userRank?.id}`;
  const shareText = `I'm ranked #${userRank?.position} in ${leagueName} with ${userRank?.totalPoints} points! 🏆 Join me on Bay Tahmin Pro and test your football prediction skills!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform) => {
    setSelectedPlatform(platform);
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    setTimeout(() => setSelectedPlatform(null), 1000);
  };

  const socialPlatforms = [
    { id: 'twitter', name: 'Twitter', icon: 'Twitter', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', color: 'bg-green-500 hover:bg-green-600' },
    { id: 'telegram', name: 'Telegram', icon: 'Send', color: 'bg-blue-400 hover:bg-blue-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-lg border border-border shadow-elevation-2 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Share Your Achievement</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Achievement Preview */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-3">
              <Icon name="Trophy" size={32} color="white" />
            </div>
            <h3 className="font-bold text-xl text-foreground">Rank #{userRank?.position}</h3>
            <p className="text-muted-foreground">{leagueName}</p>
            <p className="text-lg font-semibold text-primary mt-2">{userRank?.totalPoints} Points</p>
            <p className="text-sm text-muted-foreground">{userRank?.accuracy}% Accuracy</p>
          </div>

          {/* Share Text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Share Message</label>
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground">
              {shareText}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Share Link</label>
            <div className="flex space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant={copied ? "success" : "outline"}
                onClick={handleCopyLink}
                iconName={copied ? "Check" : "Copy"}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Share on Social Media</label>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms?.map((platform) => (
                <Button
                  key={platform?.id}
                  variant="outline"
                  onClick={() => handleSocialShare(platform?.id)}
                  loading={selectedPlatform === platform?.id}
                  className={`justify-start ${selectedPlatform === platform?.id ? 'opacity-75' : ''}`}
                  iconName={platform?.icon}
                  iconPosition="left"
                >
                  {platform?.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                className="flex-1"
              >
                Download Image
              </Button>
              <Button
                variant="outline"
                iconName="Mail"
                iconPosition="left"
                className="flex-1"
              >
                Send via Email
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;