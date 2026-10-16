import React from 'react';
import { Menu, X } from 'lucide-react';
import styles from './SidebarToggle.module.css';

const SidebarToggle = ({ isOpen, onToggle, className = '' }) => {
    return (
        <button
            className={`${styles.toggleButton} ${className}`}
            onClick={onToggle}
            aria-label={isOpen ? "Sidebar bezárása" : "Sidebar kinyitása"}
        >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
    );
};

export default SidebarToggle;
