import { Mail, Lock, Eye, EyeOff, User, AlertCircle, FileKey2, Shield } from "lucide-react";
import styles from "../styles/AuthCard.module.css";

export default function AuthCard({
    tab, setTab,
    showPass, setShowPass,
    showRequestPass, setShowRequestPass,
    capsLock, setCapsLock,
    onLogin,
    onRegister,
    onChangePassword // Added prop for redirection to the Update Password page
}) {
    return (
        <div className={styles.card}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <Shield className={styles.logoIconInner} />
                </div>
                <div>
                    <span className={styles.logoTitle}>AFAD</span>
                    <p className={styles.logoSubtitle}>Yönetici Paneli</p>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    onClick={() => setTab("giris")}
                    className={`${styles.tabButton} ${tab === "giris" ? styles.tabActive : styles.tabInactive}`}
                >
                    GİRİŞ YAP
                    {tab === "giris" && <span className={styles.tabUnderline} />}
                </button>
                <button
                    onClick={() => setTab("yetki")}
                    className={`${styles.tabButton} ${tab === "yetki" ? styles.tabActive : styles.tabInactive}`}
                >
                    KAYIT OL
                    {tab === "yetki" && <span className={styles.tabUnderline} />}
                </button>
            </div>

            {tab === "giris" && (
                <>
                    <h1 className={styles.title}>Yönetici Girişi</h1>
                    <p className={styles.subtitle}>Ankara Afet Yönetim Sistemi</p>
                    <form className={styles.form} onSubmit={onLogin}>
                        <div>
                            <label className={styles.label}>E-POSTA</label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.inputIcon} />
                                <input type="email" name="email" placeholder="yonetici@afad.gov.tr" className={styles.input} />
                            </div>
                        </div>
                        <div>
                            <div className={styles.headerRight}>
                                <label className={styles.label}>ŞİFRE</label>
                                {/* Added onClick event handler to trigger the navigation function */}
                                <a 
                                    href="#" 
                                    className={styles.forgotPassword}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onChangePassword) onChangePassword();
                                    }}
                                >
                                    Şifremi Unuttum?
                                </a>
                            </div>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} />
                                <input
                                    type={showPass ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className={styles.inputPassword}
                                    onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className={styles.passwordToggle}>
                                    {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                            {capsLock && (
                                <div className={styles.capsLockWarning}>
                                    <AlertCircle size={16} /> Caps Lock açık
                                </div>
                            )}
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            <Lock size={20} className={styles.submitIcon} /> GİRİŞ YAP
                        </button>
                    </form>
                </>
            )}

            {tab === "yetki" && (
                <>
                    <h1 className={styles.title}>Kayıt Ol</h1>
                    <p className={styles.subtitle}>Yönetici hesabı oluşturmak için bilgilerinizi girin</p>
                    <form className={styles.registerForm} onSubmit={onRegister}>
                        <div>
                            <label className={styles.registerLabel}>AD SOYAD</label>
                            <div className={styles.inputWrapper}>
                                <User className={styles.registerIcon} />
                                <input type="text" name="name" placeholder="Ahmet Yılmaz" className={styles.registerInput} />
                            </div>
                        </div>
                        <div>
                            <label className={styles.registerLabel}>E-POSTA</label>
                            <div className={styles.inputWrapper}>
                                <Mail className={styles.registerIcon} />
                                <input type="email" name="email" placeholder="ornek@afad.gov.tr" className={styles.registerInput} />
                            </div>
                        </div>
                        <div>
                            <label className={styles.registerLabel}>ŞİFRE</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.registerIcon} />
                                <input
                                    type={showRequestPass ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className={styles.registerInputPassword}
                                />
                                <button type="button" onClick={() => setShowRequestPass(!showRequestPass)} className={styles.registerPasswordToggle}>
                                    {showRequestPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className={styles.registerSubmit}>
                            <FileKey2 size={18} className={styles.registerSubmitIcon} /> KAYIT OL
                        </button>
                    </form>
                    <p className={styles.registerLink}>
                        Zaten hesabınız var mı? <button onClick={() => setTab("giris")} className={styles.registerLinkButton}>Giriş Yap</button>
                    </p>
                </>
            )}
        </div>
    );
}