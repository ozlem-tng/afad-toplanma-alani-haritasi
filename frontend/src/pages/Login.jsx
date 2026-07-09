import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Yönlendirme için şart
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
    const navigate = useNavigate(); 

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const data = await authService.login(email, password);
            localStorage.setItem('token', data.token);
            alert('Giriş başarılı!');
        } catch (error) {
            alert('Giriş başarısız: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const data = await authService.register(email, password);
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            setTab('giris');
        } catch (error) {
            alert('Kayıt başarısız: ' + (error.response?.data?.message || error.message));
        }
    };

    // Yönlendirme Fonksiyonu
    const handleRedirectToUpdatePassword = () => {
        navigate('/update-password');
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
                        onChangePassword={handleRedirectToUpdatePassword} // Kart içindeki butona tıklandığında çalışır
                    />

                    <div className={styles.footerLinks}>
                        {/* En alttaki yedek link tıklandığında da çalışır */}
                        <a 
                            href="#" 
                            className={styles.footerLink} 
                            onClick={(e) => { e.preventDefault(); handleRedirectToUpdatePassword(); }}
                        >
                            Şifremi Unuttum
                        </a>
                        <span>•</span>
                        <a href="#" className={styles.footerLink}>Gizlilik</a>
                        <span>•</span>
                        <a href="#" className={styles.footerLink}>KVKK</a>
                    </div>
                </div>
            </div>
            <Sidebar currentTime={currentTime} />
        </div>
    );
}