import React, { useState, useEffect } from 'react';
import CharacterList from './CharacterList';
import CharacterSheet from './CharacterSheet';
import styles from './Characters.module.css';
import SidebarToggle from '../../components/ui/SidebarToggle';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Characters = () => {
    const { currentUser } = useAuth();
    const [characters, setCharacters] = useState([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setCharacters([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, "users", currentUser.uid, "characters"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chars = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCharacters(chars);
            setLoading(false);

            // If selected character was deleted, deselect
            if (selectedCharacterId && !chars.find(c => c.id === selectedCharacterId)) {
                setSelectedCharacterId(null);
            }
        }, (error) => {
            console.error("Error fetching characters:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, selectedCharacterId]);

    const activeCharacter = characters.find(c => c.id === selectedCharacterId);

    const handleSelectCharacter = (id) => {
        setSelectedCharacterId(id);
        setIsSidebarOpen(false); // Close sidebar on selection on mobile
    };

    const handleCreateNew = async () => {
        if (!currentUser) return;

        const newChar = {
            name: "Új Karakter",
            race: "Ember",
            class: "Harcos",
            level: 1,
            stats: { ero: 10, ugy: 10, gyo: 10, kit: 10, egs: 10, szep: 10, int: 10, aka: 10, asz: 10 },
            combat: { te: 0, ve: 0, ke: 0, ce: 0, hmPerLevel: 0 },
            resources: {
                ep: { current: 10, max: 10 },
                fp: { current: 10, max: 10, perLevel: 0 },
                mp: { current: 0, max: 0, perLevel: 0 },
                psi: { current: 0, max: 0, perLevel: 0 }
            },
            skills: [],
            equipment: [],
            armours: [],
            money: { gold: 0, silver: 0, copper: 0 },
            skillPoints: { perLevel: 0, current: 0 },
            createdAt: new Date().toISOString()
        };

        try {
            const docRef = await addDoc(collection(db, "users", currentUser.uid, "characters"), newChar);
            setSelectedCharacterId(docRef.id);
            setIsSidebarOpen(false);
        } catch (error) {
            console.error("Error creating character:", error);
        }
    };

    const handleUpdateCharacter = async (updatedChar) => {
        if (!currentUser) return;
        try {
            const charRef = doc(db, "users", currentUser.uid, "characters", updatedChar.id);
            // Destructure id out, we don't save it in the doc data usually, or we can keep it. 
            // Firestore doesn't like 'id' in the body if we are strict, but here it's fine.
            // Better to exclude ID from the update payload to avoid redundancy if strictly following NoSQL patterns, 
            // but for simplicity we just update the fields.
            const { id, ...dataToUpdate } = updatedChar;
            await updateDoc(charRef, dataToUpdate);
        } catch (error) {
            console.error("Error updating character:", error);
        }
    };

    const handleDeleteCharacter = async (id) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "characters", id));
            if (selectedCharacterId === id) setSelectedCharacterId(null);
        } catch (error) {
            console.error("Error deleting character:", error);
        }
    };

    if (!currentUser) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h1>Jelentkezz be!</h1>
                    <p>Karaktereid megtekintéséhez és létrehozásához be kell jelentkezned.</p>
                    <Link to="/login" className={styles.loginLink}>Bejelentkezés</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className={styles.loading}>Betöltés...</div>;
    }

    return (
        <div className={styles.container}>
            {/* Sidebar Toggle for Mobile */}
            <SidebarToggle
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <CharacterList
                characters={characters}
                activeId={selectedCharacterId}
                onSelect={handleSelectCharacter}
                onCreate={handleCreateNew}
                className={isSidebarOpen ? styles.sidebarOpen : ''}
            />

            <div className={styles.mainContent}>
                {activeCharacter ? (
                    <CharacterSheet
                        character={activeCharacter}
                        onUpdate={handleUpdateCharacter}
                        onDelete={() => handleDeleteCharacter(selectedCharacterId)}
                    />
                ) : (
                    <div className={styles.emptyState}>
                        <h1>Válassz egy karaktert</h1>
                        <p>vagy hozz létre újat a menüben.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Characters;
