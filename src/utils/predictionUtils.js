/**
 * Utility functions for prediction validation and processing
 */

/**
 * Check if a value represents a valid prediction score
 */
export const isValidScore = (value) => {
  return value !== '' && value !== null && value !== undefined;
};

/**
 * Check if a prediction has any valid content
 */
export const hasPredictionContent = (prediction) => {
  if (!prediction) return false;

  const hasScore = isValidScore(prediction.homeScore) || isValidScore(prediction.awayScore);
  const hasScorers = Array.isArray(prediction.scorers) && prediction.scorers.length > 0;

  return hasScore || hasScorers;
};

/**
 * Check if prediction has complete score prediction
 */
export const hasCompleteScore = (prediction) => {
  if (!prediction) return false;

  return isValidScore(prediction.homeScore) && isValidScore(prediction.awayScore);
};

/**
 * Clean prediction value for display
 */
export const cleanPredictionValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '';
};

/**
 * Check if prediction should be considered as "having content" for statistics
 */
export const isActivePrediction = (prediction) => {
  if (!prediction) return false;

  // Check if any score field has meaningful content
  const homeScore = prediction.homeScore;
  const awayScore = prediction.awayScore;

  const hasValidHome = homeScore !== null && homeScore !== undefined && homeScore !== '';
  const hasValidAway = awayScore !== null && awayScore !== undefined && awayScore !== '';
  const hasScorers = Array.isArray(prediction.scorers) && prediction.scorers.length > 0;

  return hasValidHome || hasValidAway || hasScorers;
};