import React, { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import {
  triggerManualProcessing,
  quickMatchCheck,
  getProcessingStatus
} from '../../services/matchProcessingService';

const MatchProcessingPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQuickCheck, setIsQuickCheck] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleManualProcessing = async () => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const result = await triggerManualProcessing();
      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickCheck = async () => {
    setIsQuickCheck(true);
    setError(null);
    setResults(null);

    try {
      const result = await quickMatchCheck();
      setResults({ success: true, quickCheck: true, ...result });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsQuickCheck(false);
    }
  };

  const status = getProcessingStatus();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Zap" size={24} className="text-primary" />
        <h2 className="text-xl font-bold text-foreground">Match Processing</h2>
      </div>

      {/* Current Status */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Last Run:</span>
            <span className="ml-2 text-foreground">
              {status.lastRun ? new Date(status.lastRun).toLocaleString() : 'Never'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">API Provider:</span>
            <span className="ml-2 text-foreground">{status.apiProvider}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Supported Leagues:</span>
            <span className="ml-2 text-foreground">{status.supportedLeagues.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Recommended Interval:</span>
            <span className="ml-2 text-foreground">{status.processingInterval}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={handleQuickCheck}
          loading={isQuickCheck}
          variant="outline"
          iconName="Search"
        >
          Quick Check
        </Button>

        <Button
          onClick={handleManualProcessing}
          loading={isProcessing}
          variant="default"
          iconName="Play"
        >
          Process All Leagues
        </Button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <Icon
              name={results.success ? "CheckCircle" : "XCircle"}
              size={16}
              className={results.success ? "text-success mr-2" : "text-error mr-2"}
            />
            Processing Results
          </h3>

          {results.quickCheck ? (
            // Quick check results
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matches Updated:</span>
                <span className="text-foreground font-medium">{results.matchesUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Predictions Scored:</span>
                <span className="text-foreground font-medium">{results.predictionsScored}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors:</span>
                <span className="text-foreground font-medium">{results.errors?.length || 0}</span>
              </div>
            </div>
          ) : (
            // Full processing results
            <div className="space-y-4">
              {results.success ? (
                <div className="space-y-3">
                  {results.results?.map((leagueResult, index) => (
                    <div key={index} className="border border-border rounded p-3">
                      <h4 className="font-medium text-foreground mb-2 capitalize">
                        {leagueResult.leagueId?.replace('-', ' ')}
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Matches:</span>
                          <span className="ml-1 text-foreground">{leagueResult.matchesUpdated}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Predictions:</span>
                          <span className="ml-1 text-foreground">{leagueResult.predictionsScored}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Errors:</span>
                          <span className="ml-1 text-foreground">{leagueResult.errors?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground">
                    Completed at: {new Date(results.completedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-error text-sm">
                  Processing failed: {results.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} className="text-error" />
            <span className="text-error font-medium">Error</span>
          </div>
          <p className="text-error/80 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>Quick Check:</strong> Updates match results and scores predictions without full league processing.</p>
        <p><strong>Process All Leagues:</strong> Complete processing of all supported leagues (takes 2-3 minutes).</p>
        <p><strong>Note:</strong> Processing should ideally be automated to run every 30 minutes during match days.</p>
      </div>
    </div>
  );
};

export default MatchProcessingPanel;