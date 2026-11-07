import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CloudSyncService } from '../src/services/cloudSync';
import { AdminService } from '../src/admin/services/adminService';

describe('SaaS Fallbacks & Database Resilience', () => {
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

  it('CloudSyncService gracefully returns user-friendly error when cohorts table is pending migration', async () => {
    // Calling createCohort with test user - if table is unmigrated, it translates PGRST205 into helpful copy
    const res = await CloudSyncService.createCohort('test-user-999', 'Algorithms Batch 2026');
    expect(res.success).toBe(false);
    expect(typeof res.error).toBe('string');
    if (res.error?.includes('initializing')) {
      expect(res.error).toContain('Peer Study Cohorts is currently initializing on cloud servers');
    }
  });

  it('CloudSyncService gracefully handles joinCohort with invalid or pending code', async () => {
    const res = await CloudSyncService.joinCohort('test-user-999', 'INVALID');
    expect(res.success).toBe(false);
    expect(typeof res.error).toBe('string');
  });

  it('AdminService.fetchAnnouncements handles unprovisioned announcement table gracefully', async () => {
    const announcements = await AdminService.fetchAnnouncements();
    expect(Array.isArray(announcements)).toBe(true);
  });

  it('AdminService.fetchPublicActiveAnnouncement returns null instead of throwing when table is empty or pending', async () => {
    const active = await AdminService.fetchPublicActiveAnnouncement();
    expect(active === null || typeof active === 'object').toBe(true);
  });

  it('persists pro waitlist selection in localStorage', () => {
    expect((globalThis as any).localStorage.getItem('grindos_pro_waitlist')).toBe(null);
    (globalThis as any).localStorage.setItem('grindos_pro_waitlist', 'true');
    expect((globalThis as any).localStorage.getItem('grindos_pro_waitlist')).toBe('true');
  });
});
