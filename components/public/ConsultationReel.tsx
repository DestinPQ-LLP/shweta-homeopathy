'use client';

import styles from './ConsultationReel.module.css';

const steps = [
  {
    num: '01',
    title: 'Arrival & Welcome',
    body: 'You step in — or connect online — to a calm, unhurried space. Tea is offered. The pace slows down before anything medical begins.',
  },
  {
    num: '02',
    title: 'Your Story, Uninterrupted',
    body: 'Dr. Shweta listens without interruption. Your narrative — childhood, fears, patterns, a recurring dream — is medicine in itself.',
  },
  {
    num: '03',
    title: 'Understanding the Whole You',
    body: 'Homeopathy asks unusual questions. Sleep position, food cravings, what worsens your symptoms at 3 AM — all are clues to the remedy.',
  },
  {
    num: '04',
    title: 'The Remedy Decision',
    body: 'Based on constitutional totality, a single most-similar remedy is selected — not a protocol, but a precise individualised match.',
  },
  {
    num: '05',
    title: 'Your Healing Plan',
    body: 'You leave with a clear path: remedy, diet notes, follow-up schedule. Healing begins before you reach the door.',
  },
];

export default function ConsultationReel() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>What happens in a session</p>
        <h2 className={styles.heading}>Inside a Consultation</h2>
        <div className={styles.reel}>
          {steps.map((step, i) => (
            <div key={step.num} className={styles.step}>
              <div className={styles.marker}>
                <span className={styles.markerNum}>{step.num}</span>
                {i < steps.length - 1 && <span className={styles.markerLine} />}
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{step.title}</h3>
                <p className={styles.body}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
