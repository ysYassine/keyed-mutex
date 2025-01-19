export class Mutex {
  #isLocked = false;
  get isLocked(): boolean {
    return this.#isLocked;
  }

  #waitingList: Array<() => void> = [];

  lock(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.#isLocked) {
        this.#isLocked = true;
        resolve();
        return;
      }

      this.#waitingList.push(resolve);
    });
  }

  unlock(): void {
    if (this.#waitingList.length) {
      const resolve = this.#waitingList.shift()!;
      resolve();
      return;
    }

    this.#isLocked = false;
  }
}
