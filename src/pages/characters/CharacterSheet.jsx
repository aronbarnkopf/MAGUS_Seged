import React, { useState, useEffect } from 'react';
import { Shield, Sword, Heart, Zap, Brain, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Plus, Swords, GripVertical, Coins } from 'lucide-react';
import styles from './Characters.module.css';
import { SKILL_DATA, SKILL_CATEGORIES } from '../../data/skills';

const CharacterSheet = ({ character, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(character);

    // Skill management state
    const [selectedCategory, setSelectedCategory] = useState(Object.values(SKILL_CATEGORIES)[0]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [skillLevel, setSkillLevel] = useState('Af'); // Af or Mf
    const [skillPercent, setSkillPercent] = useState(10);

    const [expandedSections, setExpandedSections] = useState({
        stats: true,
        combat: true,
        skills: true,
        equipment: true
    });

    useEffect(() => {
        const initialData = { ...character };

        // Ensure equipment structure exists
        if (!initialData.equippedWeapons) {
            initialData.equippedWeapons = {
                mainHand: null,
                offHand: null
            };
        }

        // Ensure weapons list exists (custom weapons)
        if (!initialData.weapons) {
            initialData.weapons = [];
        }

        // Ensure armours list exists
        if (!initialData.armours) {
            initialData.armours = [];
        }

        // Ensure money exists
        if (!initialData.money) {
            initialData.money = { gold: 0, silver: 0, copper: 0 };
        }

        // Ensure skill points exist
        if (!initialData.skillPoints) {
            initialData.skillPoints = { perLevel: 0, current: 0 };
        }

        // Ensure perLevel fields exist in resources
        if (initialData.resources) {
            if (initialData.resources.fp && initialData.resources.fp.perLevel === undefined) initialData.resources.fp.perLevel = 0;
            if (initialData.resources.mp && initialData.resources.mp.perLevel === undefined) initialData.resources.mp.perLevel = 0;
            if (initialData.resources.psi && initialData.resources.psi.perLevel === undefined) initialData.resources.psi.perLevel = 0;
        }

        // Ensure hmPerLevel exists in combat
        if (initialData.combat && initialData.combat.hmPerLevel === undefined) {
            initialData.combat.hmPerLevel = 0;
        }

        setFormData(initialData);

        if (character.name === "Új Karakter") {
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }, [character]);

    // Calculate total stats including weapons
    const getCombatStats = () => {
        const base = formData.combat;
        // Use local weapons list
        const mainWeapon = formData.weapons?.find(w => w.id === formData.equippedWeapons?.mainHand);
        const offWeapon = formData.weapons?.find(w => w.id === formData.equippedWeapons?.offHand);

        let bonuses = { te: 0, ve: 0, ke: 0, ce: 0 };

        if (mainWeapon) {
            bonuses.te += (parseInt(mainWeapon.stats.te) || 0);
            bonuses.ve += (parseInt(mainWeapon.stats.ve) || 0);
            bonuses.ke += (parseInt(mainWeapon.stats.ke) || 0);
            bonuses.ce += (parseInt(mainWeapon.stats.ce) || 0);
        }

        if (offWeapon) {
            bonuses.te += (parseInt(offWeapon.stats.te) || 0);
            bonuses.ve += (parseInt(offWeapon.stats.ve) || 0);
            bonuses.ke += (parseInt(offWeapon.stats.ke) || 0);
            bonuses.ce += (parseInt(offWeapon.stats.ce) || 0);
        }

        return {
            base,
            bonuses,
            total: {
                te: base.te + bonuses.te,
                ve: base.ve + bonuses.ve,
                ke: base.ke + bonuses.ke,
                ce: base.ce + bonuses.ce
            }
        };
    };

    const finalStats = getCombatStats();

    const handleEquipWeapon = (slot, weaponId) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                equippedWeapons: {
                    ...prev.equippedWeapons,
                    [slot]: weaponId
                }
            };

            // Handle 2-handed logic
            // Look up in local weapons
            const weapon = prev.weapons?.find(w => w.id === weaponId);

            if (weapon && weapon.hands === 2 && slot === 'mainHand') {
                newData.equippedWeapons.offHand = null;
            }

            // If equipping offhand but mainhand is 2H, remove mainhand
            if (slot === 'offHand' && newData.equippedWeapons.mainHand) {
                const mainW = prev.weapons?.find(w => w.id === newData.equippedWeapons.mainHand);
                if (mainW && mainW.hands === 2) {
                    newData.equippedWeapons.mainHand = null;
                }
            }

            return newData;
        });
    };

    const handleAddWeapon = () => {
        const newId = Date.now().toString();
        const newWeapon = {
            id: newId,
            name: "Új Fegyver",
            damage: "1k6",
            hands: 1,
            stats: { te: 0, ve: 0, ke: 0, ce: 0 }
        };
        setFormData(prev => ({
            ...prev,
            weapons: [...(prev.weapons || []), newWeapon]
        }));
    };

    const handleUpdateWeapon = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            weapons: prev.weapons.map(w => {
                if (w.id !== id) return w;
                if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    return { ...w, [parent]: { ...w[parent], [child]: parseInt(value) || 0 } };
                }
                return { ...w, [field]: value };
            })
        }));
    };

    const handleRemoveWeapon = (id) => {
        if (!confirm("Biztosan törölni szeretnéd ezt a fegyvert?")) return;
        setFormData(prev => ({
            ...prev,
            weapons: prev.weapons.filter(w => w.id !== id),
            equippedWeapons: {
                mainHand: prev.equippedWeapons.mainHand === id ? null : prev.equippedWeapons.mainHand,
                offHand: prev.equippedWeapons.offHand === id ? null : prev.equippedWeapons.offHand
            }
        }));
    };

    const handleAddArmour = () => {
        const newId = Date.now().toString();
        const newArmour = {
            id: newId,
            name: "Új Páncél",
            mgt: 0,
            sfe: 0
        };
        setFormData(prev => ({
            ...prev,
            armours: [...(prev.armours || []), newArmour]
        }));
    };

    const handleUpdateArmour = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            armours: prev.armours.map(a => {
                if (a.id !== id) return a;
                return { ...a, [field]: value };
            })
        }));
    };

    const handleRemoveArmour = (id) => {
        if (!confirm("Biztosan törölni szeretnéd ezt a páncélt?")) return;
        setFormData(prev => ({
            ...prev,
            armours: prev.armours.filter(a => a.id !== id)
        }));
    };

    // Skill Management Handlers
    const handleAddSkill = () => {
        if (!selectedSkill) return;

        // Find skill definition to get type
        let skillType = 'level';
        let skillName = selectedSkill;

        // Find the skill in data
        Object.values(SKILL_DATA).forEach(category => {
            const found = category.find(s => s.name === selectedSkill);
            if (found) skillType = found.type;
        });

        const newSkill = {
            name: skillName,
            type: skillType,
            level: skillType === 'percent' ? parseInt(skillPercent) : skillLevel // Store "Af"/"Mf" or number
        };

        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, newSkill]
        }));

        setSelectedSkill(''); // Reset selection
    };

    const handleRemoveSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleResourceChange = (resource, field, value) => {
        setFormData(prev => ({
            ...prev,
            resources: {
                ...prev.resources,
                [resource]: {
                    ...prev.resources[resource],
                    [field]: parseInt(value) || 0
                }
            }
        }));
    };

    const handleMoneyChange = (currency, value) => {
        setFormData(prev => ({
            ...prev,
            money: {
                ...prev.money,
                [currency]: parseInt(value) || 0
            }
        }));
    };
    const handleSkillPointsChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            skillPoints: {
                ...prev.skillPoints,
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleStatChange = (stat, value) => {
        setFormData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [stat]: parseInt(value) || 0
            }
        }));
    };

    const handleCombatChange = (stat, value) => {
        setFormData(prev => ({
            ...prev,
            combat: {
                ...prev.combat,
                [stat]: parseInt(value) || 0
            }
        }));
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(character);
        setIsEditing(false);
    };

    const addEquipment = () => {
        const item = prompt("Tárgy neve:");
        if (item) setFormData({ ...formData, equipment: [...formData.equipment, item] });
    };

    const removeEquipment = (idx) => {
        setFormData({
            ...formData,
            equipment: formData.equipment.filter((_, i) => i !== idx)
        });
    };

    const StatBox = ({ label, statKey, value }) => (
        <div className={styles.statBox}>
            <span className={styles.statName}>{label}</span>
            {isEditing ? (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleStatChange(statKey, e.target.value)}
                    className={styles.statInput}
                />
            ) : (
                <span className={styles.statVal}>{value}</span>
            )}
        </div>
    );

    const ResourceCard = ({ label, resourceKey, current, max, perLevel, color }) => (
        <div className={styles.resourceCard}>
            <div className={styles.resourceTitle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {label === 'Ép' && <Heart size={16} />}
                    {label === 'Fp' && <Shield size={16} />}
                    {label === 'Mp' && <Zap size={16} />}
                    {label === 'Pszi' && <Brain size={16} />}
                    {label}
                </div>
                {label !== 'Ép' && (
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                / Szint:
                                <input
                                    type="number"
                                    value={perLevel || 0}
                                    onChange={(e) => handleResourceChange(resourceKey, 'perLevel', e.target.value)}
                                    style={{
                                        width: '30px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid #555',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        padding: '0 2px'
                                    }}
                                />
                            </div>
                        ) : (
                            <span>/ Szint: {perLevel || 0}</span>
                        )}
                    </div>
                )}
            </div>
            {isEditing ? (
                <div className={styles.resourceEdit}>
                    <input
                        type="number"
                        value={current}
                        onChange={(e) => handleResourceChange(resourceKey, 'current', e.target.value)}
                        className={styles.resourceInput}
                    />
                    <span>/</span>
                    <input
                        type="number"
                        value={max}
                        onChange={(e) => handleResourceChange(resourceKey, 'max', e.target.value)}
                        className={styles.resourceInput}
                    />
                </div>
            ) : (
                <div className={styles.resourceValue}>
                    {current} <span style={{ fontSize: '0.8em', color: '#666' }}>/ {max}</span>
                </div>
            )}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{
                        width: `${Math.min(100, (current / max) * 100)}%`,
                        backgroundColor: color
                    }}
                />
            </div>
        </div>
    );

    const CombatBox = ({ label, statKey, baseValue, bonus, subLabel }) => {
        const total = baseValue + bonus;

        return (
            <div className={styles.combatBox}>
                <div className={styles.combatBoxContent}>
                    <div>
                        <span className={styles.combatLabel}>{label}</span>
                        <span className={styles.combatLabel} style={{ fontSize: '0.7rem', marginBottom: '5px' }}>{subLabel}</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="number"
                            value={baseValue}
                            onChange={(e) => handleCombatChange(statKey, e.target.value)}
                            className={styles.combatInput}
                        />
                    ) : (
                        <div className={styles.combatMainVal}>
                            <span className={styles.combatVal}>{total}</span>
                            <span className={styles.combatBase}>({baseValue} alap)</span>
                            {bonus !== 0 && (
                                <span className={bonus > 0 ? styles.combatBonus : styles.combatPenalty}>
                                    {bonus > 0 ? `+${bonus}` : bonus}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.sheetContainer}>
            <div className={styles.sheetHeader}>
                <div className={styles.sheetTitle}>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={styles.nameInput}
                        />
                    ) : (
                        <h1>{character.name}</h1>
                    )}

                    <div className={styles.sheetSubtitle}>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <select
                                    value={formData.race}
                                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                                    className={styles.selectInput}
                                >
                                    {['Ember', 'Elf', 'Félelf', 'Törpe', 'Udvari ork'].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <select
                                    value={formData.class}
                                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                    className={styles.selectInput}
                                >
                                    {['Harcos', 'Gladiátor', 'Fejvadász', 'Lovag', 'Tolvaj', 'Bárd', 'Pap', 'Paplovag', 'Harcművész', 'Kardművész', 'Boszorkány', 'Boszorkánymester', 'Tűzvarázsló', 'Varázsló'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem' }}>TSZ:</span>
                                    <input
                                        type="number"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                        className={styles.selectInput}
                                        style={{ width: '50px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem' }}>Tp:</span>
                                    <input
                                        type="number"
                                        value={formData.xp}
                                        onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) })}
                                        className={styles.selectInput}
                                        style={{ width: '80px' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className={styles.raceClassBadge}>{character.race} {character.class}</span>
                                <span className={styles.levelBadge}> Szint {character.level} | Tp: {character.xp}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.actions}>
                    {isEditing ? (
                        <>
                            <button className={styles.saveButton} onClick={handleSave}>
                                <Save size={16} /> Mentés
                            </button>
                            <button className={styles.cancelButton} onClick={handleCancel}>
                                <X size={16} /> Mégse
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
                                <Edit2 size={16} /> Szerkesztés
                            </button>
                            <button className={styles.deleteButton} onClick={onDelete}>
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.resourceGrid}>
                <ResourceCard label="Ép" resourceKey="ep" current={formData.resources.ep.current} max={formData.resources.ep.max} color="#ff3333" />
                <ResourceCard label="Fp" resourceKey="fp" current={formData.resources.fp.current} max={formData.resources.fp.max} perLevel={formData.resources.fp.perLevel} color="#ffa500" />
                <ResourceCard label="Mp" resourceKey="mp" current={formData.resources.mp.current} max={formData.resources.mp.max} perLevel={formData.resources.mp.perLevel} color="#4169e1" />
                <ResourceCard label="Pszi" resourceKey="psi" current={formData.resources.psi.current} max={formData.resources.psi.max} perLevel={formData.resources.psi.perLevel} color="#9370db" />
            </div>

            <div className={styles.sectionHeader} onClick={() => toggleSection('stats')}>
                <div className={styles.sectionTitle}>
                    <Zap size={18} /> Fő Képességek
                    {expandedSections.stats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {expandedSections.stats && (
                <div className={styles.statsGrid}>
                    <StatBox label="Erő" statKey="ero" value={formData.stats.ero} />
                    <StatBox label="Ügyesség" statKey="ugy" value={formData.stats.ugy} />
                    <StatBox label="Gyorsaság" statKey="gyo" value={formData.stats.gyo} />
                    <StatBox label="Állóképesség" statKey="kit" value={formData.stats.kit} />
                    <StatBox label="Egészség" statKey="egs" value={formData.stats.egs} />
                    <StatBox label="Szépség" statKey="szep" value={formData.stats.szep} />
                    <StatBox label="Intelligencia" statKey="int" value={formData.stats.int} />
                    <StatBox label="Akaraterő" statKey="aka" value={formData.stats.aka} />
                    <StatBox label="Asztrál" statKey="asz" value={formData.stats.asz} />
                </div>
            )}

            <div className={styles.sectionHeader} onClick={() => toggleSection('combat')}>
                <div className={styles.sectionTitle}>
                    <Swords size={18} /> Harcértékek
                    {expandedSections.combat ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {expandedSections.combat && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        marginBottom: '15px'
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>HM / Szint:</span>
                        {isEditing ? (
                            <input
                                type="number"
                                value={formData.combat.hmPerLevel || 0}
                                onChange={(e) => handleCombatChange('hmPerLevel', e.target.value)}
                                className={styles.selectInput}
                                style={{ width: '60px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '1.1rem', color: '#c29b40', fontWeight: 'bold' }}>{formData.combat.hmPerLevel || 0}</span>
                        )}
                    </div>
                    <div className={styles.combatGrid}>
                        <CombatBox
                            label="TÉ"
                            statKey="te"
                            subLabel="Támadó Érték"
                            baseValue={finalStats.base.te}
                            bonus={finalStats.bonuses.te}
                        />
                        <CombatBox
                            label="VÉ"
                            statKey="ve"
                            subLabel="Védő Érték"
                            baseValue={finalStats.base.ve}
                            bonus={finalStats.bonuses.ve}
                        />
                        <CombatBox
                            label="KÉ"
                            statKey="ke"
                            subLabel="Kezdeményező Érték"
                            baseValue={finalStats.base.ke}
                            bonus={finalStats.bonuses.ke}
                        />
                        <CombatBox
                            label="CÉ"
                            statKey="ce"
                            subLabel="Célzó Érték"
                            baseValue={finalStats.base.ce}
                            bonus={finalStats.bonuses.ce}
                        />
                    </div>
                </div>
            )}

            <div className={styles.sectionHeader} onClick={() => toggleSection('skills')}>
                <div className={styles.sectionTitle}>
                    <Brain size={18} /> Képzettségek
                    {expandedSections.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {expandedSections.skills && (
                <div className={styles.skillList}>
                    <div className={styles.skillPointsSummary} style={{
                        marginTop: '0',
                        marginBottom: '15px',
                        padding: '10px',
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '6px',
                        border: '1px solid rgba(194, 155, 64, 0.2)'
                    }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#c29b40', fontSize: '0.9rem', textTransform: 'uppercase' }}>Képzettség pontok</h5>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>SZINTENKÉNTI</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.skillPoints?.perLevel || 0}
                                        onChange={(e) => handleSkillPointsChange('perLevel', e.target.value)}
                                        className={styles.skillFormInput}
                                        style={{ width: '100%', padding: '4px 8px' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formData.skillPoints?.perLevel || 0}</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>AKTUÁLIS</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.skillPoints?.current || 0}
                                        onChange={(e) => handleSkillPointsChange('current', e.target.value)}
                                        className={styles.skillFormInput}
                                        style={{ width: '100%', padding: '4px 8px' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#c29b40' }}>{formData.skillPoints?.current || 0}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {formData.skills.map((skill, index) => (
                        <div key={index} className={styles.skillItem}>
                            <span>{skill.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    color: '#c29b40',
                                    fontWeight: 'bold',
                                    minWidth: '50px',
                                    textAlign: 'right'
                                }}>
                                    {skill.type === 'percent' ? `${skill.level}%` : skill.level}
                                </span>
                                {isEditing && (
                                    <button
                                        onClick={() => handleRemoveSkill(index)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ff5555',
                                            cursor: 'pointer',
                                            padding: '2px'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {formData.skills.length === 0 && <p style={{ color: '#666' }}>Nincsenek képzettségek.</p>}

                    {/* Add Skill Interface (Edit Mode) */}
                    {isEditing && (
                        <div className={styles.skillManager}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#c29b40' }}>Új Képzettség Hozzáadása</h5>

                            {/* Category Selection */}
                            <div className={styles.skillFormGroup}>
                                <label className={styles.skillFormLabel}>Kategória:</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSelectedSkill(''); // Reset skill when category changes
                                    }}
                                    className={styles.skillFormSelect}
                                >
                                    {Object.values(SKILL_CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Skill Selection */}
                            <div className={styles.skillFormGroup}>
                                <label className={styles.skillFormLabel}>Képzettség:</label>
                                <select
                                    value={selectedSkill}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    className={styles.skillFormSelect}
                                >
                                    <option value="">Válassz képzettséget...</option>
                                    {SKILL_DATA[selectedCategory]?.map(skill => (
                                        <option key={skill.name} value={skill.name}>
                                            {skill.name} {skill.type === 'percent' ? '(%)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Level/Percent Input */}
                            {selectedSkill && (
                                <div className={styles.skillFormGroup}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                                        {SKILL_DATA[selectedCategory]?.find(s => s.name === selectedSkill)?.type === 'percent'
                                            ? 'Százalék:'
                                            : 'Szint:'}
                                    </label>
                                    {SKILL_DATA[selectedCategory]?.find(s => s.name === selectedSkill)?.type === 'percent' ? (
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={skillPercent}
                                            onChange={(e) => setSkillPercent(e.target.value)}
                                            className={styles.skillFormInput}
                                        />
                                    ) : (
                                        <select
                                            value={skillLevel}
                                            onChange={(e) => setSkillLevel(e.target.value)}
                                            className={styles.skillFormSelect}
                                        >
                                            <option value="Af">Alapfok (Af)</option>
                                            <option value="Mf">Mesterfok (Mf)</option>
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Add Button */}
                            <button
                                onClick={handleAddSkill}
                                disabled={!selectedSkill}
                                className={styles.skillAddButton}
                            >
                                <Plus size={16} />
                                Képzettség Hozzáadása
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.sectionHeader} onClick={() => toggleSection('equipment')}>
                <div className={styles.sectionTitle}>
                    <Shield size={18} /> Felszerelés & Fegyverek
                    {expandedSections.equipment ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {expandedSections.equipment && (
                <div className={styles.equipmentSection}>
                    <div className={styles.weaponSection}>
                        <h4 className={styles.subHeader} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Swords size={16} /> Fegyverek
                        </h4>
                        <div className={styles.weaponGrid}>

                            {/* Main Hand */}
                            <div className={`${styles.weaponSlot} ${formData.equippedWeapons?.mainHand ? styles.weaponSlotActive : ''}`}>
                                <div className={styles.slotLabel}>Fő fegyver</div>
                                {formData.equippedWeapons?.mainHand ? (
                                    <>
                                        <div className={styles.weaponName}>
                                            <Sword size={16} />
                                            {formData.weapons?.find(w => w.id === formData.equippedWeapons.mainHand)?.name || "Ismeretlen"}
                                        </div>
                                        {/* Damage Display */}
                                        <div style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '2px' }}>
                                            Sebzés: {formData.weapons?.find(w => w.id === formData.equippedWeapons.mainHand)?.damage}
                                        </div>
                                        <div className={styles.weaponStats}>
                                            {(() => {
                                                const w = formData.weapons?.find(w => w.id === formData.equippedWeapons.mainHand);
                                                if (!w) return null;

                                                const renderStat = (label, val) => {
                                                    const numVal = parseInt(val) || 0;
                                                    if (numVal === 0) return null;
                                                    const isNeg = numVal < 0;
                                                    return (
                                                        <span key={label} style={{ color: isNeg ? '#ff5555' : '#4ade80', marginRight: '8px' }}>
                                                            {label}{numVal >= 0 ? '+' : ''}{numVal}
                                                        </span>
                                                    );
                                                };

                                                return (
                                                    <>
                                                        {renderStat('TÉ', w.stats.te)}
                                                        {renderStat('VÉ', w.stats.ve)}
                                                        {renderStat('KÉ', w.stats.ke)}
                                                        {renderStat('CÉ', w.stats.ce)}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {isEditing && (
                                            <button
                                                className={styles.removeWeapon}
                                                onClick={() => handleEquipWeapon('mainHand', null)}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.emptySlot}>Nincs fegyver</div>
                                )}

                                {isEditing && !formData.equippedWeapons?.mainHand && (
                                    <select
                                        className={styles.weaponSelect}
                                        onChange={(e) => handleEquipWeapon('mainHand', e.target.value)}
                                        value=""
                                    >
                                        <option value="" disabled>Válassz fegyvert...</option>
                                        {formData.weapons?.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({w.hands}K)</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Off Hand */}
                            <div className={`${styles.weaponSlot} ${formData.equippedWeapons?.offHand ? styles.weaponSlotActive : ''}`}>
                                <div className={styles.slotLabel}>Másodlagos (pajzs/tőr)</div>
                                {formData.equippedWeapons?.offHand ? (
                                    <>
                                        <div className={styles.weaponName}>
                                            <Shield size={16} />
                                            {formData.weapons?.find(w => w.id === formData.equippedWeapons.offHand)?.name || "Ismeretlen"}
                                        </div>
                                        {/* Damage Display */}
                                        <div style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '2px' }}>
                                            Sebzés: {formData.weapons?.find(w => w.id === formData.equippedWeapons.offHand)?.damage}
                                        </div>
                                        <div className={styles.weaponStats}>
                                            {(() => {
                                                const w = formData.weapons?.find(w => w.id === formData.equippedWeapons.offHand);
                                                if (!w) return null;

                                                const renderStat = (label, val) => {
                                                    const numVal = parseInt(val) || 0;
                                                    if (numVal === 0) return null;
                                                    const isNeg = numVal < 0;
                                                    return (
                                                        <span key={label} style={{ color: isNeg ? '#ff5555' : '#4ade80', marginRight: '8px' }}>
                                                            {label}{numVal >= 0 ? '+' : ''}{numVal}
                                                        </span>
                                                    );
                                                };

                                                return (
                                                    <>
                                                        {renderStat('TÉ', w.stats.te)}
                                                        {renderStat('VÉ', w.stats.ve)}
                                                        {renderStat('KÉ', w.stats.ke)}
                                                        {renderStat('CÉ', w.stats.ce)}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {isEditing && (
                                            <button
                                                className={styles.removeWeapon}
                                                onClick={() => handleEquipWeapon('offHand', null)}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.emptySlot}>Nincs fegyver</div>
                                )}

                                {isEditing && !formData.equippedWeapons?.offHand && (
                                    <select
                                        className={styles.weaponSelect}
                                        onChange={(e) => handleEquipWeapon('offHand', e.target.value)}
                                        value=""
                                        disabled={(() => {
                                            const mainW = formData.weapons?.find(w => w.id === formData.equippedWeapons?.mainHand);
                                            return mainW && mainW.hands === 2;
                                        })()}
                                    >
                                        <option value="" disabled>Válassz fegyvert...</option>
                                        {formData.weapons?.filter(w => w.hands === 1 || w.type === 'shield').map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Unequipped Weapons List */}
                        {formData.weapons && formData.weapons.length > 0 && (
                            <div className={styles.tags} style={{ marginTop: '10px', marginBottom: '10px' }}>
                                {formData.weapons
                                    .filter(w => w.id !== formData.equippedWeapons?.mainHand && w.id !== formData.equippedWeapons?.offHand)
                                    .map((w, i) => (
                                        <span key={w.id} className={styles.tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            <Sword size={12} />
                                            {w.name}
                                            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '4px' }}>
                                                {/* Short stat summary */}
                                                {(parseInt(w.stats.te) || parseInt(w.stats.ve)) ?
                                                    `(${w.stats.te}/${w.stats.ve})` :
                                                    `(${w.damage})`
                                                }
                                            </span>
                                        </span>
                                    ))
                                }
                            </div>
                        )}

                        {/* Custom Weapon Management List (only in Edit Mode) */}
                        {isEditing && (
                            <div className={styles.weaponManager}>
                                <h5 className={styles.subHeader} style={{ marginTop: 0 }}>Fegyverek Kezelése</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {formData.weapons?.map(weapon => (
                                        <div key={weapon.id} style={{
                                            background: 'rgba(0,0,0,0.2)',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: '1px solid #444'
                                        }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={weapon.name}
                                                    onChange={(e) => handleUpdateWeapon(weapon.id, 'name', e.target.value)}
                                                    className={styles.selectInput}
                                                    style={{ flex: 1, fontWeight: 'bold' }}
                                                    placeholder="Fegyver neve"
                                                />
                                                <select
                                                    value={weapon.hands}
                                                    onChange={(e) => handleUpdateWeapon(weapon.id, 'hands', parseInt(e.target.value))}
                                                    className={styles.selectInput}
                                                    style={{ width: 'auto' }}
                                                >
                                                    <option value={1}>Egykezes</option>
                                                    <option value={2}>Kétkezes</option>
                                                </select>
                                                <button onClick={() => handleRemoveWeapon(weapon.id)} style={{ color: '#ff5555', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                                                {['te', 've', 'ke', 'ce'].map(stat => (
                                                    <div key={stat} style={{ textAlign: 'center' }}>
                                                        <label style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>{stat.toUpperCase()}</label>
                                                        <input
                                                            type="number"
                                                            value={weapon.stats[stat]}
                                                            onChange={(e) => handleUpdateWeapon(weapon.id, `stats.${stat}`, e.target.value)}
                                                            className={styles.selectInput}
                                                            style={{ width: '100%', textAlign: 'center' }}
                                                        />
                                                    </div>
                                                ))}
                                                <div style={{ textAlign: 'center' }}>
                                                    <label style={{ fontSize: '0.7rem', color: '#888' }}>SEBZÉS</label>
                                                    <input
                                                        type="text"
                                                        value={weapon.damage}
                                                        onChange={(e) => handleUpdateWeapon(weapon.id, 'damage', e.target.value)}
                                                        className={styles.selectInput}
                                                        style={{ width: '100%', textAlign: 'center' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddWeapon}
                                        className={styles.addTagButton}
                                        style={{ justifyContent: 'center', padding: '10px' }}
                                    >
                                        <Plus size={16} /> Új fegyver felvétele
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    <h4 className={styles.subHeader}>Páncélzat</h4>
                    <div className={styles.tags} style={{ marginBottom: '10px' }}>
                        {formData.armours?.map((armour) => (
                            <span key={armour.id} className={styles.tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <Shield size={12} />
                                {armour.name}
                                <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '4px' }}>
                                    (MGT: {armour.mgt} / SFÉ: {armour.sfe})
                                </span>
                            </span>
                        ))}
                        {(formData.armours?.length === 0 || !formData.armours) && !isEditing && <span style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px', display: 'block' }}>Nincs páncélzat.</span>}
                    </div>

                    {isEditing && (
                        <div className={styles.weaponManager} style={{ marginBottom: '20px' }}>
                            <h5 className={styles.subHeader} style={{ marginTop: 0 }}>Páncélzat Kezelése</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {formData.armours?.map(armour => (
                                    <div key={armour.id} style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        border: '1px solid #444'
                                    }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={armour.name}
                                                onChange={(e) => handleUpdateArmour(armour.id, 'name', e.target.value)}
                                                className={styles.selectInput}
                                                style={{ flex: 1, fontWeight: 'bold' }}
                                                placeholder="Páncél neve"
                                            />
                                            <button onClick={() => handleRemoveArmour(armour.id)} style={{ color: '#ff5555', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <label style={{ fontSize: '0.7rem', color: '#888' }}>MGT</label>
                                                <input
                                                    type="number"
                                                    value={armour.mgt}
                                                    onChange={(e) => handleUpdateArmour(armour.id, 'mgt', parseInt(e.target.value) || 0)}
                                                    className={styles.selectInput}
                                                    style={{ width: '100%', textAlign: 'center' }}
                                                />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <label style={{ fontSize: '0.7rem', color: '#888' }}>SFÉ</label>
                                                <input
                                                    type="number"
                                                    value={armour.sfe}
                                                    onChange={(e) => handleUpdateArmour(armour.id, 'sfe', parseInt(e.target.value) || 0)}
                                                    className={styles.selectInput}
                                                    style={{ width: '100%', textAlign: 'center' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddArmour}
                                    className={styles.addTagButton}
                                    style={{ justifyContent: 'center', padding: '10px' }}
                                >
                                    <Plus size={16} /> Új páncél felvétele
                                </button>
                            </div>
                        </div>
                    )}

                    <h4 className={styles.subHeader}>Pénztárca</h4>
                    <div className={styles.moneyContainer}>
                        <div className={styles.moneyItem}>
                            <span className={styles.moneyLabel} style={{ color: '#ffd700' }}>Arany:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={formData.money?.gold || 0}
                                    onChange={(e) => handleMoneyChange('gold', e.target.value)}
                                    className={styles.moneyInput}
                                />
                            ) : (
                                <span className={styles.moneyValue}>{formData.money?.gold || 0}</span>
                            )}
                        </div>
                        <div className={styles.moneyItem}>
                            <span className={styles.moneyLabel} style={{ color: '#c0c0c0' }}>Ezüst:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={formData.money?.silver || 0}
                                    onChange={(e) => handleMoneyChange('silver', e.target.value)}
                                    className={styles.moneyInput}
                                />
                            ) : (
                                <span className={styles.moneyValue}>{formData.money?.silver || 0}</span>
                            )}
                        </div>
                        <div className={styles.moneyItem}>
                            <span className={styles.moneyLabel} style={{ color: '#b87333' }}>Réz:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={formData.money?.copper || 0}
                                    onChange={(e) => handleMoneyChange('copper', e.target.value)}
                                    className={styles.moneyInput}
                                />
                            ) : (
                                <span className={styles.moneyValue}>{formData.money?.copper || 0}</span>
                            )}
                        </div>
                    </div>

                    <h4 className={styles.subHeader}>Egyéb felszerelés</h4>
                    <div className={styles.tags}>
                        {formData.equipment.map((item, i) => (
                            <span key={i} className={styles.tag}>
                                {item}
                                {isEditing && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeEquipment(i); }}
                                        style={{ marginLeft: '6px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                        {isEditing && (
                            <button
                                className={styles.addTagButton}
                                onClick={addEquipment}
                            >
                                <Plus size={14} /> Hozzáad
                            </button>
                        )}
                    </div>

                    <h4 className={styles.subHeader}>Jegyzetek</h4>
                    {isEditing ? (
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className={styles.notesInput}
                            rows={4}
                        />
                    ) : (
                        <p className={styles.notes}>{formData.notes}</p>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default CharacterSheet;
