/**
 * Session management for persistent wallet sessions
 * Uses chrome.storage.session (Manifest V3) with localStorage fallback
 */

export interface SessionData {
  password: string; // Encrypted password or session token
  expiresAt: number; // Timestamp when session expires
  activeAccountIndex: number;
}

const SESSION_KEY = "caelus_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if we're in a Chrome extension context
 */
function isChromeExtension(): boolean {
  return !!(typeof chrome !== "undefined" && chrome.storage && chrome.storage.session);
}

/**
 * Get session storage (chrome.storage.session or localStorage fallback)
 */
async function getSessionStorage(): Promise<Storage> {
  if (isChromeExtension()) {
    // Use chrome.storage.session for Manifest V3
    return chrome.storage.session as any;
  }
  // Fallback to sessionStorage for web
  return sessionStorage as any;
}

/**
 * Save session data
 */
export async function saveSession(password: string, activeAccountIndex: number = 0): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionData: SessionData = {
    password,
    expiresAt,
    activeAccountIndex,
  };

  if (isChromeExtension()) {
    await chrome.storage.session.set({ [SESSION_KEY]: sessionData });
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
}

/**
 * Get session data if it exists and is valid
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    let sessionData: SessionData | null = null;

    if (isChromeExtension()) {
      const result = await chrome.storage.session.get(SESSION_KEY);
      sessionData = SESSION_KEY in result ? (result[SESSION_KEY] as SessionData) : null;
    } else {
      const stored = sessionStorage.getItem(SESSION_KEY);
      sessionData = stored ? JSON.parse(stored) : null;
    }

    if (!sessionData) return null;

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      await clearSession();
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Clear session data
 */
export async function clearSession(): Promise<void> {
  if (isChromeExtension()) {
    await chrome.storage.session.remove(SESSION_KEY);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Check if a valid session exists
 */
export async function hasValidSession(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

