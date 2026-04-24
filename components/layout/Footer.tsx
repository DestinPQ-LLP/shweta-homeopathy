import Link from 'next/link';
import { Phone, MessageCircle, CalendarCheck, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

const services = [
  { label: 'Alopecia & Hair Loss', href: '/conditions/alopecia-hair-loss' },
  { label: "Women's Health", href: '/conditions/womens-health' },
  { label: 'Joint Problems', href: '/conditions/joint-problems-arthritis' },
  { label: 'Depression & Anxiety', href: '/conditions/depression-anxiety' },
  { label: 'Skin Diseases', href: '/conditions/skin-diseases' },
  { label: 'Thyroid Disorders', href: '/conditions/thyroid-disorders' },
];

const quickLinks = [
  { label: 'About Doctor', href: '/about' },
  { label: 'All Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      {/* ── Action Dock ── */}
      <div className={styles.dock}>
        <div className="container">
          <div className={styles.dockGrid}>
            <a href="tel:+916284411753" className={`${styles.dockTile} glass-dark`}>
              <Phone size={22} className={styles.dockIcon} />
              <span className={styles.dockLabel}>Call Us</span>
              <span className={styles.dockSub}>+91 62844 11753</span>
            </a>
            <a
              href="https://wa.me/916284411753"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.dockTile} glass-dark`}
            >
              <MessageCircle size={22} className={styles.dockIcon} />
              <span className={styles.dockLabel}>WhatsApp</span>
              <span className={styles.dockSub}>Chat now</span>
            </a>
            <Link href="/appointment" className={`${styles.dockTile} ${styles.dockTileGold}`}>
              <CalendarCheck size={22} className={styles.dockIcon} />
              <span className={styles.dockLabel}>Book Appointment</span>
              <span className={styles.dockSub}>Online or In-Clinic</span>
            </Link>
            <a
              href="https://maps.app.goo.gl/Dr9n9oduRfBhsK9E7"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.dockTile} glass-dark`}
            >
              <MapPin size={22} className={styles.dockIcon} />
              <span className={styles.dockLabel}>Directions</span>
              <span className={styles.dockSub}>Zirakpur Clinic</span>
            </a>
          </div>
        </div>
      </div>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logoMark}>𓆸</div>
            <h3 className={styles.brandName}>Dr. Shweta Goyal</h3>
            <p className={styles.brandCreds}>BHMS (Gold Medalist) · MD (Hom) · PG IACH Greece · DNHE Delhi</p>
            <p className={styles.brandDesc}>
              Offering personalized classical homeopathic treatment for chronic and complex conditions.
              Clinics in Zirakpur & Budhlada, Punjab. Online consultations worldwide.
            </p>
            <div className={styles.contact}>
              <a href="tel:+916284411753" className={styles.contactItem}>
                <span>📞</span> +91 62844 11753
              </a>
              <a href="mailto:drshwetahmc@gmail.com" className={styles.contactItem}>
                <span>✉️</span> drshwetahmc@gmail.com
              </a>
              <div className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
                <span>📍</span>
                <div>
                  <strong>Zirakpur Clinic</strong><br />
                  Patiala Road, Above Vintage Properties, Zirakpur, Punjab – 140603<br />
                  +91 62844–11753 · Mon–Sun 9:30 am–6:30 pm
                </div>
              </div>
              <div className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
                <span>📍</span>
                <div>
                  <strong>Budhlada Clinic</strong><br />
                  Patel Marg, Near Railway Station, Budhlada, Mansa, Punjab – 151502<br />
                  +91 90564–62817 · Mon–Sun 9:00 am–6:00 pm
                </div>
              </div>
              <div className={styles.contactItem} style={{ alignItems: 'flex-start' }}>
                <span>💻</span>
                <div>
                  <strong>Online Consultations</strong><br />
                  Anywhere in the world — via WhatsApp, Zoom or Google Meet<br />
                  +91 62844–11753 · Flexible scheduling
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className={styles.colTitle}>Conditions Treated</h4>
            <ul className={styles.linkList}>
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className={styles.footerLink}>{s.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/services" className={styles.footerLink}>View All →</Link>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.footerLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className={styles.ctaCol}>
            <h4 className={styles.colTitle}>Book a Consultation</h4>
            <div className={styles.ctaInner}>
              <p className={styles.ctaText}>
                In-clinic or online. Free 10-minute introductory call available.
              </p>
              <Link href="/appointment" className="btn btn-gold" style={{ display: 'inline-flex' }}>
                Request Appointment
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {year} Dr. Shweta&apos;s Homoeopathy. All rights reserved.</p>
          <p className={styles.disclaimer}>
            This website is for informational purposes. Homeopathic treatment is complementary medicine. Please consult a qualified practitioner for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
