import { Award, Microscope, Globe, Hospital, Laptop, Phone } from 'lucide-react';
import styles from './ProofRibbon.module.css';

const items = [
  { icon: <Award size={18} />, text: 'Gold Medalist — Panjab University' },
  { icon: <Microscope size={18} />, text: 'MD in Homeopathy' },
  { icon: <Globe size={18} />, text: 'PG · IACH, Greece' },
  { icon: <Hospital size={18} />, text: 'Clinics in Zirakpur & Budhlada' },
  { icon: <Laptop size={18} />, text: 'Online Worldwide' },
  { icon: <Phone size={18} />, text: '+91 62844 11753' },
];

export default function ProofRibbon() {
  return (
    <div className={styles.ribbon} aria-label="Credentials">
      <div className={styles.track}>
        {/* Duplicate list for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.text}</span>
            <span className={styles.dot} aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}
