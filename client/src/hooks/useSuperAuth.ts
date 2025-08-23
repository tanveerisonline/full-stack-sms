import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SuperAdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: SuperAdminUser;
}

export function useSuperAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('super_admin_token');
  });
  const [currentUser, setCurrentUser] = useState<SuperAdminUser | null>(() => {
    const saved = localStorage.getItem('super_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const queryClient = useQueryClient();

  // Set up API request headers with token
  useEffect(() => {
    if (token && currentUser) {
      localStorage.setItem('super_admin_token', token);
      localStorage.setItem('super_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('super_admin_token');
      localStorage.removeItem('super_admin_user');
    }
  }, [token, currentUser]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/super-admin/auth/me'],
    queryFn: async () => {
      if (!token) return null;
      
      try {
        const response = await fetch('/api/super-admin/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setToken(null);
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        return response.json();
      } catch (error) {
        setToken(null);
        throw error;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 0, // Force fresh data
    refetchOnMount: true, // Always refetch when component mounts
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Login success:', data);
      if (data.user.role === 'super_admin') {
        setToken(data.token);
        setCurrentUser(data.user);
        queryClient.setQueryData(['/api/super-admin/auth/me'], data.user);
      } else {
        throw new Error('Super Admin access required');
      }
    },
  });

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    queryClient.clear();
    localStorage.removeItem('super_admin_token');
    localStorage.removeItem('super_admin_user');
  };

  // Use currentUser as the primary source of truth, fallback to query user
  const activeUser = currentUser || user;
  // Include login success state to immediately show as authenticated
  const isAuthenticated = (!!token || loginMutation.isSuccess) && !!activeUser && activeUser.role === 'super_admin';

  return {
    user: activeUser,
    login: loginMutation.mutate,
    logout,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    error: error || loginMutation.error,
    token,
    loginSuccess: loginMutation.isSuccess,
  };
}