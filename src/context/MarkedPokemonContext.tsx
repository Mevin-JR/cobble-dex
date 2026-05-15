import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

interface MarkedPokemonContextType {
    markedSet: Set<string>;
    toggleMark: (id: string) => void;
}

const MarkedPokemonContext = createContext<MarkedPokemonContextType>({} as MarkedPokemonContextType);

export function useMarkedPokemon() {
    return useContext(MarkedPokemonContext);
}

const LOCAL_STORAGE_KEY = "marked_pokemon";

export function MarkedPokemonProvider({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const [markedSet, setMarkedSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (loading) return;

        let unsubscribe: () => void;

        const syncData = async () => {
            if (user) {
                // User is authenticated
                const userDocRef = doc(db, "users", user.uid);
                
                // 1. Check local storage for guest data to migrate
                const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                let localSet = new Set<string>();
                if (localData) {
                    try {
                        localSet = new Set(JSON.parse(localData));
                    } catch (e) {
                        console.error("Failed to parse local storage", e);
                    }
                }

                // 2. Fetch or create Firestore document
                const docSnap = await getDoc(userDocRef);
                let firestoreSet = new Set<string>();
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    firestoreSet = new Set(data.markedPokemon || []);
                } else {
                    await setDoc(userDocRef, { markedPokemon: [] });
                }

                // 3. Migrate local data if exists
                if (localSet.size > 0) {
                    const mergedSet = new Set([...firestoreSet, ...localSet]);
                    await updateDoc(userDocRef, {
                        markedPokemon: Array.from(mergedSet)
                    });
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }

                // 4. Listen to Firestore changes
                unsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setMarkedSet(new Set(snapshot.data().markedPokemon || []));
                    }
                });

            } else {
                // Guest mode
                const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (localData) {
                    try {
                        setMarkedSet(new Set(JSON.parse(localData)));
                    } catch (e) {
                        console.error("Failed to parse local storage", e);
                        setMarkedSet(new Set());
                    }
                } else {
                    setMarkedSet(new Set());
                }
            }
        };

        syncData();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, loading]);

    const toggleMark = async (id: string) => {
        const newSet = new Set(markedSet);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }

        if (user) {
            // Optimistic UI update
            setMarkedSet(newSet);
            // Firestore sync
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                markedPokemon: Array.from(newSet)
            });
        } else {
            // Local storage sync
            setMarkedSet(newSet);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
        }
    };

    return (
        <MarkedPokemonContext.Provider value={{ markedSet, toggleMark }}>
            {children}
        </MarkedPokemonContext.Provider>
    );
}
