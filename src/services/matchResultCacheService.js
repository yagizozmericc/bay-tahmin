import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const MATCH_RESULTS_COLLECTION = 'matchResults';
const CACHE_DURATION_HOURS = 24;

export const matchResultCacheService = {
  /**
   * Cache match result in Firestore
   */
  async cacheMatchResult(matchId, result) {
    try {
      if (!matchId || !result) {
        throw new Error('Match ID and result are required');
      }

      const resultRef = doc(db, MATCH_RESULTS_COLLECTION, matchId);

      const cachedData = {
        matchId,
        finalScore: result.finalScore || null,
        status: result.status || 'FINISHED',
        scorers: Array.isArray(result.scorers) ? result.scorers : [],
        homeTeam: result.homeTeam || null,
        awayTeam: result.awayTeam || null,
        competition: result.competition || null,
        kickoffTime: result.kickoffTime || null,
        venue: result.venue || null,
        cachedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        source: 'thesportsdb'
      };

      await setDoc(resultRef, cachedData, { merge: true });
      console.log('Match result cached successfully:', matchId);

      return cachedData;
    } catch (error) {
      console.error('Error caching match result:', error);
      throw new Error(`Failed to cache match result: ${error.message}`);
    }
  },

  /**
   * Get cached match result
   */
  async getCachedResult(matchId) {
    try {
      if (!matchId) {
        return null;
      }

      const resultRef = doc(db, MATCH_RESULTS_COLLECTION, matchId);
      const snapshot = await getDoc(resultRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();

      // Check if cache is still valid
      if (this.isCacheExpired(data.cachedAt)) {
        console.log('Cached result expired for match:', matchId);
        return null;
      }

      return {
        id: snapshot.id,
        ...data,
        cachedAt: data.cachedAt?.toDate(),
        lastUpdated: data.lastUpdated?.toDate()
      };
    } catch (error) {
      console.error('Error getting cached result:', error);
      return null;
    }
  },

  /**
   * Check if cache is expired
   */
  isCacheExpired(cachedAt) {
    if (!cachedAt) {
      return true;
    }

    const now = new Date();
    const cacheTime = cachedAt instanceof Timestamp ? cachedAt.toDate() : cachedAt;
    const diffHours = (now - cacheTime) / (1000 * 60 * 60);

    return diffHours > CACHE_DURATION_HOURS;
  },

  /**
   * Get all cached results for matches
   */
  async getCachedResultsForMatches(matchIds) {
    try {
      if (!Array.isArray(matchIds) || matchIds.length === 0) {
        return new Map();
      }

      const resultsMap = new Map();

      // Firestore 'in' query limit is 10, so we batch the requests
      const batches = [];
      for (let i = 0; i < matchIds.length; i += 10) {
        batches.push(matchIds.slice(i, i + 10));
      }

      for (const batch of batches) {
        const q = query(
          collection(db, MATCH_RESULTS_COLLECTION),
          where('matchId', 'in', batch)
        );

        const snapshot = await getDocs(q);

        snapshot.docs.forEach(doc => {
          const data = doc.data();

          // Only include non-expired cache
          if (!this.isCacheExpired(data.cachedAt)) {
            resultsMap.set(data.matchId, {
              id: doc.id,
              ...data,
              cachedAt: data.cachedAt?.toDate(),
              lastUpdated: data.lastUpdated?.toDate()
            });
          }
        });
      }

      return resultsMap;
    } catch (error) {
      console.error('Error getting cached results for matches:', error);
      return new Map();
    }
  },

  /**
   * Get recent match results (for display purposes)
   */
  async getRecentCachedResults(limit = 20) {
    try {
      const q = query(
        collection(db, MATCH_RESULTS_COLLECTION),
        orderBy('lastUpdated', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const results = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();

        // Only include non-expired cache
        if (!this.isCacheExpired(data.cachedAt)) {
          results.push({
            id: doc.id,
            ...data,
            cachedAt: data.cachedAt?.toDate(),
            lastUpdated: data.lastUpdated?.toDate()
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Error getting recent cached results:', error);
      return [];
    }
  },

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    try {
      const q = query(collection(db, MATCH_RESULTS_COLLECTION));
      const snapshot = await getDocs(q);

      const expiredDocs = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (this.isCacheExpired(data.cachedAt)) {
          expiredDocs.push(doc.ref);
        }
      });

      if (expiredDocs.length > 0) {
        const batch = writeBatch(db);
        expiredDocs.forEach(docRef => {
          batch.delete(docRef);
        });
        await batch.commit();

        console.log(`Cleared ${expiredDocs.length} expired cache entries`);
      }

      return expiredDocs.length;
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return 0;
    }
  }
};

export default matchResultCacheService;