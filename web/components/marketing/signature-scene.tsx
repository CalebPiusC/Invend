import { ArrowUpRight, Check, LockKeyhole, ShieldCheck } from 'lucide-react';
import styles from './signature-scene.module.css';
import { BrandIcon } from '../brand-icon';

export function SignatureScene() {
  return (
    <figure
      className={styles.scene}
      aria-label="A fictional Nigerian vendor, customer and assistant working within the vendor’s rules"
    >
      <div className={styles.canvas}>
        <div className={styles.sceneIndex}>
          <span>THE EVERYDAY STORE</span>
          <span>A FICTIONAL SALE / 001</span>
        </div>
        <div className={styles.portrait}>
          <img
            src="/images/vendor-studio.webp"
            srcSet="/images/vendor-studio-small.webp 480w, /images/vendor-studio.webp 800w"
            sizes="(max-width: 599px) 65vw, (max-width: 899px) 400px, 32vw"
            width="800"
            height="1000"
            fetchPriority="high"
            alt="AI-generated fictional Nigerian vendor Tola reviewing her phone while packing an indigo adire tote in her studio"
          />
          <div className={styles.owner}>
            <span className={styles.ownerDot} aria-hidden="true" />
            <span>
              <strong>Tola · business owner</strong>
              <span>The decisions stay with her.</span>
            </span>
          </div>
        </div>
        <svg className={styles.connection} viewBox="0 0 600 500" fill="none" aria-hidden="true">
          <path d="M165 150V207" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="4 5" />
          <circle cx="165" cy="155" r="3" fill="#D99A28" />
          <circle cx="165" cy="202" r="3" fill="#D99A28" />
        </svg>
        <div className={styles.rules}>
          <div>
            <LockKeyhole size={15} aria-hidden="true" />
            <span>01 / TOLA SETS THE RULES</span>
          </div>
          <strong>Never below ₦11,000 a tote.</strong>
          <p>Ask me about exceptions.</p>
        </div>
        <div className={styles.conversation}>
          <div className={styles.customer}>
            <span aria-hidden="true">A</span>
            <div>
              <strong>Amaka’s enquiry</strong>
              <span>02 / THE CUSTOMER ASKS</span>
            </div>
            <span className={styles.demoTag}>Demo</span>
          </div>
          <p className={styles.question}>“I love the adire tote. Can I get two for ₦20,000?”</p>
          <div className={styles.assistant}>
            <span className={styles.assistantMark} aria-hidden="true">
              <BrandIcon size={24} />
            </span>
            <div>
              <strong>Invend</strong>
              <span>03 / CHECKS THE BUSINESS FACTS</span>
            </div>
            <Check size={16} aria-hidden="true" />
          </div>
          <p className={styles.reply}>
            That’s below Tola’s minimum. The next step is an owner review—not a promise I can’t
            keep.
          </p>
          <a href="#team-management" className={styles.approval}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              <strong>04 / A DECISION FOR TOLA</strong>
              <span>Review a ₦22,000 counter-offer</span>
            </span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <figcaption>
        Fictional people and conversation. AI-generated vendor portrait. No live messages.
      </figcaption>
    </figure>
  );
}
