export function loadStoredArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(guard);
  } catch (error) {
    console.warn(`Failed to read ${key} from storage.`, error);
    return [];
  }
}

export function saveStoredArray<T>(key: string, values: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch (error) {
    console.warn(`Failed to save ${key} to storage.`, error);
  }
}
