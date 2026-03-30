import { MessageCircle, Phone, MapPin } from 'lucide-react';
import type { LandingConfig } from '@/lib/landing';
import styles from './AdsFooter.module.css';

interface Props {
  config: LandingConfig;
}

export default function AdsFooter({ config }: Props) {
  const waUrl = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(config.whatsapp_message)}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Final CTA */}
        <div className={styles.ctaBlock}>
          <span className={styles.logoMark}>𓆸</span>
          <h3 className={styles.ctaTitle}>Ready to Start Your Healing Journey?</h3>
          <p className={styles.ctaSub}>
            Speak directly with Dr. Shweta — no waiting rooms, no rushed appointments.
          </p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
            <MessageCircle size={20} />
            {config.cta_text}
          </a>
        </div>

        {/* Contact row */}
        <div className={styles.contactRow}>
          <a href={`tel:+${config.whatsapp_number.replace(/\D/g, '')}`} className={styles.contactItem}>
            <Phone size={16} />
            +91 62844 11753
          </a>
          <a
            href="https://wa.me/916284411753"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactItem}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <span className={styles.contactItem}>
            <MapPin size={16} />
            Zirakpur &amp; Budhlada, Punjab
          </span>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Dr. Shweta Goyal Homoeopathy. All rights reserved.</p>
          <div className={styles.links}>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
