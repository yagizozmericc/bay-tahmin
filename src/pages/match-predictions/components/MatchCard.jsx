import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { COMPETITIONS } from '../../../hooks/useMatches';
import { isActivePrediction } from '../../../utils/predictionUtils';

const MAX_SCORERS = 3;

const PLAYER_OPTIONS = [
  { value: 'haaland', label: 'Erling Haaland' },
  { value: 'mbappe', label: 'Kylian MbappÃ©' },
  { value: 'benzema', label: 'Karim Benzema' },
  { value: 'lewandowski', label: 'Robert Lewandowski' },
  { value: 'salah', label: 'Mohamed Salah' },
  { value: 'mane', label: 'Sadio ManÃ©' },
  { value: 'kane', label: 'Harry Kane' },
  { value: 'ronaldo', label: 'Cristiano Ronaldo' },
  { value: 'messi', label: 'Lionel Messi' },
  { value: 'neymar', label: 'Neymar Jr' },
  { value: 'vinicius', label: 'VinÃ­cius Jr' },
  { value: 'osimhen', label: 'Victor Osimhen' }
];

const toDisplayScore = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '';
};

const MatchCard = ({
  match,
  onPredictionChange,
  userPrediction,
  canEdit = false,
  savingState,
  lastSavedAt,
  saveError,
  matchResult = null,
  showResult = false
}) => {
  const [homeScore, setHomeScore] = useState(toDisplayScore(userPrediction?.homeScore));
  const [awayScore, setAwayScore] = useState(toDisplayScore(userPrediction?.awayScore));
  const [selectedScorers, setSelectedScorers] = useState(Array.isArray(userPrediction?.scorers) ? userPrediction.scorers : []);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    setHomeScore(toDisplayScore(userPrediction?.homeScore));
    setAwayScore(toDisplayScore(userPrediction?.awayScore));
    setSelectedScorers(Array.isArray(userPrediction?.scorers) ? userPrediction.scorers : []);
  }, [userPrediction]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const matchTime = new Date(match.kickoffTime);
      const diff = matchTime - now;

      if (diff <= 0) {
        setTimeRemaining('Predictions closed');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [match?.kickoffTime]);

  const isPredictionDeadlinePassed = () => new Date() >= new Date(match.kickoffTime);
  const isEditable = canEdit && !isPredictionDeadlinePassed();

  const handleScoreChange = (type, value) => {
    if (!isEditable) {
      return;
    }

    const sanitized = value === '' ? '' : Math.max(0, Math.min(20, Number.parseInt(value, 10) || 0));

    if (type === 'home') {
      setHomeScore(sanitized);
    } else {
      setAwayScore(sanitized);
    }

    onPredictionChange(match?.id, {
      homeScore: type === 'home' ? sanitized : homeScore,
      awayScore: type === 'away' ? sanitized : awayScore,
      scorers: selectedScorers
    });
  };

  const handleScorerChange = (index, value) => {
    if (!isEditable) {
      return;
    }

    const newScorers = [...selectedScorers];
    newScorers[index] = value;
    setSelectedScorers(newScorers);

    onPredictionChange(match?.id, {
      homeScore,
      awayScore,
      scorers: newScorers
    });
  };

  const addScorerSlot = () => {
    if (!isEditable || selectedScorers.length >= MAX_SCORERS) {
      return;
    }

    setSelectedScorers((prev) => [...prev, '']);
  };

  const removeScorerSlot = (index) => {
    if (!isEditable) {
      return;
    }

    const newScorers = selectedScorers.filter((_, i) => i !== index);
    setSelectedScorers(newScorers);

    onPredictionChange(match?.id, {
      homeScore,
      awayScore,
      scorers: newScorers
    });
  };

  const getCompetitionBadge = () => {
    const isSuperLig = match?.competitionCode === COMPETITIONS.TURKISH_SUPER_LEAGUE
      || (match?.competition || '').toLowerCase().includes('super lig');
    const badgeClass = isSuperLig ? 'bg-red-600 text-white' : 'bg-muted text-foreground';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        <Icon name={isSuperLig ? 'Flag' : 'Trophy'} size={12} className="mr-1" />
        {match?.competition || (isSuperLig ? 'Turkish Super Lig' : 'Match')}
      </span>
    );
  };

  const isUrgent = () => {
    const now = new Date();
    const matchTime = new Date(match.kickoffTime);
    const diff = matchTime - now;
    return diff > 0 && diff <= 2 * 60 * 60 * 1000;
  };

  const renderSaveStatus = () => {
    if (isPredictionDeadlinePassed()) {
      return (
        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center space-x-2">
          <Icon name="Lock" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Predictions are now locked for this match</span>
        </div>
      );
    }

    if (!canEdit) {
      return (
        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sign in to save predictions for this match.</span>
        </div>
      );
    }

    if (savingState === 'saving') {
      return (
        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center space-x-2">
          <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Saving prediction...</span>
        </div>
      );
    }

    if (savingState === 'error') {
      return (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
          <Icon name="AlertTriangle" size={16} className="text-destructive" />
          <span className="text-sm text-destructive">{saveError || 'Failed to save prediction. Please try again.'}</span>
        </div>
      );
    }

    if (isActivePrediction({ homeScore, awayScore, scorers: selectedScorers })) {
      const label = lastSavedAt
        ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
        : 'Saved';

      return (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-2">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span className="text-sm text-success">{label}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-standard">
      <div className="flex items-center justify-between mb-4">
        {getCompetitionBadge()}
        <div className={`text-sm font-medium ${isUrgent() ? 'text-warning animate-pulse' : 'text-muted-foreground'}`}>
          {timeRemaining}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={match?.homeTeam?.logo}
              alt={match?.homeTeam?.name}
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{match?.homeTeam?.name}</h3>
            <p className="text-sm text-muted-foreground">Home</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mx-6">
          <div className="text-center">
            {showResult && matchResult?.finalScore ? (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Final Result</p>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">
                      {matchResult.finalScore.home ?? '-'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-muted-foreground">-</span>
                  <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">
                      {matchResult.finalScore.away ?? '-'}
                    </span>
                  </div>
                </div>
                {userPrediction && (userPrediction.homeScore !== '' || userPrediction.awayScore !== '') && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Your Prediction</p>
                    <div className="text-sm text-muted-foreground">
                      {userPrediction.homeScore || '0'} - {userPrediction.awayScore || '0'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Score Prediction</p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={homeScore}
                    onChange={(e) => handleScoreChange('home', e?.target?.value)}
                    className="w-16 text-center"
                    min="0"
                    max="20"
                    disabled={!isEditable}
                    placeholder="0"
                  />
                  <span className="text-lg font-bold text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={awayScore}
                    onChange={(e) => handleScoreChange('away', e?.target?.value)}
                    className="w-16 text-center"
                    min="0"
                    max="20"
                    disabled={!isEditable}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-1 justify-end">
          <div className="text-right">
            <h3 className="font-semibold text-foreground">{match?.awayTeam?.name}</h3>
            <p className="text-sm text-muted-foreground">Away</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={match?.awayTeam?.logo}
              alt={match?.awayTeam?.name}
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Icon name="Calendar" size={16} />
          <span>{new Date(match.kickoffTime)?.toLocaleDateString('en-GB')}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={16} />
          <span>{new Date(match.kickoffTime)?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="MapPin" size={16} />
          <span>{match?.venue || 'TBD'}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground">Goal Scorer Predictions</h4>
          <span className="text-xs text-muted-foreground">Max {MAX_SCORERS} players</span>
        </div>

        <div className="space-y-3">
          {selectedScorers.map((scorer, index) => (
            <div key={`${match?.id}-scorer-${index}`} className="flex items-center space-x-2">
              <Select
                placeholder="Select a player"
                options={PLAYER_OPTIONS}
                value={scorer}
                onChange={(value) => handleScorerChange(index, value)}
                disabled={!isEditable}
                searchable
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeScorerSlot(index)}
                disabled={!isEditable}
                className="text-destructive hover:text-destructive"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          ))}

          {selectedScorers.length < MAX_SCORERS && isEditable && (
            <Button
              variant="outline"
              onClick={addScorerSlot}
              className="w-full"
              iconName="Plus"
              iconPosition="left"
            >
              Add Goal Scorer
            </Button>
          )}
        </div>
      </div>

      {renderSaveStatus()}

      {showResult && matchResult && userPrediction && userPrediction.status === 'scored' && (
        <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground mb-1">Prediction Result</h4>
              <div className="space-y-1 text-sm">
                {userPrediction.evaluation?.exactScore && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Target" size={16} className="text-success" />
                    <span className="text-success font-medium">Exact Score! (+3 points)</span>
                  </div>
                )}
                {userPrediction.evaluation?.correctOutcome && !userPrediction.evaluation?.exactScore && (
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-success">Correct Outcome (+1 point)</span>
                  </div>
                )}
                {userPrediction.evaluation?.scorerHits && userPrediction.evaluation.scorerHits.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={16} className="text-success" />
                    <span className="text-success">
                      {userPrediction.evaluation.scorerHits.length} correct scorer(s) (+{userPrediction.evaluation.scorerHits.length} points)
                    </span>
                  </div>
                )}
                {(!userPrediction.evaluation?.correctOutcome && userPrediction.evaluation?.points === 0) && (
                  <div className="flex items-center space-x-2">
                    <Icon name="X" size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">No points earned</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {userPrediction.points || 0}
              </div>
              <div className="text-sm text-muted-foreground">points</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;