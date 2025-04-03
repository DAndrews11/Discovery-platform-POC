import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Set default Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const { token, username: userUsername } = response.data;
            
            setToken(token);
            setUser({ username: userUsername });
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ username: userUsername }));
            
            // Set default Authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    };

    const register = async (username: string, password: string) => {
        try {
            await axios.post('/api/auth/register', { username, password });
            // After successful registration, log the user in
            await login(username, password);
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Remove Authorization header
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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