import { describe, it, expect } from "vitest";
import { KeyedMutex } from "./keyed-mutex";
import { delayMs } from "../utils/utils";

describe("KeyedMutex", () => {
  it("should lock and unlock a key", async () => {
    const keyedMutex = new KeyedMutex();
    const key = "test-key";

    await keyedMutex.lock(key);
    expect(keyedMutex.isLocked(key)).toBe(true);

    keyedMutex.unlock(key);
    expect(keyedMutex.isLocked(key)).toBe(false);
  });

  it("should allow multiple locks on different keys", async () => {
    const keyedMutex = new KeyedMutex();
    const key1 = "key-1";
    const key2 = "key-2";

    await keyedMutex.lock(key1);
    await keyedMutex.lock(key2);

    expect(keyedMutex.isLocked(key1)).toBe(true);
    expect(keyedMutex.isLocked(key2)).toBe(true);

    keyedMutex.unlock(key1);
    expect(keyedMutex.isLocked(key1)).toBe(false);

    keyedMutex.unlock(key2);
    expect(keyedMutex.isLocked(key2)).toBe(false);
  });

  it("should queue locks on the same key", async () => {
    const keyedMutex = new KeyedMutex();
    const key = "test-key";

    await keyedMutex.lock(key);
    expect(keyedMutex.isLocked(key)).toBe(true);

    let lockAcquired = false;
    const lockPromise = keyedMutex.lock(key).then(() => {
      lockAcquired = true;
    });

    keyedMutex.unlock(key);
    await lockPromise;

    expect(lockAcquired).toBe(true);
    expect(keyedMutex.isLocked(key)).toBe(true);

    keyedMutex.unlock(key);
    expect(keyedMutex.isLocked(key)).toBe(false);
  });

  it("should handle multiple unlocks gracefully", async () => {
    const keyedMutex = new KeyedMutex();
    const key = "test-key";

    await keyedMutex.lock(key);
    expect(keyedMutex.isLocked(key)).toBe(true);

    keyedMutex.unlock(key);
    expect(keyedMutex.isLocked(key)).toBe(false);

    keyedMutex.unlock(key); // Unlocking again should not cause any issues
    expect(keyedMutex.isLocked(key)).toBe(false);
  });

  it("should handle concurrent locks on different keys", async () => {
    const keyedMutex = new KeyedMutex();
    const key1 = "key-1";
    const key2 = "key-2";

    const task1 = async () => {
      await keyedMutex.lock(key1);
      expect(keyedMutex.isLocked(key1)).toBe(true);
      await delayMs(100);
      keyedMutex.unlock(key1);
      expect(keyedMutex.isLocked(key1)).toBe(false);
    };

    const task2 = async () => {
      await keyedMutex.lock(key2);
      expect(keyedMutex.isLocked(key2)).toBe(true);
      await delayMs(100);
      keyedMutex.unlock(key2);
      expect(keyedMutex.isLocked(key2)).toBe(false);
    };

    await Promise.all([task1(), task2()]);
  });
});
