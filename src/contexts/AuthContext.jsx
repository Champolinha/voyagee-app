import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

function getUsers() {
    return JSON.parse(localStorage.getItem('voyagee-users') || '[]');
}
function saveUsers(users) {
    localStorage.setItem('voyagee-users', JSON.stringify(users));
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('voyagee-current-user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('voyagee-current-user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('voyagee-current-user');
        }
    }, [currentUser]);

    const signup = (name, email) => {
        const users = getUsers();
        let user = users.find((u) => u.email === email);

        if (user) {
            // If user already exists locally, just log them in
            setCurrentUser(user);
            return user;
        }

        const newUser = {
            id: uuidv4(),
            name,
            email,
            phone: '',
            birthdate: '',
            nationality: '',
            passport: '',
            preferred_currency: 'BRL',
            emergency_contact_name: '',
            emergency_contact_phone: '',
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        return newUser;
    };

    const updateProfile = (updates) => {
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx === -1) return;
        users[idx] = { ...users[idx], ...updates };
        saveUsers(users);
        setCurrentUser(users[idx]);
    };

    const logout = () => setCurrentUser(null);

    return (
        <AuthContext.Provider value={{ currentUser, signup, logout, updateProfile, isAuthenticated: !!currentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
