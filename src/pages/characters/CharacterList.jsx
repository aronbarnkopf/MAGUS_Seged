import React from 'react';
import { User, Plus } from 'lucide-react';
import styles from './Characters.module.css';

const CharacterList = ({ characters, activeId, onSelect, onCreate, className }) => {
    return (
        <div className={`${styles.sidebar} ${className || ''}`}>
            <div className={styles.actionArea}>
                <button className={styles.createButton} onClick={onCreate}>
                    <Plus size={20} /> Új Karakter
                </button>
            </div>

            <div className={styles.list}>
                {characters.map(char => (
                    <div
                        key={char.id}
                        className={`${styles.charItem} ${activeId === char.id ? styles.active : ''}`}
                        onClick={() => onSelect(char.id)}
                    >
                        <div className={styles.avatar}>
                            <User size={24} />
                        </div>
                        <div className={styles.charInfo}>
                            <span className={styles.charName}>{char.name}</span>
                            <span className={styles.charMeta}>{char.race} {char.class} - Szint {char.level}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharacterList;
