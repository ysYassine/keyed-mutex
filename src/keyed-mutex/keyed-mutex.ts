import { Mutex } from "../mutex/mutex";

export class KeyedMutex {
  #mutexMap = new Map<string, Mutex>();
  #unregisterCleaner?: () => void;

  constructor(params?: { registerCleaner: boolean }) {
    if (params?.registerCleaner) {
      this.registerCleaner();
    }
  }

  isLocked(key: string): boolean {
    return this.#mutexMap.get(key)?.isLocked ?? false;
  }

  async lock(key: string): Promise<void> {
    let mutex = this.#mutexMap.get(key);
    if (!mutex) {
      mutex = new Mutex();
      this.#mutexMap.set(key, mutex);
    }
    await mutex.lock();
  }

  unlock(key: string): void {
    this.#mutexMap.get(key)?.unlock();
  }

  /**
   * Register a cleaner to remove unlocked mutexes from the map.
   * This is useful to prevent memory saturation.
   * Cannot register multiple cleaners. If called multiple times, only the first call will be effective.
   */
  registerCleaner(): void {
    if (this.#unregisterCleaner) {
      return;
    }

    const intervalMs = 10_000;
    const interval = setInterval(() => {
      for (const [key, mutex] of this.#mutexMap) {
        if (!mutex.isLocked) {
          this.#mutexMap.delete(key);
        }
      }
    }, intervalMs);

    this.#unregisterCleaner = () => clearInterval(interval);
  }

  /**
   * Unregister the cleaner.
   */
  unregisterCleaner(): void {
    this.#unregisterCleaner?.();
  }
}
