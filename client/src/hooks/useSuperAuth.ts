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
  
  const queryClient = useQueryClient();

  // Set up API request headers with token
  useEffect(() => {
    if (token) {
      // Set default authorization header for all API requests
      localStorage.setItem('super_admin_token', token);
    } else {
      localStorage.removeItem('super_admin_token');
    }
  }, [token]);

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
      if (data.user.role === 'super_admin') {
        setToken(data.token);
        queryClient.setQueryData(['/api/super-admin/auth/me'], data.user);
      } else {
        throw new Error('Super Admin access required');
      }
    },
  });

  const logout = () => {
    setToken(null);
    queryClient.clear();
    localStorage.removeItem('super_admin_token');
  };

  const isAuthenticated = !!token && !!user && user.role === 'super_admin';

  return {
    user,
    login: loginMutation.mutate,
    logout,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    error: error || loginMutation.error,
    token,
  };
}