# Keyed Mutex

This project provides a simple implementation of a `Mutex` and a `KeyedMutex` in TypeScript. While it may not be common to use a mutex in Node.js due to its single-threaded nature, there are scenarios where it becomes necessary, especially when working with I/O operations such as accessing databases, file systems, or other shared resources.

## Use cases

### Mutex

A `Mutex` can be useful in scenarios where you need to ensure that only one operation is performed at a time. For example:

- Accessing a shared resource like a file or a database.
- Ensuring that a critical section of code is executed by only one part of your application at a time.

### Keyed Mutex

A `KeyedMutex` extends the concept of a `Mutex` by allowing you to lock and unlock based on a key. This can be useful in scenarios where you need to ensure that operations on specific keys are performed sequentially. For example:

- Ensuring that operations on a specific ressource are performed one at a time.
- Managing concurrent access to different parts of a shared resource based on keys.

## Why not use external libraries?

For simple use cases like these, I prefer not to use external libraries. Implementing a `Mutex` and a `KeyedMutex` is straightforward and allows for better control and understanding of the code. Additionally, I enjoy having fun implementing things on my spare time 😊

## Implementation details

### Mutex

```ts
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
```

### KeyedMutex

```ts
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
```
