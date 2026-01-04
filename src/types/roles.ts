export type AppRole = 
  | 'super_admin'
  | 'system_admin'
  | 'operation'
  | 'initiator'
  | 'approver'
  | 'auditor';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  mobile_number: string | null;
  department: string | null;
  position: string | null;
  is_2fa_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
}

export interface UserWithRoles extends UserProfile {
  roles: AppRole[];
}

// Role display names and descriptions
export const roleConfig: Record<AppRole, { label: string; description: string; category: 'bank' | 'platform' }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access and user management',
    category: 'platform'
  },
  system_admin: {
    label: 'System Admin',
    description: 'Configuration and user management only',
    category: 'platform'
  },
  operation: {
    label: 'Operations',
    description: 'Support team handling bank messages and status monitoring',
    category: 'platform'
  },
  initiator: {
    label: 'Initiator',
    description: 'Creates execution requests and submits for approval',
    category: 'bank'
  },
  approver: {
    label: 'Approver',
    description: 'Reviews and approves/rejects execution requests',
    category: 'bank'
  },
  auditor: {
    label: 'Auditor',
    description: 'Read-only access to transactions, logs, and reports',
    category: 'bank'
  }
};

// Roles that require 2FA
export const rolesRequiring2FA: AppRole[] = ['super_admin', 'system_admin', 'initiator', 'approver'];

// Permission checks
export const canCreateExecutions = (roles: AppRole[]): boolean => 
  roles.includes('initiator') || roles.includes('super_admin');

export const canApproveExecutions = (roles: AppRole[]): boolean => 
  roles.includes('approver') || roles.includes('super_admin');

export const canManageUsers = (roles: AppRole[]): boolean => 
  roles.includes('super_admin');

export const canViewAuditLogs = (roles: AppRole[]): boolean => 
  roles.includes('auditor') || roles.includes('super_admin') || roles.includes('system_admin') || roles.includes('operation');

export const canAccessSettings = (roles: AppRole[]): boolean => 
  roles.includes('super_admin') || roles.includes('system_admin');

export const isAdminRole = (roles: AppRole[]): boolean =>
  roles.includes('super_admin') || roles.includes('system_admin');
