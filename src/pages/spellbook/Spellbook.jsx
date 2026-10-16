import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Flame, Sparkles, Brain, Activity, Music, Skull, Droplets } from 'lucide-react';
import styles from './Spellbook.module.css';
import SidebarToggle from '../../components/ui/SidebarToggle';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Spellbook = () => {
    const [spellsData, setSpellsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpell, setSelectedSpell] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Advanced Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        subtype: '',
        minMp: '',
        maxMp: ''
    });

    useEffect(() => {
        const fetchSpells = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "spells"));
                const spells = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSpellsData(spells);
                if (spells.length > 0) {
                    setSelectedSpell(spells[0]);
                }
            } catch (error) {
                console.error("Error fetching spells:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpells();
    }, []);

    // Extract unique values for metadata
    const spellTypes = useMemo(() => [...new Set(spellsData.map(s => s.Type || s.type).filter(Boolean))], [spellsData]);
    const spellSubtypes = useMemo(() => {
        let spells = spellsData;
        if (filters.type) {
            spells = spells.filter(s => (s.Type || s.type) === filters.type);
        }
        return [...new Set(spells.map(s => s.Subtype || s.subtype).filter(Boolean))];
    }, [spellsData, filters.type]);

    const filteredSpells = useMemo(() => {
        return spellsData.filter(spell => {
            const name = spell.Name || spell.name || "";
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

            const type = spell.Type || spell.type;
            const subtype = spell.Subtype || spell.subtype;

            const matchesType = filters.type ? type === filters.type : true;
            const matchesSubtype = filters.subtype ? subtype === filters.subtype : true;

            const mp = spell.Mp || spell.mp || 0;
            const minMp = filters.minMp ? parseInt(filters.minMp) : 0;
            const maxMp = filters.maxMp ? parseInt(filters.maxMp) : 999;
            const matchesMp = mp >= minMp && mp <= maxMp;

            return matchesSearch && matchesType && matchesSubtype && matchesMp;
        });
    }, [searchTerm, filters, spellsData]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: '', subtype: '', minMp: '', maxMp: '' });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Tűzmágia': return '#ff4500'; // OrangeRed
            case 'Magasmágia': return '#4169e1'; // RoyalBlue
            case 'Pszi': return '#20b2aa'; // LightSeaGreen
            case 'Papi mágia': return '#ffd700'; // Gold
            case 'Boszorkány': return '#9370db'; // MediumPurple
            case 'Bárdmágia': return '#ff7f50'; // Coral
            default: return 'var(--color-accent)';
        }
    };

    const handleSpellClick = (spell) => {
        setSelectedSpell(spell);
        setIsSidebarOpen(false); // Close sidebar on selection on mobile
    };

    if (loading) {
        return <div className={styles.loading}>Betöltés...</div>;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <p style={{ color: 'red' }}>Hiba történt a betöltéskor:</p>
                    <p>{error}</p>
                    <p>Ellenőrizd, hogy létrehoztad-e a Firestore adatbázist a Firebase konzolon.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Sidebar Toggle for Mobile */}
            <SidebarToggle
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.searchContainer}>
                    <div className={styles.inputWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Varázslat keresése..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button
                        className={`${styles.filterButton} ${showFilters ? styles.filterActive : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Szűrők"
                    >
                        <Filter size={18} />
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className={styles.filterPanel}>
                        <div className={styles.filterHeader}>
                            <span>Szűrők</span>
                            <button className={styles.clearFilters} onClick={clearFilters}>Törlés</button>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Mágia Típusa</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="">Mindegy</option>
                                {spellTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Altípus</label>
                            <select
                                value={filters.subtype}
                                onChange={(e) => handleFilterChange('subtype', e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="">Mindegy</option>
                                {spellSubtypes.map(subtype => (
                                    <option key={subtype} value={subtype}>{subtype}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Mana-pont (Mp)</label>
                            <div className={styles.rangeInputs}>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minMp}
                                    onChange={(e) => handleFilterChange('minMp', e.target.value)}
                                    className={styles.numberInput}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxMp}
                                    onChange={(e) => handleFilterChange('maxMp', e.target.value)}
                                    className={styles.numberInput}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.spellList}>
                    {filteredSpells.length === 0 ? (
                        <div className={styles.noResults}>Nincs találat</div>
                    ) : (
                        filteredSpells.map(spell => {
                            const id = spell.Id || spell.id;
                            const name = spell.Name || spell.name;
                            const type = spell.Type || spell.type;
                            const subtype = spell.Subtype || spell.subtype;
                            const mp = spell.Mp || spell.mp;

                            return (
                                <div
                                    key={id}
                                    className={`${styles.spellItem} ${selectedSpell && (selectedSpell.Id || selectedSpell.id) === id ? styles.activeSpell : ''}`}
                                    onClick={() => handleSpellClick(spell)}
                                >
                                    <div className={styles.spellHeader}>
                                        <span className={styles.spellName}>{name}</span>
                                    </div>
                                    <div className={styles.spellMeta}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <span
                                                className={styles.schoolBadge}
                                                style={{ color: getTypeColor(type), borderColor: getTypeColor(type) }}
                                            >
                                                {type}
                                            </span>
                                            {subtype && <span className={styles.subtypeBadge}>{subtype}</span>}
                                        </div>
                                        <span className={styles.mpCost}>Mp: {mp}</span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {selectedSpell ? (
                    <div className={styles.detailContainer}>
                        <div className={styles.header}>
                            <div className={styles.titleRow}>
                                <h1 className={styles.title}>{selectedSpell.Name || selectedSpell.name}</h1>
                            </div>
                            <div className={styles.badges}>
                                <span className={styles.mainBadge} style={{ backgroundColor: getTypeColor(selectedSpell.Type || selectedSpell.type) }}>
                                    {selectedSpell.Type || selectedSpell.type}
                                </span>
                                {(selectedSpell.Subtype || selectedSpell.subtype) && <span className={styles.levelBadge}>{selectedSpell.Subtype || selectedSpell.subtype}</span>}
                            </div>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Mp költség</span>
                                <span className={styles.statValue} style={{ color: 'var(--color-accent)' }}>{selectedSpell.Mp || selectedSpell.mp}</span>
                                {selectedSpell.MpDescription && <span style={{ fontSize: '0.8rem', color: '#888' }}>{selectedSpell.MpDescription}</span>}
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Hatótáv</span>
                                <span className={styles.statValue}>{selectedSpell.Range || selectedSpell.range}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Időtartam</span>
                                <span className={styles.statValue}>{selectedSpell.Duration || selectedSpell.duration}</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>Varázslás ideje</span>
                                <span className={styles.statValue}>{selectedSpell.CastingTime || selectedSpell.castingTime}</span>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Leírás</h3>
                            <p className={styles.description} style={{ whiteSpace: 'pre-wrap' }}>{selectedSpell.Description || selectedSpell.description}</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Sparkles size={48} />
                        <p>Válassz egy varázslatot a listából</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Spellbook;
