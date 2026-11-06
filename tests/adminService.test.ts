import { describe, it, expect } from 'vitest';
import { AdminService } from '../src/admin/services/adminService';
import type { AuthUser } from '../src/services/authService';

describe('AdminService & Security Guarding', () => {
  it('denies admin access to null or anonymous users', async () => {
    expect(await AdminService.checkIsAdmin(null)).toBe(false);

    const anonUser: AuthUser = {
      id: 'anon-123',
      email: '',
      displayName: 'Guest',
      isAnonymous: true,
      provider: 'local',
    };
    expect(await AdminService.checkIsAdmin(anonUser)).toBe(false);
  });

  it('denies admin access to normal candidate accounts', async () => {
    const normalUser: AuthUser = {
      id: 'usr-456',
      email: 'student@university.edu',
      displayName: 'Alex Candidate',
      isAnonymous: false,
      provider: 'supabase',
    };
    expect(await AdminService.checkIsAdmin(normalUser)).toBe(false);
  });

  it('grants admin access to whitelisted founder emails', async () => {
    const adminUser: AuthUser = {
      id: 'admin-001',
      email: 'admin@grindos.dev',
      displayName: 'Superadmin',
      isAnonymous: false,
      provider: 'supabase',
    };
    expect(await AdminService.checkIsAdmin(adminUser)).toBe(true);

    const founderUser: AuthUser = {
      id: 'founder-002',
      email: 'devantaris@gmail.com',
      displayName: 'Founder',
      isAnonymous: false,
      provider: 'supabase',
    };
    expect(await AdminService.checkIsAdmin(founderUser)).toBe(true);
  });
});
