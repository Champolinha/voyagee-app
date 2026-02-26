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

    const signup = (name, email, password) => {
        const users = getUsers();
        if (users.find((u) => u.email === email)) throw new Error('E-mail já cadastrado.');
        const newUser = {
            id: uuidv4(), name, email, password,
            phone: '', birthdate: '', nationality: '', passport: '',
            preferred_currency: 'BRL',
            emergency_contact_name: '', emergency_contact_phone: '',
        };
        users.push(newUser);
        saveUsers(users);
        const { password: _, ...safe } = newUser;
        setCurrentUser(safe);
        return safe;
    };

    const login = (email, password) => {
        const users = getUsers();
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) throw new Error('E-mail ou senha incorretos.');
        const { password: _, ...safe } = user;
        setCurrentUser(safe);
        return safe;
    };

    const updateProfile = (updates) => {
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx === -1) return;
        users[idx] = { ...users[idx], ...updates };
        saveUsers(users);
        const { password: _, ...safe } = users[idx];
        setCurrentUser(safe);
    };

    const changePassword = (currentPassword, newPassword) => {
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx === -1) throw new Error('Usuário não encontrado.');
        if (users[idx].password !== currentPassword) throw new Error('Senha atual incorreta.');
        users[idx].password = newPassword;
        saveUsers(users);
    };

    const logout = () => setCurrentUser(null);

    return (
        <AuthContext.Provider value={{ currentUser, signup, login, logout, updateProfile, changePassword, isAuthenticated: !!currentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
