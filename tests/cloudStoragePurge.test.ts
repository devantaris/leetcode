import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { migrateLegacyStorageKeys, STORAGE_KEYS } from '../src/config/storageKeys';
import { AuthService } from '../src/services/authService';

describe('Cloud-Only Storage Architecture & Key Purging', () => {
  let store: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  beforeEach(() => {
    store = {};
    (globalThis as any).localStorage = mockLocalStorage;
    (globalThis as any).window = {
      localStorage: mockLocalStorage,
      location: { origin: 'http://localhost:5173' },
    };
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
    delete (globalThis as any).window;
  });

  it('purges all local progress and solve history keys on migrateLegacyStorageKeys', () => {
    mockLocalStorage.setItem(STORAGE_KEYS.progress, JSON.stringify({ p1: true, p2: true }));
    mockLocalStorage.setItem(STORAGE_KEYS.solveHistory, JSON.stringify({ p1: '2026-11-06T12:00:00Z' }));
    mockLocalStorage.setItem(STORAGE_KEYS.streak, '14');
    mockLocalStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify({ name: 'Old User' }));
    mockLocalStorage.setItem(STORAGE_KEYS.placements, JSON.stringify([{ id: '1', company: 'Google' }]));
    mockLocalStorage.setItem(STORAGE_KEYS.problemNotes, JSON.stringify({ p1: 'note' }));
    mockLocalStorage.setItem(STORAGE_KEYS.flaggedProblems, JSON.stringify({ p1: true }));
    mockLocalStorage.setItem('dsa_progress_v2', '{"legacy": true}');

    // UI preference should be kept
    mockLocalStorage.setItem(STORAGE_KEYS.soundEnabled, 'true');

    migrateLegacyStorageKeys();

    // Verify all progress keys were purged
    expect(mockLocalStorage.getItem(STORAGE_KEYS.progress)).toBeNull();
    expect(mockLocalStorage.getItem(STORAGE_KEYS.solveHistory)).toBeNull();
    expect(mockLocalStorage.getItem(STORAGE_KEYS.streak)).toBeNull();
    expect(mockLocalStorage.getItem(STORAGE_KEYS.userProfile)).toBeNull();
    expect(mockLocalStorage.getItem(STORAGE_KEYS.placements)).toBeNull();
    expect(mockLocalStorage.getItem(STORAGE_KEYS.problemNotes)).toBeNull();
    expect(mockLocalStorage.getItem(STORAGE_KEYS.flaggedProblems)).toBeNull();
    expect(mockLocalStorage.getItem('dsa_progress_v2')).toBeNull();

    // Verify UI preferences are intact
    expect(mockLocalStorage.getItem(STORAGE_KEYS.soundEnabled)).toBe('true');
  });

  it('signOut clears cached auth session in localStorage', async () => {
    mockLocalStorage.setItem('grindos_auth_user', JSON.stringify({ id: 'test-user', email: 'test@example.com' }));

    await AuthService.signOut();

    expect(mockLocalStorage.getItem('grindos_auth_user')).toBeNull();
    expect(AuthService.getUser()).toBeNull();
  });
});
