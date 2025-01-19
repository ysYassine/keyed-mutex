import { Mutex } from "../mutex/mutex";

export class KeyedMutex {
  #mutexMap = new Map<string, Mutex>();

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
}
