/**
 * In-Memory Token Manager
 * Stores the short-lived JWT Access Token exclusively in memory.
 * Never writes to localStorage or sessionStorage, neutralizing XSS token theft.
 */

let inMemoryAccessToken = null;

export const tokenManager = {
  getAccessToken: () => inMemoryAccessToken,

  setAccessToken: (token) => {
    inMemoryAccessToken = token || null;
  },

  clearAccessToken: () => {
    inMemoryAccessToken = null;
  },

  hasAccessToken: () => Boolean(inMemoryAccessToken),
};

export default tokenManager;
