import { createContext, useContext, useState, ReactNode } from 'react';
import { AppRole, UserProfile, rolesRequiring2FA } from '@/types/roles';

// Mock user type for frontend-only
interface MockUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  session: { user: MockUser } | null;
  profile: UserProfile | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; requires2FA?: boolean }>;
  signUp: (email: string, password: string, fullName: string, mobileNumber?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  is2FARequired: boolean;
  is2FAEnabled: boolean;
  verify2FA: (code: string) => Promise<{ error: Error | null }>;
  enroll2FA: () => Promise<{ qrCode: string; secret: string } | null>;
  confirm2FAEnrollment: (code: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_USERS = [
  { 
    email: 'admin@cryptoexec.com', 
    password: 'Admin@123',
    profile: {
      id: '1',
      user_id: '1',
      full_name: 'Super Admin',
      email: 'admin@cryptoexec.com',
      mobile_number: '+971 50 123 4567',
      department: 'Administration',
      position: 'Super Administrator',
      is_2fa_enabled: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['super_admin'] as AppRole[],
  },
  { 
    email: 'initiator@bank.ae', 
    password: 'Initiator@123',
    profile: {
      id: '2',
      user_id: '2',
      full_name: 'John Initiator',
      email: 'initiator@bank.ae',
      mobile_number: '+971 50 234 5678',
      department: 'Operations',
      position: 'Bank Initiator',
      is_2fa_enabled: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['initiator'] as AppRole[],
  },
  { 
    email: 'approver@bank.ae', 
    password: 'Approver@123',
    profile: {
      id: '3',
      user_id: '3',
      full_name: 'Sarah Approver',
      email: 'approver@bank.ae',
      mobile_number: '+971 50 345 6789',
      department: 'Compliance',
      position: 'Bank Approver',
      is_2fa_enabled: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['approver'] as AppRole[],
  },
  { 
    email: 'auditor@bank.ae', 
    password: 'Auditor@123',
    profile: {
      id: '4',
      user_id: '4',
      full_name: 'Mike Auditor',
      email: 'auditor@bank.ae',
      mobile_number: '+971 50 456 7890',
      department: 'Audit',
      position: 'Internal Auditor',
      is_2fa_enabled: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    roles: ['auditor'] as AppRole[],
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<{ user: MockUser } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return { error: new Error('Invalid login credentials') };
    }

    const mockUser: MockUser = { id: foundUser.profile.id, email: foundUser.email };
    
    setUser(mockUser);
    setSession({ user: mockUser });
    setProfile(foundUser.profile as UserProfile);
    setRoles(foundUser.roles);

    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, mobileNumber?: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (DEMO_USERS.find(u => u.email === email)) {
      return { error: new Error('User already registered') };
    }

    // For demo, just simulate successful signup
    return { error: null };
  };

  const signOut = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const verify2FA = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept any 6-digit code for demo
    if (code.length === 6) {
      return { error: null };
    }
    return { error: new Error('Invalid code') };
  };

  const enroll2FA = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock QR code and secret
    return {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      secret: 'JBSWY3DPEHPK3PXP',
    };
  };

  const confirm2FAEnrollment = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (code.length === 6) {
      if (profile) {
        setProfile({ ...profile, is_2fa_enabled: true });
      }
      return { error: null };
    }
    return { error: new Error('Invalid code') };
  };

  const is2FARequired = roles.some(role => rolesRequiring2FA.includes(role));
  const is2FAEnabled = profile?.is_2fa_enabled ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        signIn,
        signUp,
        signOut,
        is2FARequired,
        is2FAEnabled,
        verify2FA,
        enroll2FA,
        confirm2FAEnrollment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
