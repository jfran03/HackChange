/**
 * Simple in-memory cache for shelter data with expiration
 */

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

class ShelterCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate a cache key based on map bounds
   */
  getCacheKey(bounds) {
    const { north, south, east, west } = bounds;
    // Round to 3 decimal places to group nearby requests
    return `${north.toFixed(3)},${south.toFixed(3)},${east.toFixed(3)},${west.toFixed(3)}`;
  }

  /**
   * Get cached shelters if available and not expired
   */
  get(bounds) {
    const key = this.getCacheKey(bounds);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    console.log('[ShelterCache] Cache hit for bounds:', key);
    return cached.data;
  }

  /**
   * Store shelters in cache
   */
  set(bounds, data) {
    const key = this.getCacheKey(bounds);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log('[ShelterCache] Cached shelters for bounds:', key);
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
    console.log('[ShelterCache] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const shelterCache = new ShelterCache();
