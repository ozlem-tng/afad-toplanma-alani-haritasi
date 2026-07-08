import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import Sidebar from "../components/Sidebar";
import AuthCard from "../components/AuthCard";
import { authService } from "../api/auth";
import styles from "../styles/Login.module.css";

export default function LoginPage() {
    const [tab, setTab] = useState("giris");
    const [showPass, setShowPass] = useState(false);
    const [showRequestPass, setShowRequestPass] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    //  Login işlemi
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const data = await authService.login(email, password);
            console.log('Giriş başarılı:', data);
            localStorage.setItem('token', data.token);
            alert('Giriş başarılı!');
        } catch (error) {
            alert('Giriş başarısız: ' + (error.response?.data?.message || error.message));
        }
    };

    //  Kayıt işlemi
    const handleRegister = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const data = await authService.register(email, password);
            console.log('Kayıt başarılı:', data);
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            setTab('giris');
        } catch (error) {
            alert('Kayıt başarısız: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.watermark}>AFAD</div>
                <div className={styles.formWrapper}>
                    <AuthCard
                        tab={tab}
                        setTab={setTab}
                        showPass={showPass}
                        setShowPass={setShowPass}
                        showRequestPass={showRequestPass}
                        setShowRequestPass={setShowRequestPass}
                        capsLock={capsLock}
                        setCapsLock={setCapsLock}
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                    />
                    <div className={styles.footerLinks}>
                        <a href="#" className={styles.footerLink}>Gizlilik</a>
                        <span>•</span>
                        <a href="#" className={styles.footerLink}>KVKK</a>
                        <span>•</span>
                        <a href="#" className={styles.footerLink}>Yardım Merkezi</a>
                        <span>•</span>
                        <a href="#" className={styles.footerLink}>
                            <Activity size={12} /> Sistem Durumu
                        </a>
                    </div>
                </div>
            </div>
            <Sidebar currentTime={currentTime} />
        </div>
    );
}