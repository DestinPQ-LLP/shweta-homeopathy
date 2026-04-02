'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError('Password is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>𓆸</div>
          <div className={styles.logoText}>
            <h2>Dr. Shweta&apos;s</h2>
            <p>ADMIN PANEL</p>
          </div>
        </div>

        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Enter the admin password to continue.</p>

        <form className={styles.form} onSubmit={submit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`${styles.input}${error ? ` ${styles.error}` : ''}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Admin password"
              autoFocus
            />
          </div>
          {error && <p className={styles.errMsg}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><span className={styles.spinner} />&nbsp;Signing in…</> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
