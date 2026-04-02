'use client';

import { MapPin, Phone, Clock } from 'lucide-react';
import styles from './ClinicFootprintBand.module.css';

const locations = [
  {
    city: 'Zirakpur',
    subtitle: 'Main Clinic',
    address: 'SCO 15, Peer Muchalla, Zirakpur, Punjab 140603',
    phone: '+91 98765 43210',
    hours: 'Mon–Sat: 9 AM – 7 PM',
  },
  {
    city: 'Budhlada',
    subtitle: 'Branch Clinic',
    address: 'Near Bus Stand, Budhlada, Mansa, Punjab 151502',
    phone: '+91 98765 43211',
    hours: 'Tue & Fri: 10 AM – 4 PM',
  },
  {
    city: 'Online',
    subtitle: 'Anywhere in the world',
    address: 'Video consultations via WhatsApp, Zoom, or Google Meet',
    phone: '+91 98765 43210',
    hours: 'Flexible scheduling',
  },
];

export default function ClinicFootprintBand() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Where we heal</p>
        <h2 className={styles.heading}>Our Clinics</h2>
        <div className={styles.grid}>
          {locations.map((loc, i) => (
            <div key={loc.city} className={`${styles.card} ${i === 2 ? styles.cardOnline : ''}`}>
              <div className={styles.cardTop}>
                <span className={styles.dot} />
                <div>
                  <p className={styles.city}>{loc.city}</p>
                  <p className={styles.subtitle}>{loc.subtitle}</p>
                </div>
              </div>
              <ul className={styles.details}>
                <li>
                  <MapPin size={14} className={styles.detailIcon} />
                  <span>{loc.address}</span>
                </li>
                <li>
                  <Phone size={14} className={styles.detailIcon} />
                  <span>{loc.phone}</span>
                </li>
                <li>
                  <Clock size={14} className={styles.detailIcon} />
                  <span>{loc.hours}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
