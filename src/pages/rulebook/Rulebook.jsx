import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import styles from './Rulebook.module.css';
import SidebarToggle from '../../components/ui/SidebarToggle';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Rulebook = () => {
    const [rulesData, setRulesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedChapters, setExpandedChapters] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchRules = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "rules"));
                const rules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Sort by ID to ensure correct chapter order if IDs are sortable (e.g. chap-1, chap-2), 
                // or you might want to add an explicit 'order' field to the data. 
                // Simple string sort for "chap-1", "chap-2" works okay until "chap-10".
                // Better to use natural sort or an index field.
                rules.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

                setRulesData(rules);
            } catch (error) {
                console.error("Error fetching rules:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRules();
    }, []);

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsSidebarOpen(false); // Close sidebar on selection on mobile
        }
    };

    if (loading) {
        return <div className={styles.loading}>Betöltés...</div>;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                    <p>Hiba történt a betöltéskor:</p>
                    <p>{error}</p>
                    <p>Ellenőrizd, hogy létrehoztad-e a Firestore adatbázist.</p>
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

            {/* Sidebar TOC */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.searchContainer}>
                    <div className={styles.inputWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Keresés..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.toc}>
                    {rulesData.map(chapter => (
                        <div key={chapter.id} className={styles.chapterItem}>
                            <div
                                className={styles.chapterHeader}
                                onClick={() => {
                                    toggleChapter(chapter.id);
                                    scrollToSection(chapter.id);
                                }}
                            >
                                {chapter.sections && chapter.sections.length > 0 && (
                                    <span className={styles.chevron}>
                                        {expandedChapters[chapter.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </span>
                                )}
                                <span className={styles.chapterTitle}>{chapter.title}</span>
                            </div>

                            {expandedChapters[chapter.id] && chapter.sections && (
                                <div className={styles.sectionList}>
                                    {chapter.sections.map(section => (
                                        <div
                                            key={section.id}
                                            className={styles.sectionItem}
                                            onClick={() => scrollToSection(section.id)}
                                        >
                                            {section.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Reading Area */}
            <div className={styles.readingArea}>
                <div className={styles.contentContainer}>
                    {rulesData.map(chapter => (
                        <div key={chapter.id} id={chapter.id} className={styles.chapterBlock}>
                            <h1 className={styles.pageTitle}>
                                {chapter.title}
                            </h1>
                            <p className={styles.paragraph}>{chapter.content}</p>

                            {chapter.sections && chapter.sections.map(section => (
                                <div key={section.id} id={section.id} className={styles.sectionBlock}>
                                    <h2 className={styles.sectionTitle}>
                                        {section.title}
                                    </h2>
                                    <p className={styles.paragraph}>{section.content}</p>
                                </div>
                            ))}
                            <div className={styles.divider} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Rulebook;
