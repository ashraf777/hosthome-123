
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
    id: number;
    name: string;
    email: string;
    role: { id: number; name: string };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const fetchUser = useCallback(async (token: string) => {
        try {
            const response = await api.get('user');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            localStorage.removeItem('access_token');
            setToken(null);
            setUser(null);
            router.replace('/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        const response = await api.post('login', { email, password });
        if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
            setToken(response.access_token);
            setUser(response.user);
        } else {
           throw new Error("Login failed: No access token received.");
        }
    };

    const logout = async () => {
        try {
            await api.post('logout', {});
        } catch (error) {
            console.error("Logout API call failed, logging out client-side.", error);
        } finally {
            localStorage.removeItem('access_token');
            setToken(null);
            setUser(null);
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            router.replace('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
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
