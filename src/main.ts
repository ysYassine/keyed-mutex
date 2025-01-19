import { KeyedMutex } from "./keyed-mutex/keyed-mutex";
import { delayMs } from "./utils/utils";

const keyedMutex = new KeyedMutex();

const key1 = "key-1";
const key2 = "key-2";

async function taskA() {
  await keyedMutex.lock(key1);
  console.log(`"${key1}" locked by task A`);
  await delayMs(2000);
  keyedMutex.unlock(key1);
  console.log(`"${key1}" unlocked by task A`);
}

async function taskB() {
  await keyedMutex.lock(key1);
  console.log(`"${key1}" locked by task B`);
  await delayMs(3000);
  keyedMutex.unlock(key1);
  console.log(`"${key1}" unlocked by task B`);
}

async function taskC() {
  await keyedMutex.lock(key2);
  console.log(`"${key2}" locked by task C`);
  await delayMs(6000);
  keyedMutex.unlock(key2);
  console.log(`"${key2}" unlocked by task C`);
}

async function demoKeyedMutex() {
  taskA();
  await delayMs(10);
  taskB();
  taskC();
}

demoKeyedMutex();
