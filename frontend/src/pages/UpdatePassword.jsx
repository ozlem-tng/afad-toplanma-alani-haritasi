import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar"; 
import { authService } from "../api/auth";
import loginStyles from "../styles/Login.module.css";    
import cardStyles from "../styles/AuthCard.module.css";  
// Imported logo2 from your assets folder
import logo2 from "../assets/Logo2.png"; 

export default function UpdatePassword() {
    const [showPass, setShowPass] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const email = e.target.email.value;
        const newPassword = e.target.newPassword.value;

        // ✅ Fixed variable references and state handling
        if (!newPassword || newPassword.trim() === "") {
            setError("Şifre alanı boş bırakılamaz.");
            return;
        }
        if (/\s/.test(newPassword)) {
            setError("Şifre boşluk karakteri içeremez.");
            return;
        }
        
        if (!email || !newPassword) {
            setError("Lütfen tüm alanları doldurun.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Şifre en az 8 karakter uzunluğunda olmalıdır.");
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError("Şifre en az bir büyük harf içermelidir.");
            return;
        }
        if (!/\d/.test(newPassword)) {
            setError("Şifre en az bir rakam içermelidir.");
            return;
        }
        if (!/[^a-zA-Z0-9]/.test(newPassword)) {
            setError("Şifre en az bir özel karakter (sembol) içermelidir.");
            return;
        }

        try {
            setLoading(true);
            await authService.changePassword(email, newPassword);
            setSuccess("Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Şifre güncellenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={loginStyles.container}>
            <div className={loginStyles.leftPanel}>
                <div className={loginStyles.watermark}>AFAD</div>
                <div className={loginStyles.formWrapper}>
                    
                    <div className={cardStyles.card}>
                        {/* Logo container styled to remove adjacent text and perfectly center the larger image */}
                        <div className={cardStyles.logo} style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 0 10px 0" }}>
                            <img 
                                src={logo2} 
                                alt="ATİS Logo" 
                                style={{ 
                                    height: "75px", 
                                    width: "auto", 
                                    objectFit: "contain",
                                    borderRadius: "12px",
                                    backgroundColor: "#ffffff",
                                    padding: "4px"
                                }} 
                            />
                        </div>

                        <h1 className={cardStyles.title} style={{ marginTop: "24px" }}>Şifre Güncelle</h1>
                        <p className={cardStyles.subtitle} style={{ textAlign: "center" }}>Ankara Afet Yönetim Sistemi</p>

                        {error && <div style={{ color: "#ef4444", fontSize: "14px", margin: "10px 0", display: "flex", alignItems: "center", gap: "6px" }}><AlertCircle size={16}/> {error}</div>}
                        {success && <div style={{ color: "#10b981", fontSize: "14px", margin: "10px 0", display: "flex", alignItems: "center", gap: "6px" }}><AlertCircle size={16}/> {success}</div>}

                        <form className={cardStyles.form} onSubmit={handleSubmit}>
                            <div>
                                <label className={cardStyles.label}>E-POSTA</label>
                                <div className={cardStyles.inputWrapper}>
                                    <Mail className={cardStyles.inputIcon} />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="yonetici@afad.gov.tr" 
                                        className={cardStyles.input} 
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className={cardStyles.label}>YENİ ŞİFRE</label>
                                <div className={cardStyles.inputWrapper}>
                                    <Lock className={cardStyles.inputIcon} />
                                    <input
                                        type={showPass ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="••••••••"
                                        className={cardStyles.inputPassword}
                                        disabled={loading}
                                        onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className={cardStyles.passwordToggle}>
                                        {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
                                    </button>
                                </div>
                                {capsLock && (
                                    <div className={cardStyles.capsLockWarning}>
                                        <AlertCircle size={16} /> Caps Lock açık
                                    </div>
                                )}
                            </div>

                            <button type="submit" className={cardStyles.submitButton} disabled={loading}>
                                <Lock size={20} className={cardStyles.submitIcon} /> {loading ? "GÜNCELLENİYOR..." : "ŞİFREYİ GÜNCELLE"}
                            </button>
                        </form>

                        <p className={cardStyles.registerLink} style={{ marginTop: "24px" }}>
                            <button 
                                type="button"
                                onClick={() => navigate("/login")} 
                                className={cardStyles.registerLinkButton} 
                                style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 auto" }}
                            >
                                <ArrowLeft size={16} /> Giriş Sayfasına Dön
                            </button>
                        </p>
                    </div>

                    <div className={loginStyles.footerLinks}>
                        <a href="#" className={loginStyles.footerLink} onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Giriş Yap</a>
                        <span>•</span>
                        <a href="#" className={loginStyles.footerLink}>Gizlilik</a>
                        <span>•</span>
                        <a href="#" className={loginStyles.footerLink}>KVKK</a>
                    </div>
                </div>
            </div>
            
            <Sidebar currentTime={currentTime} />
        </div>
    );
}