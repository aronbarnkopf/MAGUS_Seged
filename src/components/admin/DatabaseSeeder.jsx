import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import styles from './DatabaseSeeder.module.css';

const DatabaseSeeder = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [spellsFile, setSpellsFile] = useState(null);
    const [rulesFile, setRulesFile] = useState(null);

    // Access Control
    if (!currentUser || currentUser.email !== 'antigravity.login.001@gmail.com') {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h2 style={{ color: 'red' }}>Hozzáférés megtagadva</h2>
                    <p>Ez az oldal csak adminisztrátorok számára érhető el.</p>
                    <p>Jelenlegi felhasználó: {currentUser ? currentUser.email : 'Nincs bejelentkezve'}</p>
                </div>
            </div>
        );
    }

    const handleFileChange = (e, setFile) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('');
        }
    };

    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    resolve(json);
                } catch (err) {
                    reject(new Error('Érvénytelen JSON formátum'));
                }
            };
            reader.onerror = () => reject(new Error('Hiba a fájl olvasásakor'));
            reader.readAsText(file);
        });
    };

    const uploadData = async (file, collectionName, idField, validateFn) => {
        if (!file) {
            setStatus(`Kérlek válassz ki egy fájlt a(z) ${collectionName} feltöltéséhez!`);
            return;
        }

        setLoading(true);
        setStatus('Fájl feldolgozása...');

        try {
            const data = await readFile(file);

            // Validation
            if (!Array.isArray(data)) throw new Error('A JSON fájlnak tömböt kell tartalmaznia.');
            if (data.length === 0) throw new Error('A JSON fájl üres.');
            validateFn(data[0]);

            setStatus(`Feltöltés indítása (${data.length} elem)...`);

            // Chunking for batch writes (max 500 operations per batch)
            const chunkSize = 500;
            const chunks = [];
            for (let i = 0; i < data.length; i += chunkSize) {
                chunks.push(data.slice(i, i + chunkSize));
            }

            let processedCount = 0;
            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(item => {
                    const docId = item[idField] || item.id || item.Id; // Fallback to common ID fields
                    if (!docId) throw new Error(`Hiányzó azonosító (${idField}) ennél az elemnél: ${JSON.stringify(item).substring(0, 50)}...`);

                    const docRef = doc(db, collectionName, String(docId));
                    batch.set(docRef, item);
                });
                await batch.commit();
                processedCount += chunk.length;
                setStatus(`Feltöltve: ${processedCount} / ${data.length}`);
            }

            setStatus(`${collectionName} sikeresen frissítve!`);

        } catch (error) {
            console.error(error);
            setStatus(`Hiba: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const seedSpells = () => {
        uploadData(spellsFile, 'spells', 'Id', (sample) => {
            if (!sample.Name || !sample.Type) {
                throw new Error('A varázslatoknak tartalmazniuk kell "Name" és "Type" mezőket.');
            }
        });
    };

    const seedRules = () => {
        uploadData(rulesFile, 'rules', 'id', (sample) => {
            if (!sample.title) {
                throw new Error('A szabályoknak tartalmazniuk kell "title" mezőt.');
            }
        });
    };

    return (
        <div className={styles.container}>
            <h2>Adminisztráció</h2>
            <p>Adatbázis frissítése JSON fájlokból. Csak <code>antigravity.login.001@gmail.com</code> jogosultsággal.</p>

            <div className={styles.section}>
                <h3>Varázslatok (spells)</h3>
                <div className={styles.inputGroup}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={(e) => handleFileChange(e, setSpellsFile)}
                        disabled={loading}
                    />
                    <button
                        onClick={seedSpells}
                        disabled={loading || !spellsFile}
                        className={styles.button}
                    >
                        {loading ? 'Feltöltés...' : 'Varázslatok Feltöltése'}
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Szabálykönyv (rules)</h3>
                <div className={styles.inputGroup}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={(e) => handleFileChange(e, setRulesFile)}
                        disabled={loading}
                    />
                    <button
                        onClick={seedRules}
                        disabled={loading || !rulesFile}
                        className={styles.button}
                    >
                        {loading ? 'Feltöltés...' : 'Szabályok Feltöltése'}
                    </button>
                </div>
            </div>

            {status && (
                <div className={`${styles.status} ${status.startsWith('Hiba') ? styles.error : styles.success}`}>
                    {status}
                </div>
            )}
        </div>
    );
};

export default DatabaseSeeder;
