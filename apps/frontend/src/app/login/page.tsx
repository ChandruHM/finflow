import type { Metadata } from "next";
import styles from "./login.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In — SpendWise AI",
  description: "Sign in to your SpendWise AI account. Intelligent expense tracking powered by multi-agent orchestration.",
};

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      {/* ─── Left Panel — Branding ─────────────────────── */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <Link href="/" className={`${styles.brandLogo} animate-fade-in`}>
            <div className={styles.brandIcon}>S</div>
            <div className={styles.brandName}>SpendWise AI</div>
          </Link>

          <h1 className={`${styles.brandTagline} animate-slide-up delay-1`}>
            Track smarter.<br />
            Spend <span>wiser.</span>
          </h1>

          <p className={`${styles.brandDescription} animate-slide-up delay-2`}>
            Your AI-powered financial companion. Tell us what you spent in plain English
            — our multi-agent system categorizes, saves, and audits your expenses in real time.
          </p>

          <div className={`${styles.brandFeatures} animate-slide-up delay-3`}>
            <div className={styles.brandFeature}>
              <div className={`${styles.featureIcon} ${styles.blue}`}>🤖</div>
              <div className={styles.featureText}>
                <strong>AI-Powered Categorization</strong> — Just say &quot;$12 on a burger&quot;
              </div>
            </div>
            <div className={styles.brandFeature}>
              <div className={`${styles.featureIcon} ${styles.purple}`}>🔍</div>
              <div className={styles.featureText}>
                <strong>Smart Audit Engine</strong> — Detects spending patterns &amp; anomalies
              </div>
            </div>
            <div className={styles.brandFeature}>
              <div className={`${styles.featureIcon} ${styles.green}`}>📊</div>
              <div className={styles.featureText}>
                <strong>Real-Time Insights</strong> — Health score updated after every expense
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Login Form ──────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={`${styles.formHeader} animate-fade-in`}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>
              Don&apos;t have an account? <Link href="/login">Sign up free</Link>
            </p>
          </div>

          <form className={`${styles.form} animate-slide-up delay-1`} id="login-form">
            {/* Email */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="login-email">Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  id="login-email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="login-password">Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="login-password"
                  type="password"
                  className={styles.input}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" className={styles.passwordToggle} aria-label="Toggle password visibility">
                  👁
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className={styles.formOptions}>
              <label className={styles.checkboxGroup}>
                <input type="checkbox" className={styles.checkbox} id="remember-me" />
                <span className={styles.checkboxLabel}>Remember me</span>
              </label>
              <Link href="/login" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            {/* Submit */}
            <button type="submit" className={styles.submitBtn} id="login-submit">
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className={`${styles.divider} animate-slide-up delay-2`} style={{ margin: '24px 0' }}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or continue with</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Social Buttons */}
          <div className={`${styles.socialButtons} animate-slide-up delay-3`}>
            <button type="button" className={styles.socialBtn} id="login-google">
              <span className={styles.socialIcon}>G</span>
              Google
            </button>
            <button type="button" className={styles.socialBtn} id="login-github">
              <span className={styles.socialIcon}>⚡</span>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <div className={`${styles.formFooter} animate-slide-up delay-4`}>
            By signing in, you agree to our Terms of Service<br />
            and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
