import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
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
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    
    const navigate = useNavigate(); 

    useEffect(() => {
        setError("");
        setSuccess("");
        setIsTwoFactorStep(false);
    }, [tab]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const validatePassword = (password) => {
        if (!password || password.trim() === "") return "Şifre alanı boş bırakılamaz.";
        if (/\s/.test(password)) return "Şifre boşluk karakteri içeremez.";
        if (password.length < 8) return "Şifre en az 8 karakter uzunluğunda olmalıdır.";
        if (!/[a-z]/.test(password)) return "Şifre en az bir küçük harf içermelidir.";
        if (!/[A-Z]/.test(password)) return "Şifre en az bir büyük harf içermelidir.";
        if (!/\d/.test(password)) return "Şifre en az bir rakam içermelidir.";
        if (!/[^a-zA-Z0-9]/.test(password)) return "Şifre en az bir özel karakter içermelidir.";
        return null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        try {
            const data = await authService.login(email, password);
            
            if (data.requiresTwoFactor) {
                setLoginEmail(email);
                setIsTwoFactorStep(true);
                setSuccess(data.message || "Doğrulama kodu e-posta adresinize gönderildi.");
            } else {
                localStorage.setItem('token', data.token);
                setSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (error) {
            setError(error.response?.data?.message || "Giriş başarısız.");
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const code = e.target.twoFactorCode.value;

        try {
            const data = await authService.verifyLogin(loginEmail, code);
            localStorage.setItem('token', data.token);
            setSuccess("Doğrulama başarılı! Giriş yapılıyor...");
            
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.message || "Geçersiz veya süresi dolmuş doğrulama kodu.");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const name = e.target.name.value;
        const registrationNumber = e.target.registrationNumber.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        if (!registrationNumber) {
            setError("Sicil numarası boş bırakılamaz.");
            return;
        }
        if (/\s/.test(registrationNumber)) {
            setError("Sicil numarası boşluk karakteri içeremez.");
            return;
        }

        const validationError = validatePassword(password);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await authService.register(name, email, password, registrationNumber);
            setSuccess("Kaydınız başarıyla gerçekleştirilmiştir! Giriş sayfasına yönlendiriliyorsunuz...");
            
            setTimeout(() => {
                setTab('giris');
                setSuccess("");
            }, 2500);
        } catch (error) {
            setError(error.response?.data?.message || "Kayıt başarısız.");
        }
    };

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
                        onChangePassword={handleRedirectToUpdatePassword}
                        error={error}
                        success={success}
                        isTwoFactorStep={isTwoFactorStep}
                        setIsTwoFactorStep={setIsTwoFactorStep}
                        onVerify2FA={handleVerify2FA}
                    />

                    <div className={styles.footerLinks}>
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