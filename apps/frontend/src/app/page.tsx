import styles from "./page.module.css";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      {/* ─── Header ─────────────────────────────────────── */}
      <header className={styles.header} id="dashboard-header">
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>S</div>
            <div>
              <div className={styles.logoText}>SpendWise AI</div>
              <div className={styles.logoSubtext}>Multi-Agent Orchestrator</div>
            </div>
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={`${styles.navLink} ${styles.navLinkActive}`}>Dashboard</Link>
            <Link href="/profile" className={styles.navLink}>Profile</Link>
          </nav>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.envBadge}>
            <span className={styles.envDot}></span>
            Production
          </div>
          <Link href="/login" className={styles.signInBtn} id="nav-signin">
            Sign In
          </Link>
          <Link href="/profile" className={styles.avatarLink} id="nav-profile">
            <div className={styles.headerAvatar}>CH</div>
          </Link>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────── */}
      <main className={styles.main}>

        {/* ─── Stats Grid ─────────────────────────────── */}
        <section className={styles.statsGrid}>
          <div className={`glass-card ${styles.statCard} animate-slide-up delay-1`}>
            <div className={styles.statLabel}>Agent Tasks Today</div>
            <div className={`${styles.statValue} ${styles.blue}`}>1,247</div>
            <div className={styles.statChange}>↑ 12.5% from yesterday</div>
          </div>
          <div className={`glass-card ${styles.statCard} animate-slide-up delay-2`}>
            <div className={styles.statLabel}>Success Rate</div>
            <div className={`${styles.statValue} ${styles.green}`}>99.2%</div>
            <div className={styles.statChange}>↑ 0.3% improvement</div>
          </div>
          <div className={`glass-card ${styles.statCard} animate-slide-up delay-3`}>
            <div className={styles.statLabel}>Avg Response Time</div>
            <div className={`${styles.statValue} ${styles.orange}`}>142ms</div>
            <div className={styles.statChange}>↓ 8ms faster</div>
          </div>
          <div className={`glass-card ${styles.statCard} animate-slide-up delay-4`}>
            <div className={styles.statLabel}>Active Connections</div>
            <div className={`${styles.statValue} ${styles.cyan}`}>342</div>
            <div className={styles.statChange}>↑ 23 new today</div>
          </div>
        </section>

        {/* ─── Content Grid ───────────────────────────── */}
        <section className={styles.contentGrid}>

          {/* ─── Agent Status Panel ─────────────────── */}
          <div className={`glass-card ${styles.agentPanel} animate-slide-up delay-2`} id="agent-status-panel">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>🤖 Agent Orchestration</h2>
                <div className={styles.sectionSubtitle}>Real-time agent status & routing</div>
              </div>
              <span className="badge badge--active">All Active</span>
            </div>
            <div className={styles.agentList}>
              {/* UX Guardian */}
              <div className={styles.agentCard}>
                <div className={`${styles.agentIcon} ${styles.ux}`}>🛡️</div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>UX Guardian</div>
                  <div className={styles.agentDesc}>
                    Validates Next.js route integrity, manages hydration states, monitors UI performance.
                  </div>
                  <div className={styles.agentMeta}>
                    <span className={styles.agentMetaItem}>⚡ 23ms avg</span>
                    <span className={styles.agentMetaItem}>📊 412 tasks</span>
                    <span className="badge badge--active" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Node-Flow Agent */}
              <div className={styles.agentCard}>
                <div className={`${styles.agentIcon} ${styles.node}`}>⚡</div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>Node-Flow Agent</div>
                  <div className={styles.agentDesc}>
                    Handles dynamic JSON schema transformations and manages WebSocket connections.
                  </div>
                  <div className={styles.agentMeta}>
                    <span className={styles.agentMetaItem}>⚡ 45ms avg</span>
                    <span className={styles.agentMetaItem}>📊 538 tasks</span>
                    <span className="badge badge--active" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Java-Core Agent */}
              <div className={styles.agentCard}>
                <div className={`${styles.agentIcon} ${styles.java}`}>☕</div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>Java-Core Agent</div>
                  <div className={styles.agentDesc}>
                    Oversees complex MongoDB transactions, JPA mappings, and heavy computational tasks.
                  </div>
                  <div className={styles.agentMeta}>
                    <span className={styles.agentMetaItem}>⚡ 189ms avg</span>
                    <span className={styles.agentMetaItem}>📊 297 tasks</span>
                    <span className="badge badge--active" style={{ fontSize: '10px', padding: '2px 8px' }}>Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Service Health ─────────────────────── */}
          <div className={`glass-card ${styles.healthPanel} animate-slide-up delay-3`} id="system-health">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>🩺 Service Health</h2>
                <div className={styles.sectionSubtitle}>Infrastructure status</div>
              </div>
            </div>
            <div className={styles.healthList}>
              <div className={styles.healthItem} data-service="frontend">
                <div className={styles.healthItemLeft}>
                  <div className={`${styles.healthDot} ${styles.healthy}`}></div>
                  <div>
                    <div className={styles.healthServiceName}>Frontend (Next.js)</div>
                    <div className={styles.healthServiceUrl}>:3000</div>
                  </div>
                </div>
                <div className={styles.healthLatency}>12ms</div>
              </div>

              <div className={styles.healthItem} data-service="node">
                <div className={styles.healthItemLeft}>
                  <div className={`${styles.healthDot} ${styles.healthy}`}></div>
                  <div>
                    <div className={styles.healthServiceName}>Service Node</div>
                    <div className={styles.healthServiceUrl}>:4000</div>
                  </div>
                </div>
                <div className={styles.healthLatency}>8ms</div>
              </div>

              <div className={styles.healthItem} data-service="java">
                <div className={styles.healthItemLeft}>
                  <div className={`${styles.healthDot} ${styles.healthy}`}></div>
                  <div>
                    <div className={styles.healthServiceName}>Service Java</div>
                    <div className={styles.healthServiceUrl}>:8080</div>
                  </div>
                </div>
                <div className={styles.healthLatency}>24ms</div>
              </div>

              <div className={styles.healthItem}>
                <div className={styles.healthItemLeft}>
                  <div className={`${styles.healthDot} ${styles.healthy}`}></div>
                  <div>
                    <div className={styles.healthServiceName}>MongoDB Atlas</div>
                    <div className={styles.healthServiceUrl}>M0 Cluster</div>
                  </div>
                </div>
                <div className={styles.healthLatency}>3ms</div>
              </div>
            </div>
          </div>

          {/* ─── Architecture ──────────────────────── */}
          <div className={`glass-card ${styles.archPanel} animate-slide-up delay-4`}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>🏗️ Architecture</h2>
                <div className={styles.sectionSubtitle}>System topology & data flow</div>
              </div>
            </div>
            <div className={styles.archDiagram}>
              <div className={styles.archNode}>
                <div className={styles.archNodeTitle}>🌐 Next.js</div>
                <div className={styles.archNodeSub}>Frontend · SSR</div>
              </div>
              <div className={styles.archArrow}>→</div>
              <div className={styles.archNode} style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <div className={styles.archNodeTitle}>🤖 Orchestrator</div>
                <div className={styles.archNodeSub}>LangGraph · Routing</div>
              </div>
              <div className={styles.archArrow}>⇄</div>
              <div className={styles.archNode}>
                <div className={styles.archNodeTitle}>⚡ Node / ☕ Java</div>
                <div className={styles.archNodeSub}>Backend Services</div>
              </div>
            </div>
          </div>

          {/* ─── Activity Feed ─────────────────────── */}
          <div className={`glass-card ${styles.activityPanel} animate-slide-up delay-5`}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>📡 Activity Feed</h2>
                <div className={styles.sectionSubtitle}>Recent agent actions & events</div>
              </div>
            </div>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.green}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}><strong>Java-Core Agent</strong> completed batch transaction processing (1,200 records)</div>
                </div>
                <span className={styles.activityTime}>2m ago</span>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.blue}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}><strong>UX Guardian</strong> validated hydration state on /dashboard route</div>
                </div>
                <span className={styles.activityTime}>5m ago</span>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.purple}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}><strong>Orchestrator</strong> triggered Reflection Loop → rerouted task to Node-Flow Agent</div>
                </div>
                <span className={styles.activityTime}>8m ago</span>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.orange}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}><strong>Node-Flow Agent</strong> transformed 3 JSON schemas for WebSocket broadcast</div>
                </div>
                <span className={styles.activityTime}>12m ago</span>
              </div>
              <div className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles.green}`}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}><strong>Java-Core Agent</strong> completed MongoDB aggregation pipeline (daily summary)</div>
                </div>
                <span className={styles.activityTime}>15m ago</span>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
