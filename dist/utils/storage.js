export function loadStoredArray(key, guard) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter(guard);
    }
    catch (error) {
        console.warn(`Failed to read ${key} from storage.`, error);
        return [];
    }
}
export function saveStoredArray(key, values) {
    try {
        localStorage.setItem(key, JSON.stringify(values));
    }
    catch (error) {
        console.warn(`Failed to save ${key} to storage.`, error);
    }
}
