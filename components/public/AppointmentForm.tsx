'use client';
import { useState, useTransition, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './AppointmentForm.module.css';
import { DEFAULT_PRICING, getPricingByCountry, type PriceEntry } from '@/lib/pricing';

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '3:00 PM – 5:00 PM',
  '5:00 PM – 7:00 PM',
  'Online – Flexible timing',
];

const CONCERNS = [
  'Skin Disease', "Women's Health / PCOD", 'Joint Problems / Arthritis',
  'Thyroid Disorders', 'Depression / Anxiety', 'Pediatric Issues',
  'Respiratory / Asthma', 'Diabetes', 'Hair Loss / Alopecia',
  'Gastrointestinal', 'Cancer Support', 'Geriatric Care', 'Other',
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  concern: string;
  preferredTime: string;
  consultationType: 'in-clinic' | 'online';
  message: string;
}

const INITIAL: FormData = {
  name: '', email: '', phone: '', age: '',
  concern: '', preferredTime: '', consultationType: 'in-clinic', message: '',
};

export default function AppointmentForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [pricing, setPricing] = useState<PriceEntry>(DEFAULT_PRICING);
  const [showPricing, setShowPricing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll while modal is open to prevent layout shift / flicker.
  useEffect(() => {
    if (!showPricing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showPricing]);

  useEffect(() => {
    if (submitError) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [submitError]);

  // Detect visitor country once to pick the right consultation fee.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/geo')
      .then((r) => r.json())
      .then((d: { country?: string }) => {
        if (!cancelled) setPricing(getPricingByCountry(d?.country));
      })
      .catch(() => { /* keep DEFAULT_PRICING */ });
    return () => { cancelled = true; };
  }, []);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    const digitsOnly = form.phone.replace(/[\s\-().+]/g, '').replace(/^91/, '');
    if (!digitsOnly.match(/^[6-9]\d{9}$/)) e.phone = 'Valid 10-digit Indian mobile number required';
    if (!form.concern) e.concern = 'Please select a concern';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (submitError) setSubmitError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    // Show pricing modal — only submit after the user confirms.
    setShowPricing(true);
  }

  function handleDeclinePricing() {
    // No POST, no email. Just close the modal.
    setShowPricing(false);
  }

  function handleConfirmPricing() {
    setShowPricing(false);
    startTransition(async () => {
      try {
        const res = await fetch('/api/appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            consultationFee: pricing.fee,
            consultationCountry: pricing.country,
            consultationCountryCode: pricing.countryCode,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          if (res.status === 400 && body?.error) {
            setSubmitError(body.error);
          } else {
            setSubmitError(
              "We couldn't submit your request right now. Please try again in a moment, or reach us directly at +91 62844 11753.",
            );
          }
          return;
        }
        router.push('/thank-you');
      } catch {
        setSubmitError(
          "We couldn't submit your request right now. Please try again in a moment, or reach us directly at +91 62844 11753.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* Personal info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Personal Information</h3>
        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="appt-name">Full Name *</label>
            <input id="appt-name" name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="appt-age">Age</label>
            <input id="appt-age" name="age" className="form-input" value={form.age} onChange={handleChange} type="number" min="0" max="120" placeholder="Your age" />
          </div>
        </div>
        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="appt-email">Email Address *</label>
            <input id="appt-email" name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder="you@email.com" autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="appt-phone">Phone Number *</label>
            <input id="appt-phone" name="phone" type="tel" className="form-input" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" autoComplete="tel" />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
        </div>
      </div>

      {/* Appointment details */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Appointment Details</h3>
        <div className={styles.consultTypes}>
          {(['in-clinic', 'online'] as const).map((type) => (
            <label key={type} className={`${styles.consultType} ${form.consultationType === type ? styles.selected : ''}`}>
              <input type="radio" name="consultationType" value={type} checked={form.consultationType === type} onChange={handleChange} style={{ position: 'absolute', opacity: 0 }} />
              <Image
                src={type === 'in-clinic' ? '/images/clinic-visit.png' : '/images/online-consult.png'}
                alt={type === 'in-clinic' ? 'In-clinic visit' : 'Online consultation'}
                width={80} height={80}
                className={styles.consultImg}
              />
              <span className={styles.consultLabel}>{type === 'in-clinic' ? 'In-Clinic Visit' : 'Online Consultation'}</span>
              <span className={styles.consultSub}>{type === 'in-clinic' ? 'Zirakpur or Budhlada' : 'Worldwide via video call'}</span>
            </label>
          ))}
        </div>

        <div className={styles.grid2} style={{ marginTop: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="appt-concern">Primary Concern *</label>
            <select id="appt-concern" name="concern" className="form-select" value={form.concern} onChange={handleChange}>
              <option value="">Select your primary concern</option>
              {CONCERNS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.concern && <span className="form-error">{errors.concern}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="appt-time">Preferred Time Slot</label>
            <select id="appt-time" name="preferredTime" className="form-select" value={form.preferredTime} onChange={handleChange}>
              <option value="">Any time is fine</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="appt-message">Brief Description of Your Concern</label>
          <textarea id="appt-message" name="message" className="form-textarea" value={form.message} onChange={handleChange}
            placeholder="Describe your symptoms, how long you've had them, any treatments tried, etc. (optional but helpful)" rows={5} />
          <span className="form-hint">This helps Dr. Shweta prepare for your consultation.</span>
        </div>
      </div>

      <button
        type="submit"
        id="appointment-submit-btn"
        className="btn btn-primary btn-lg"
        disabled={isPending}
        style={{ width: '100%', justifyContent: 'center', opacity: isPending ? 0.7 : 1 }}
      >
        {isPending ? 'Submitting...' : 'Request Appointment'}
      </button>

      {submitError && (
        <div ref={errorRef} className={styles.submitError} role="alert">
          <span className={styles.submitErrorIcon}>!</span>
          <p>{submitError}</p>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--clr-text-lt)', marginTop: 'var(--space-3)' }}>
        We will contact you within 24 hours to confirm your slot. Your information is kept confidential.
      </p>

      {showPricing && mounted && createPortal(
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pricing-modal-title"
          onClick={handleDeclinePricing}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 id="pricing-modal-title" className={styles.modalTitle}>
              Confirm Consultation
            </h3>
            <p className={styles.modalFee}>
              45-minute consultation fee: <strong>{pricing.fee}</strong>
            </p>
            <p className={styles.modalSub}>
              You may first choose a free 15-minute intro call. Payment is collected only after you select and book your consultation slot with us.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`btn btn-secondary ${styles.modalBtn}`}
                onClick={handleDeclinePricing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-primary ${styles.modalBtn}`}
                onClick={handleConfirmPricing}
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </form>
  );
}
