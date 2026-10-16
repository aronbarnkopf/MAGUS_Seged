import { NavLink, useNavigate } from 'react-router-dom';
import { Book, ScrollText, Users, Sparkles, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error("Failed to log out");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Sparkles size={24} color="var(--color-accent)" />
        </div>
        <div className={styles.logoText}>
          <h1>M.A.G.U.S.</h1>
          <span>Digitális Szabálykönyv</span>
        </div>
      </div>

      <div className={styles.navLinks}>
        <NavLink
          to="/spells"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          <Book size={20} />
          <span>Varázslat-könyv</span>
        </NavLink>

        <NavLink
          to="/rules"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          <ScrollText size={20} />
          <span>Szabálykönyv</span>
        </NavLink>

        <NavLink
          to="/characters"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          <Users size={20} />
          <span>Karakterek</span>
        </NavLink>

        <div className={styles.authSection}>
          {currentUser ? (
            <div className={styles.userMenu}>
              <span className={styles.userEmail}>{currentUser.email}</span>
              <button onClick={handleLogout} className={styles.iconButton} title="Kijelentkezés">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <LogIn size={20} />
              <span>Belépés</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
