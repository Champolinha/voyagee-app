import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const DataContext = createContext();

function migrateData(data) {
    const trips = (data.trips || []).map((t) => {
        if (!t.destinations) {
            return {
                ...t,
                name: t.destination || t.name || 'Minha Viagem',
                destinations: t.destination
                    ? [{ id: uuidv4(), name: t.destination, arrival_date: t.start_date, departure_date: t.end_date }]
                    : [],
                budget: t.budget || 0,
            };
        }
        return { ...t, budget: t.budget || 0 };
    });
    return { ...data, trips, itineraryItems: data.itineraryItems || [], expenses: data.expenses || [] };
}

function loadData(userId) {
    const raw = localStorage.getItem(`voyagee-data-${userId}`);
    if (raw) return migrateData(JSON.parse(raw));
    return { trips: [], itineraryItems: [], expenses: [] };
}

function saveData(userId, data) {
    localStorage.setItem(`voyagee-data-${userId}`, JSON.stringify(data));
}

export function DataProvider({ children }) {
    const { currentUser } = useAuth();
    const [data, setData] = useState({ trips: [], itineraryItems: [], expenses: [] });

    useEffect(() => {
        if (currentUser) setData(loadData(currentUser.id));
        else setData({ trips: [], itineraryItems: [], expenses: [] });
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) saveData(currentUser.id, data);
    }, [data, currentUser]);

    // TRIP CRUD
    const addTrip = (trip) => {
        const newTrip = {
            id: uuidv4(),
            name: trip.name,
            start_date: trip.start_date,
            end_date: trip.end_date,
            destinations: trip.destinations || [],
            budget: trip.budget || 0,
            essential_notes: '',
        };
        setData((p) => ({ ...p, trips: [...p.trips, newTrip] }));
        return newTrip;
    };

    const updateTrip = (tripId, updates) => {
        setData((p) => ({ ...p, trips: p.trips.map((t) => (t.id === tripId ? { ...t, ...updates } : t)) }));
    };

    const deleteTrip = (tripId) => {
        setData((p) => ({
            trips: p.trips.filter((t) => t.id !== tripId),
            itineraryItems: p.itineraryItems.filter((i) => i.trip_id !== tripId),
            expenses: p.expenses.filter((e) => e.trip_id !== tripId),
        }));
    };

    const getTrip = (tripId) => data.trips.find((t) => t.id === tripId);

    // DESTINATION CRUD
    const addDestination = (tripId, dest) => {
        const newDest = { id: uuidv4(), ...dest };
        setData((p) => ({
            ...p,
            trips: p.trips.map((t) =>
                t.id === tripId ? { ...t, destinations: [...(t.destinations || []), newDest] } : t
            ),
        }));
        return newDest;
    };

    const removeDestination = (tripId, destId) => {
        setData((p) => ({
            ...p,
            trips: p.trips.map((t) =>
                t.id === tripId ? { ...t, destinations: (t.destinations || []).filter((d) => d.id !== destId) } : t
            ),
        }));
    };

    // ITINERARY CRUD
    const addItineraryItem = (item) => {
        const newItem = { id: uuidv4(), ...item };
        setData((p) => ({ ...p, itineraryItems: [...p.itineraryItems, newItem] }));
        return newItem;
    };

    const updateItineraryItem = (itemId, updates) => {
        setData((p) => ({
            ...p,
            itineraryItems: p.itineraryItems.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
        }));
    };

    const deleteItineraryItem = (itemId) => {
        setData((p) => ({ ...p, itineraryItems: p.itineraryItems.filter((i) => i.id !== itemId) }));
    };

    const getTripItinerary = (tripId) =>
        data.itineraryItems
            .filter((i) => i.trip_id === tripId)
            .sort((a, b) => (a.day_date !== b.day_date ? a.day_date.localeCompare(b.day_date) : (a.time || '').localeCompare(b.time || '')));

    // EXPENSE CRUD
    const addExpense = (expense) => {
        const newExp = { id: uuidv4(), ...expense };
        setData((p) => ({ ...p, expenses: [...p.expenses, newExp] }));
        return newExp;
    };

    const deleteExpense = (expenseId) => {
        setData((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== expenseId) }));
    };

    const getTripExpenses = (tripId) => data.expenses.filter((e) => e.trip_id === tripId);

    const getTripTotalBRL = (tripId) =>
        data.expenses.filter((e) => e.trip_id === tripId).reduce((s, e) => s + (Number(e.converted_amount_BRL) || 0), 0);

    return (
        <DataContext.Provider value={{
            trips: data.trips, addTrip, updateTrip, deleteTrip, getTrip,
            addDestination, removeDestination,
            addItineraryItem, updateItineraryItem, deleteItineraryItem, getTripItinerary,
            addExpense, deleteExpense, getTripExpenses, getTripTotalBRL,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within DataProvider');
    return ctx;
}
