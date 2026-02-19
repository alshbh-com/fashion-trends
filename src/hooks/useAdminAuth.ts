import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TOKEN_KEY = 'family-trend-admin-token';

const generateToken = () => crypto.randomUUID() + '-' + Date.now();

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('system_passwords')
      .select('password')
      .eq('id', 'admin_password')
      .single();
    
    if (error || !data) return false;
    if (data.password === password) {
      const token = generateToken();
      sessionStorage.setItem(TOKEN_KEY, token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, logout };
};
