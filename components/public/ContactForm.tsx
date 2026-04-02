'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from './ContactForm.module.css';

interface Fields { name: string; email: string; phone: string; subject: string; message: string; }
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!f.email.trim()) e.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email';
  if (!f.message.trim()) e.message = 'Message is required';
  return e;
}

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const change = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      if (!res.ok) throw new Error((await res.json()).error || 'Error');
      setSuccess(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.successBox}>
        <div style={{ marginBottom: 'var(--space-4)', color: 'var(--clr-forest)' }}>
          <CheckCircle2 size={40} />
        </div>
        <h3>Message received!</h3>
        <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-name">Name<span className={styles.required}>*</span></label>
          <input id="c-name" className={`${styles.input}${errors.name ? ` ${styles.error}` : ''}`} value={fields.name} onChange={change('name')} placeholder="Your full name" />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-email">Email<span className={styles.required}>*</span></label>
          <input id="c-email" type="email" className={`${styles.input}${errors.email ? ` ${styles.error}` : ''}`} value={fields.email} onChange={change('email')} placeholder="you@example.com" />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-phone">Phone</label>
          <input id="c-phone" className={styles.input} value={fields.phone} onChange={change('phone')} placeholder="+91 XXXXX XXXXX" />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-subject">Subject</label>
          <input id="c-subject" className={styles.input} value={fields.subject} onChange={change('subject')} placeholder="e.g. Appointment enquiry" />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="c-message">Message<span className={styles.required}>*</span></label>
        <textarea id="c-message" className={`${styles.textarea}${errors.message ? ` ${styles.error}` : ''}`} value={fields.message} onChange={change('message')} placeholder="Tell us how we can help you…" />
        {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.submit}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? <><span className={styles.spinner} /> Sending…</> : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
