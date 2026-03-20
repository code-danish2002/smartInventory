/**
 * Utility for local form persistence (Auto-Save)
 */

const STORAGE_PREFIX = 'po_form_persistence_';
const EXPIRY_TIME_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Saves form state to localStorage
 */
export const savePOSession = (poId, data) => {
    if (!poId) return;
    try {
        const sessionData = {
            ...data,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`${STORAGE_PREFIX}${poId}`, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Error saving local persistence:', error);
    }
};

/**
 * Loads form state from localStorage
 */
export const loadPOSession = (poId) => {
    if (!poId) return null;
    try {
        const dataStr = localStorage.getItem(`${STORAGE_PREFIX}${poId}`);
        if (!dataStr) return null;

        const data = JSON.parse(dataStr);

        // Check for 12 hours expiry
        if (data.lastSaved) {
            const savedTime = new Date(data.lastSaved).getTime();
            const now = new Date().getTime();
            if (now - savedTime > EXPIRY_TIME_MS) {
                console.log(`Session for PO ${poId} expired. Clearing from local storage.`);
                clearPOSession(poId);
                return null;
            }
        }

        return data;
    } catch (error) {
        console.error('Error loading local persistence:', error);
        return null;
    }
};

/**
 * Clears form state from localStorage
 */
export const clearPOSession = (poId) => {
    if (!poId) return;
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${poId}`);
    } catch (error) {
        console.error('Error clearing local persistence:', error);
    }
};

/**
 * Clears all expired form states from localStorage globally
 */
export const clearAllExpiredPOSessions = () => {
    try {
        const keysToRemove = [];
        const now = new Date().getTime();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
                const dataStr = localStorage.getItem(key);
                if (dataStr) {
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.lastSaved) {
                            const savedTime = new Date(data.lastSaved).getTime();
                            if (now - savedTime > EXPIRY_TIME_MS) {
                                keysToRemove.push(key);
                            }
                        }
                    } catch (e) {
                        // Invalid JSON, mark for removal
                        keysToRemove.push(key);
                    }
                }
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        if (keysToRemove.length > 0) {
            console.log(`Cleared ${keysToRemove.length} expired PO sessions from local storage.`);
        }
    } catch (error) {
        console.error('Error clearing expired sessions:', error);
    }
};
