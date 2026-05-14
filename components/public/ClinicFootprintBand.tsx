'use client';

import Image from 'next/image';
import { MapPin, Phone, Clock } from 'lucide-react';
import styles from './ClinicFootprintBand.module.css';

const locations = [
  {
    city: 'Zirakpur',
    subtitle: 'Main Clinic',
    address: 'Patiala Road, Above Vintage Properties, Zirakpur, Punjab -140603',
    phone: '+91 62844-11753',
    hours: 'Mon–Sun · 9:30 am–6:30 pm',
    photo: '/images/clinic-zirakpur.jpg',
  },
  {
    city: 'Budhlada',
    subtitle: 'Branch Clinic',
    address: 'Patel Marg, Near Railway Station, Budhlada, Mansa, Punjab – 151502',
    phone: '+91 90564-62817',
    hours: 'Mon–Sun · 9:00 am–6:00 pm',
    photo: '/images/clinic-budhlada.jpg',
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
              <div className={styles.cardPhoto}>
                <Image
                  src={loc.photo}
                  alt={`${loc.city} clinic`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
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
