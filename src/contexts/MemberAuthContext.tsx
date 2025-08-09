import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  mobile_number: string;
  name?: string;
  is_verified: boolean;
}

interface MemberAuthContextType {
  member: TeamMember | null;
  isLoading: boolean;
  sendVerificationCode: (mobileNumber: string) => Promise<{ success: boolean; verificationCode?: string; error?: string }>;
  verifyAndLogin: (mobileNumber: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export const useMemberAuth = () => {
  const context = useContext(MemberAuthContext);
  if (context === undefined) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
};

export const MemberAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if member is already logged in
    const memberData = localStorage.getItem('team_member');
    if (memberData) {
      setMember(JSON.parse(memberData));
    }
    setIsLoading(false);
  }, []);

  const sendVerificationCode = async (mobileNumber: string) => {
    try {
      const { data, error } = await supabase.rpc('send_verification_code', {
        mobile_number_param: mobileNumber
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && typeof data === 'object' && 'success' in data && data.success) {
        return { 
          success: true, 
          verificationCode: typeof data === 'object' && 'verification_code' in data ? String(data.verification_code) : undefined
        };
      }

      return { success: false, error: 'Failed to send verification code' };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const verifyAndLogin = async (mobileNumber: string, verificationCode: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_member_login', {
        mobile_number_param: mobileNumber,
        verification_code_param: verificationCode
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && typeof data === 'object' && 'success' in data && data.success && 'member' in data) {
        const member = data.member as any;
        const memberData: TeamMember = {
          id: member.id,
          mobile_number: member.mobile_number,
          name: member.name,
          is_verified: true
        };

        setMember(memberData);
        localStorage.setItem('team_member', JSON.stringify(memberData));

        return { success: true };
      }

      return { success: false, error: typeof data === 'object' && data && 'error' in data ? String(data.error) : 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem('team_member');
  };

  const isAuthenticated = member !== null;

  return (
    <MemberAuthContext.Provider value={{ 
      member, 
      isLoading, 
      sendVerificationCode, 
      verifyAndLogin, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </MemberAuthContext.Provider>
  );
};