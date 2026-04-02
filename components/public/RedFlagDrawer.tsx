'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import styles from './RedFlagDrawer.module.css';

const RED_FLAGS = [
  'Sudden, severe chest pain or difficulty breathing',
  'High fever (over 104°F / 40°C) especially in children',
  'Sudden loss of consciousness or seizure',
  'Severe allergic reaction (swelling, hives, throat closing)',
  'Uncontrolled bleeding or trauma',
  'Stroke symptoms — facial drooping, arm weakness, slurred speech',
];

export default function RedFlagDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.drawer} id="safety">
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.triggerLeft}>
          <AlertTriangle size={18} className={styles.triggerIcon} />
          <span>
            <strong>Safety First</strong>&nbsp;— When to Seek Emergency Care
          </span>
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className={styles.body}>
          <p className={styles.preamble}>
            Homeopathy is a complementary therapy. Always seek emergency medical care for:
          </p>
          <ul className={styles.list}>
            {RED_FLAGS.map((flag) => (
              <li key={flag} className={styles.item}>
                <AlertTriangle size={14} className={styles.itemIcon} />
                {flag}
              </li>
            ))}
          </ul>
          <a href="tel:112" className={styles.emergencyBtn}>
            <Phone size={16} /> Emergency: 112
          </a>
        </div>
      )}
    </div>
  );
}
