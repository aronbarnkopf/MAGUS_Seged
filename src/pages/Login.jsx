import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login, googleSignIn } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate("/");
        } catch {
            setError("Failed to log in");
        }

        setLoading(false);
    }

    async function handleGoogleSignIn() {
        try {
            setError("");
            setLoading(true);
            await googleSignIn();
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Failed to sign in with Google");
        }
        setLoading(false);
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h2>Bejelentkezés</h2>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" ref={emailRef} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Jelszó</label>
                        <input type="password" ref={passwordRef} required />
                    </div>
                    <button disabled={loading} className={styles.submitButton} type="submit">
                        Bejelentkezés
                    </button>
                </form>
                <div className={styles.divider}>vagy</div>
                <button disabled={loading} onClick={handleGoogleSignIn} className={styles.googleButton}>
                    Bejelentkezés Google fiókkal
                </button>
                <div className={styles.authLink}>
                    Még nincs fiókod? <Link to="/signup">Regisztráció</Link>
                </div>
            </div>
        </div>
    );
}
