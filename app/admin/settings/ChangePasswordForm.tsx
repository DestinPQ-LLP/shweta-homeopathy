'use client';
import { useState } from 'react';
import styles from './settings.module.css';

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(false);

    if (!current || !next || !confirm) { setError('All fields are required'); return; }
    if (next.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (next !== confirm) { setError('New passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.pwForm} onSubmit={submit} noValidate>
      <div className={styles.pwField}>
        <label className={styles.pwLabel} htmlFor="current-pw">Current Password</label>
        <input
          id="current-pw"
          type="password"
          className={styles.pwInput}
          value={current}
          onChange={e => { setCurrent(e.target.value); setError(''); setSuccess(false); }}
          autoComplete="current-password"
          placeholder="Enter current password"
        />
      </div>
      <div className={styles.pwField}>
        <label className={styles.pwLabel} htmlFor="new-pw">New Password</label>
        <input
          id="new-pw"
          type="password"
          className={styles.pwInput}
          value={next}
          onChange={e => { setNext(e.target.value); setError(''); setSuccess(false); }}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </div>
      <div className={styles.pwField}>
        <label className={styles.pwLabel} htmlFor="confirm-pw">Confirm New Password</label>
        <input
          id="confirm-pw"
          type="password"
          className={styles.pwInput}
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setError(''); setSuccess(false); }}
          autoComplete="new-password"
          placeholder="Repeat new password"
        />
      </div>
      {error && <p className={styles.pwError}>{error}</p>}
      {success && <p className={styles.pwSuccess}>Password changed successfully. Use the new password on your next sign-in.</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving…' : 'Change Password'}
      </button>
    </form>
  );
}
