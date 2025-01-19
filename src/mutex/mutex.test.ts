import { describe, it, expect } from "vitest";
import { Mutex } from "./mutex";

describe("Mutex", () => {
  it("should lock and unlock", async () => {
    const mutex = new Mutex();

    await mutex.lock();
    expect(mutex.isLocked).toBe(true);

    mutex.unlock();
    expect(mutex.isLocked).toBe(false);
  });

  it("should queue locks", async () => {
    const mutex = new Mutex();
    let lock1Acquired = false;
    let lock2Acquired = false;

    const lock1 = mutex.lock().then(() => {
      lock1Acquired = true;
    });

    const lock2 = mutex.lock().then(() => {
      lock2Acquired = true;
    });

    expect(mutex.isLocked).toBe(true);
    expect(lock1Acquired).toBe(false);
    expect(lock2Acquired).toBe(false);

    mutex.unlock();
    await lock1;
    expect(lock1Acquired).toBe(true);
    expect(mutex.isLocked).toBe(true);

    mutex.unlock();
    await lock2;
    expect(lock2Acquired).toBe(true);
    expect(mutex.isLocked).toBe(false);
  });

  it("should handle multiple unlocks gracefully", async () => {
    const mutex = new Mutex();

    await mutex.lock();
    expect(mutex.isLocked).toBe(true);

    mutex.unlock();
    expect(mutex.isLocked).toBe(false);

    mutex.unlock(); // Unlocking again should not cause any issues
    expect(mutex.isLocked).toBe(false);
  });
});
