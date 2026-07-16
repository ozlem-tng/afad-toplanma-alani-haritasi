import { Building, Users, AlertTriangle, Clock, Calendar, Bell } from "lucide-react";
import styles from "../styles/Sidebar.module.css";
// Importing Logo2.png from your assets
import logo2 from "../assets/Logo2.png";

export default function Sidebar({ currentTime }) {
    const statsItems = [
        { icon: Building, value: "247", label: "Toplanma Alanı" },
        { icon: Users, value: "15.2K", label: "Kullanıcı" },
        { icon: AlertTriangle, value: "4", label: "Aktif Alarm" },
        { icon: Clock, value: "7/24", label: "Hizmet" },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.bgPattern} />
            <div className={styles.glowTop} />
            <div className={styles.glowBottom} />

            <div className={styles.watermark}>AFAD</div>

            <div className={styles.content}>
                {/* TARİH / SAAT */}
                <div className={styles.header}>
                    <div className={styles.date}>
                        <Calendar size={15} />
                        <span>{currentTime.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className={styles.time}>
                        <Clock size={15} />
                        <span>{currentTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                </div>

                {/* LOGO / SLOGAN */}
                <div className={styles.logoSection}>
                    <div className={styles.logoWrapper}>
                        <div
                            className={styles.logoBox}
                            style={{
                                width: "120px",
                                height: "120px",
                                padding: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                borderRadius: "24px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                            }}
                        >
                            <img
                                src={logo2}
                                alt="ATİS Logo"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        </div>
                        <div className={styles.statusBadge}>
                            <div className={styles.statusDot} />
                        </div>
                    </div>
                    <h2 className={styles.logoText}>AFAD</h2>
                    <p className={styles.logoSub} style={{ textAlign: "center" }}>Afet Toplanma Alanı İşaretleme Sistemi</p>
                    <p className={styles.slogan}>Her nokta bir güven, her işaret bir hayat.</p>
                </div>

                {/* İSTATİSTİKLER */}
                <div className={styles.statsGrid}>
                    {statsItems.map((item, index) => (
                        <div key={index} className={styles.statCard}>
                            <item.icon className={styles.statIcon} />
                            <p className={styles.statValue}>{item.value}</p>
                            <p className={styles.statLabel}>{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* DUYURULAR */}
                <div className={styles.announcements}>
                    <div className={styles.announceHeader}>
                        <div className={styles.announceTitle}>
                            <Bell size={14} className={styles.bellIcon} />
                            <span>Duyurular</span>
                        </div>
                        <span className={styles.announceBadge}>3 yeni</span>
                    </div>
                    <div className={styles.announceList}>
                        <div className={styles.announceItem}>
                            <div className={styles.bullet} />
                            <span>Yeni tahliye planı eklendi</span>
                        </div>
                        <div className={styles.announceItem}>
                            <div className={styles.bullet} />
                            <span>Meteoroloji turuncu uyarı</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}