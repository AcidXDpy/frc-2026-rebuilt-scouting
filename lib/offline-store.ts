"use client";

import { matchEntries as seededMatchEntries, pitEntries as seededPitEntries } from "@/lib/sample-data";
import type { MatchScoutEntry, PitScoutEntry } from "@/lib/types";

const MATCH_KEY = "rebuilt.matchEntries";
const PIT_KEY = "rebuilt.pitEntries";
const DB_NAME = "rebuilt-scouting";
const STORE_NAME = "outbox";

export function getMatchEntries(): MatchScoutEntry[] {
  return readLocal(MATCH_KEY, seededMatchEntries);
}

export function saveMatchEntry(entry: MatchScoutEntry) {
  const entries = getMatchEntries();
  const next = [entry, ...entries.filter((candidate) => candidate.id !== entry.id)];
  localStorage.setItem(MATCH_KEY, JSON.stringify(next));
  void queueForSync("match", entry);
}

export function getPitEntries(): PitScoutEntry[] {
  return readLocal(PIT_KEY, seededPitEntries);
}

export function savePitEntry(entry: PitScoutEntry) {
  const entries = getPitEntries();
  const next = [entry, ...entries.filter((candidate) => candidate.id !== entry.id)];
  localStorage.setItem(PIT_KEY, JSON.stringify(next));
  void queueForSync("pit", entry);
}

export async function getQueuedSyncCount() {
  const db = await openDb();
  return new Promise<number>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(0);
  });
}

export async function flushSyncQueue() {
  const db = await openDb();
  return new Promise<number>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      const count = countRequest.result;
      store.clear();
      resolve(count);
    };
    countRequest.onerror = () => resolve(0);
  });
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : fallback;
}

async function queueForSync(kind: "match" | "pit", payload: MatchScoutEntry | PitScoutEntry) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put({ id: `${kind}-${payload.id}`, kind, payload, queuedAt: new Date().toISOString() });
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
