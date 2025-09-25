import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Prediction Service - Firebase Firestore operations for user predictions
 */
export const predictionService = {
  /**
   * Save a prediction to Firestore
   * @param {string} userId - Firebase user ID
   * @param {string} matchId - Match ID
   * @param {Object} prediction - Prediction data
   * @returns {Promise<void>}
   */
  async savePrediction(userId, matchId, prediction) {
    try {
      if (!userId || !matchId) {
        throw new Error('User ID and Match ID are required');
      }

      const predictionRef = doc(db, 'predictions', `${userId}_${matchId}`);
      
      const predictionData = {
        userId,
        matchId,
        homeScore: prediction.homeScore !== '' ? Number(prediction.homeScore) : null,
        awayScore: prediction.awayScore !== '' ? Number(prediction.awayScore) : null,
        scorers: Array.isArray(prediction.scorers) ? prediction.scorers.filter(Boolean) : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending',
        points: 0
      };

      await setDoc(predictionRef, predictionData, { merge: true });
      console.log('Prediction saved successfully:', { userId, matchId });
      
      // Return the saved data for UI updates
      return {
        ...predictionData,
        createdAt: new Date(), // Convert serverTimestamp to Date for immediate use
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error saving prediction:', error);
      throw new Error(`Failed to save prediction: ${error.message}`);
    }
  },

  /**
   * Get all predictions for a user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Array>} Array of user predictions
   */
  async getUserPredictions(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const q = query(
        collection(db, 'predictions'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const predictions = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Convert timestamps to dates for easier handling
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      console.log(`Loaded ${predictions.length} predictions for user:`, userId);
      return predictions;
    } catch (error) {
      console.error('Error loading user predictions:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  /**
   * Get a specific prediction for a user and match
   * @param {string} userId - Firebase user ID
   * @param {string} matchId - Match ID
   * @returns {Promise<Object|null>} Prediction data or null if not found
   */
  async getPrediction(userId, matchId) {
    try {
      if (!userId || !matchId) {
        throw new Error('User ID and Match ID are required');
      }

      const predictionRef = doc(db, 'predictions', `${userId}_${matchId}`);
      const snapshot = await getDoc(predictionRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading prediction:', error);
      return null;
    }
  },

  /**
   * Save multiple predictions in a batch
   * @param {string} userId - Firebase user ID
   * @param {Object} predictions - Object with matchId as key and prediction as value
   * @returns {Promise<void>}
   */
  async saveMultiplePredictions(userId, predictions) {
    try {
      if (!userId || !predictions) {
        throw new Error('User ID and predictions are required');
      }

      const batch = writeBatch(db);
      let count = 0;

      Object.entries(predictions).forEach(([matchId, prediction]) => {
        // Skip empty predictions
        if (!prediction || (prediction.homeScore === '' && prediction.awayScore === '' && (!prediction.scorers || prediction.scorers.length === 0))) {
          return;
        }

        const predictionRef = doc(db, 'predictions', `${userId}_${matchId}`);
        const predictionData = {
          userId,
          matchId,
          homeScore: prediction.homeScore !== '' ? Number(prediction.homeScore) : null,
          awayScore: prediction.awayScore !== '' ? Number(prediction.awayScore) : null,
          scorers: Array.isArray(prediction.scorers) ? prediction.scorers.filter(Boolean) : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'pending',
          points: 0
        };

        batch.set(predictionRef, predictionData, { merge: true });
        count++;
      });

      if (count > 0) {
        await batch.commit();
        console.log(`Successfully saved ${count} predictions`);
      } else {
        console.log('No valid predictions to save');
      }
    } catch (error) {
      console.error('Error saving multiple predictions:', error);
      throw new Error(`Failed to save predictions: ${error.message}`);
    }
  },

  /**
   * Delete a prediction
   * @param {string} userId - Firebase user ID
   * @param {string} matchId - Match ID
   * @returns {Promise<void>}
   */
  async deletePrediction(userId, matchId) {
    try {
      if (!userId || !matchId) {
        throw new Error('User ID and Match ID are required');
      }

      const predictionRef = doc(db, 'predictions', `${userId}_${matchId}`);
      await deleteDoc(predictionRef);
      console.log('Prediction deleted successfully:', { userId, matchId });
    } catch (error) {
      console.error('Error deleting prediction:', error);
      throw new Error(`Failed to delete prediction: ${error.message}`);
    }
  }
};

// Named exports for individual functions (for backward compatibility)
export const savePrediction = predictionService.savePrediction;
export const getUserPredictions = predictionService.getUserPredictions;
export const getPrediction = predictionService.getPrediction;

export default predictionService;
