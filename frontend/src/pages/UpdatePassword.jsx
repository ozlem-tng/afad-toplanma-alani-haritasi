import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Shield } from "lucide-react";
import Sidebar from "../components/Sidebar"; 
import { authService } from "../api/auth";
import loginStyles from "../styles/Login.module.css";    // Page grid container styles
import cardStyles from "../styles/AuthCard.module.css";  // Specific login-card panel dimensions

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

        if (!email || !newPassword) {
            setError("Lütfen tüm alanları doldurun.");
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
                    
                    {/* Reusing cardStyles instead of loginStyles forces the card to match login width constraints */}
                    <div className={cardStyles.card}>
                        <div className={cardStyles.logo}>
                            <div className={cardStyles.logoIcon}>
                                <Shield className={cardStyles.logoIconInner} />
                            </div>
                            <div>
                                <span className={cardStyles.logoTitle}>AFAD</span>
                                <p className={cardStyles.logoSubtitle}>Yönetici Paneli</p>
                            </div>
                        </div>

                        {/* Title block formatted identically to your "Yönetici Girişi" */}
                        <h1 className={cardStyles.title} style={{ marginTop: "24px" }}>Şifre Güncelle</h1>
                        <p className={cardStyles.subtitle}>Ankara Afet Yönetim Sistemi</p>

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

                    {/* Lower branding links */}
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