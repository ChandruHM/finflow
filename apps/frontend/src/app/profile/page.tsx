import type { Metadata } from "next";
import styles from "./profile.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile — SpendWise AI",
  description: "Manage your SpendWise AI profile, view spending health score, connected agents, and account settings.",
};

export default function ProfilePage() {
  return (
    <div className={styles.profilePage}>
      {/* ─── Header ─────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoIcon}>S</div>
            <div className={styles.logoText}>SpendWise AI</div>
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Dashboard</Link>
            <Link href="/profile" className={`${styles.navLink} ${styles.navLinkActive}`}>Profile</Link>
          </nav>
        </div>
        <div className={styles.headerActions}>
          <Link href="/login" className={styles.signInBtn}>Sign In</Link>
          <Link href="/profile" className={styles.avatarLinkNav}>
            <div className={styles.headerAvatar}>CH</div>
          </Link>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────── */}
      <main className={styles.main}>

        {/* ─── Profile Hero Card ──────────────────────── */}
        <div className={`glass-card ${styles.profileCard} animate-slide-up delay-1`}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>CH</div>
            <div className={styles.avatarBadge}>✓</div>
          </div>

          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>Chandru HM</h2>
            <p className={styles.profileEmail}>chandru@spendwise.ai</p>
            <div className={styles.profileMeta}>
              <span className={styles.metaItem}>
                <span className={styles.metaIcon}>📍</span> Bangalore, India
              </span>
              <span className={styles.metaItem}>
                <span className={styles.metaIcon}>📅</span> Joined Mar 2026
              </span>
              <span className="badge badge--active">Pro Plan</span>
            </div>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.statBox}>
              <div className={`${styles.statNumber} ${styles.blue}`}>1,247</div>
              <div className={styles.statCaption}>Expenses</div>
            </div>
            <div className={styles.statBox}>
              <div className={`${styles.statNumber} ${styles.green}`}>87</div>
              <div className={styles.statCaption}>Health</div>
            </div>
            <div className={styles.statBox}>
              <div className={`${styles.statNumber} ${styles.purple}`}>14</div>
              <div className={styles.statCaption}>Categories</div>
            </div>
          </div>
        </div>

        {/* ─── Content Grid ───────────────────────────── */}
        <div className={styles.contentGrid}>

          {/* ─── Personal Information ─────────────────── */}
          <div className={`glass-card ${styles.sectionCard} animate-slide-up delay-2`}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>👤 Personal Information</h3>
              <button className={styles.editBtn}>Edit</button>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Full Name</span>
                <span className={styles.infoValue}>Chandru HM</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>chandru@spendwise.ai</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>+91 98765 43210</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Currency</span>
                <span className={styles.infoValue}>USD ($)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Timezone</span>
                <span className={styles.infoValue}>IST (UTC+5:30)</span>
              </div>
            </div>
          </div>

          {/* ─── Spending Health ──────────────────────── */}
          <div className={`glass-card ${styles.sectionCard} animate-slide-up delay-3`}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>📊 Spending Health</h3>
              <span className="badge badge--active">Excellent</span>
            </div>

            <div className={styles.healthScore}>
              <div className={`${styles.scoreCircle} ${styles.excellent}`}>
                <span className={styles.scoreNumber} style={{ color: 'var(--accent-green)' }}>87</span>
                <span className={styles.scoreLabel}>Score</span>
              </div>
              <div className={styles.healthDetails}>
                <div className={styles.healthTitle}>Great financial discipline!</div>
                <div className={styles.healthDescription}>
                  Your spending patterns are well-balanced across categories.
                  The Java-Core Agent flagged 2 minor insights this week.
                </div>
              </div>
            </div>

            <div className={styles.healthCategories}>
              <div className={styles.categoryBar}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>🍔 Food & Dining</span>
                  <span className={styles.categoryAmount}>$342.50</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.orange}`} style={{ width: '68%' }}></div>
                </div>
              </div>
              <div className={styles.categoryBar}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>🚗 Transportation</span>
                  <span className={styles.categoryAmount}>$186.00</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.blue}`} style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className={styles.categoryBar}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>🛒 Shopping</span>
                  <span className={styles.categoryAmount}>$128.75</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.purple}`} style={{ width: '32%' }}></div>
                </div>
              </div>
              <div className={styles.categoryBar}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>🎬 Entertainment</span>
                  <span className={styles.categoryAmount}>$65.00</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.cyan}`} style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Account Security ─────────────────────── */}
          <div className={`glass-card ${styles.sectionCard} animate-slide-up delay-3`}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>🔒 Account Security</h3>
              <button className={styles.editBtn}>Update</button>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Password</span>
                <span className={styles.infoValueMono}>••••••••••</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Two-Factor Auth</span>
                <span className="badge badge--active" style={{ fontSize: '11px' }}>Enabled</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Login Method</span>
                <span className={styles.infoValue}>Google OAuth</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Last Login</span>
                <span className={styles.infoValueMono}>Mar 25, 2026 · 2:45 AM</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Active Sessions</span>
                <span className={styles.infoValue}>2 devices</span>
              </div>
            </div>
          </div>

          {/* ─── Recent Agent Activity ────────────────── */}
          <div className={`glass-card ${styles.sectionCard} animate-slide-up delay-4`}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>🤖 Recent Agent Activity</h3>
            </div>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.green}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <strong>Java-Core Agent</strong> completed weekly spending audit — score: 87/100
                  </div>
                  <div className={styles.activityTime}>25 min ago</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.blue}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <strong>Node-Flow Agent</strong> categorized &quot;$8.50 latte&quot; → Food & Dining
                  </div>
                  <div className={styles.activityTime}>1 hour ago</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.orange}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <strong>Java-Core Agent</strong> flagged: 4 dining expenses this week
                  </div>
                  <div className={styles.activityTime}>3 hours ago</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.purple}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <strong>UX Guardian</strong> optimized dashboard load time to 1.1s LCP
                  </div>
                  <div className={styles.activityTime}>5 hours ago</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.green}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <strong>Node-Flow Agent</strong> processed &quot;$45 uber to airport&quot; → Transportation
                  </div>
                  <div className={styles.activityTime}>Yesterday</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Connected Agents (Full Width) ─────────── */}
          <div className={`glass-card ${styles.sectionCard} ${styles.fullWidthSection} animate-slide-up delay-4`}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>⚡ Connected Agents</h3>
              <span className="badge badge--active">All Online</span>
            </div>
            <div className={styles.agentsGrid}>
              {/* UX Guardian */}
              <div className={styles.agentCard}>
                <div className={styles.agentCardHeader}>
                  <div className={`${styles.agentIcon} ${styles.ux}`}>🛡️</div>
                  <div>
                    <div className={styles.agentName}>UX Guardian</div>
                    <div className={styles.agentRole}>Frontend Intelligence</div>
                  </div>
                </div>
                <div className={styles.agentDesc}>
                  Validates route integrity, monitors hydration states, and ensures optimal UI performance.
                </div>
                <div className={styles.agentStats}>
                  <span className={styles.agentStat}>⚡ 23ms</span>
                  <span className={styles.agentStat}>📊 412 tasks</span>
                  <span className="badge badge--active" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                </div>
              </div>

              {/* Node-Flow Agent */}
              <div className={styles.agentCard}>
                <div className={styles.agentCardHeader}>
                  <div className={`${styles.agentIcon} ${styles.node}`}>⚡</div>
                  <div>
                    <div className={styles.agentName}>Node-Flow Agent</div>
                    <div className={styles.agentRole}>NLP & Orchestration</div>
                  </div>
                </div>
                <div className={styles.agentDesc}>
                  Parses natural language expenses, categorizes with LLM, and manages real-time WebSocket events.
                </div>
                <div className={styles.agentStats}>
                  <span className={styles.agentStat}>⚡ 45ms</span>
                  <span className={styles.agentStat}>📊 538 tasks</span>
                  <span className="badge badge--active" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                </div>
              </div>

              {/* Java-Core Agent */}
              <div className={styles.agentCard}>
                <div className={styles.agentCardHeader}>
                  <div className={`${styles.agentIcon} ${styles.java}`}>☕</div>
                  <div>
                    <div className={styles.agentName}>Java-Core Agent</div>
                    <div className={styles.agentRole}>Financial Engine</div>
                  </div>
                </div>
                <div className={styles.agentDesc}>
                  Audits spending patterns with BigDecimal precision, generates health warnings and financial insights.
                </div>
                <div className={styles.agentStats}>
                  <span className={styles.agentStat}>⚡ 189ms</span>
                  <span className={styles.agentStat}>📊 297 tasks</span>
                  <span className="badge badge--active" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Danger Zone (Full Width) ─────────────── */}
          <div className={`glass-card ${styles.sectionCard} ${styles.fullWidthSection} ${styles.dangerSection} animate-slide-up delay-5`}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>⚠️ Danger Zone</h3>
            </div>
            <div className={styles.dangerActions}>
              <div className={styles.dangerItem}>
                <div className={styles.dangerInfo}>
                  <div className={styles.dangerLabel}>Export All Data</div>
                  <div className={styles.dangerDesc}>Download all your expenses as CSV. This may take a few minutes for large datasets.</div>
                </div>
                <button className={styles.dangerBtn}>Export</button>
              </div>
              <div className={styles.dangerItem}>
                <div className={styles.dangerInfo}>
                  <div className={styles.dangerLabel}>Reset Spending Data</div>
                  <div className={styles.dangerDesc}>Clear all expense history. Requires double confirmation per AGENTS.md safety rules.</div>
                </div>
                <button className={styles.dangerBtn}>Reset</button>
              </div>
              <div className={styles.dangerItem}>
                <div className={styles.dangerInfo}>
                  <div className={styles.dangerLabel}>Delete Account</div>
                  <div className={styles.dangerDesc}>Permanently remove your account and all associated data. This cannot be undone.</div>
                </div>
                <button className={styles.dangerBtn}>Delete</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
