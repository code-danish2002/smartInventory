export const saveAsDraft = async (key, data = {}) => {
    try {
        // 1. Immediate Local Cache
        // We stringify the data because localStorage only stores strings
        localStorage.setItem(`draft_${key}`, JSON.stringify({
            content: data,
            updatedAt: new Date().toISOString()
        }));

        console.log("Local draft saved.");

        // 2. Database Persistence
        // Using a try-catch for the API call ensures that if the server is down,
        // the local save still succeeded.
        const response = await fetch('/api/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, data }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        return { success: true, local: true, remote: true, result };

    } catch (error) {
        console.error("Database save failed, but local draft is preserved:", error);
        return { success: false, local: true, remote: false, error };
    }
}