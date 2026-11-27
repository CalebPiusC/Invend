'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Check, Pencil, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { sampleSale as sale, sampleMoney as money, checkSampleOffer } from './demo-data';
import styles from './owner-control.module.css';

export function OwnerControl() {
  const [amount, setAmount] = useState(sale.minimumUnitPriceKobo * sale.quantity);
  const [draft, setDraft] = useState('22000');
  const [editing, setEditing] = useState(false);
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('Nothing is sent or saved. Try an owner decision.');
  const id = useId();
  const approveButton = useRef<HTMLButtonElement>(null);
  const decisionResult = useRef<HTMLDivElement>(null);
  const previous = useRef({ editing, decision });
  useEffect(() => {
    if (decision !== 'pending') decisionResult.current?.focus({ preventScroll: true });
    else if (previous.current.editing || previous.current.decision !== 'pending') {
      approveButton.current?.focus({ preventScroll: true });
    }
    previous.current = { editing, decision };
  }, [editing, decision]);
  const reset = () => {
    setAmount(sale.minimumUnitPriceKobo * sale.quantity);
    setDraft('22000');
    setEditing(false);
    setDecision('pending');
    setError('');
    setNotice('Example reset. Nothing is sent or saved.');
  };
  return (
    <div className={styles.demo} data-testid="owner-decision-demo">
      <div className={styles.top}>
        <span>
          <ShieldCheck size={16} aria-hidden="true" /> Owner review
        </span>
        <span>INTERACTIVE EXAMPLE</span>
      </div>
      <div className={styles.body}>
        <div className={styles.customer}>
          <span>AB</span>
          <div>
            <strong>Amaka Bello</strong>
            <span>Fictional customer · two indigo totes</span>
          </div>
        </div>
        <blockquote className={styles.request}>“Can you do both for ₦20,000?”</blockquote>
        <div className={styles.rules}>
          <span>
            Your minimum for two<strong>₦22,000</strong>
          </span>
          <span>
            Customer’s request<strong>₦20,000</strong>
          </span>
          <p>
            <ShieldCheck size={14} aria-hidden="true" />
            ₦2,000 below your minimum. No automatic promise.
          </p>
        </div>
        <div className={styles.proposal}>
          <p className={styles.label}>
            {decision === 'approved'
              ? 'APPROVED BY TOLA · DEMO ONLY'
              : decision === 'rejected'
                ? 'REJECTED BY TOLA · DEMO ONLY'
                : 'PROPOSED COUNTER-OFFER · NOT SENT'}
          </p>
          <p>
            “I can offer the two totes for {money(amount)}, plus ₦1,500 delivery to Yaba. Would you
            like to go ahead?”
          </p>
        </div>
        {editing ? (
          <form
            className={styles.editForm}
            onSubmit={(event) => {
              event.preventDefault();
              const parts = draft.trim().split('.');
              const kobo = Number(parts[0]) * 100 + Number((parts[1] || '').padEnd(2, '0'));
              if (
                !/^\d+(\.\d{1,2})?$/.test(draft.trim()) ||
                !Number.isSafeInteger(kobo) ||
                kobo <= 0
              ) {
                setError('Enter a valid amount in naira, with up to two decimal places.');
                return;
              }
              if (
                checkSampleOffer(kobo).needsApproval ||
                kobo > sale.unitPriceKobo * sale.quantity
              ) {
                setError(
                  'Keep this sample counter-offer between ₦22,000 and ₦24,000. The minimum does not change.',
                );
                return;
              }
              setAmount(kobo);
              setEditing(false);
              setError('');
              setNotice(
                'Sample counter-offer edited. Still waiting for your approval; nothing was sent.',
              );
            }}
          >
            <label htmlFor={id}>Counter-offer for both totes (₦)</label>
            <input
              id={id}
              value={draft}
              inputMode="decimal"
              autoFocus
              onChange={(event) => {
                setDraft(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
            />
            <p id={`${id}-help`}>₦22,000–₦24,000, before delivery. Your minimum stays protected.</p>
            {error && (
              <p id={`${id}-error`} role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                Save sample edit <Check size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : decision === 'pending' ? (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              ref={approveButton}
              onClick={() => {
                setDecision('approved');
                setNotice(
                  'Approved in this demo. No message sent. No order saved. Customer acceptance and payment are still pending.',
                );
              }}
            >
              <Check size={15} aria-hidden="true" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(String(amount / 100));
                setEditing(true);
              }}
            >
              <Pencil size={14} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setDecision('rejected');
                setNotice(
                  'Rejected in this demo. The proposed reply was not sent. The customer’s request remains unresolved.',
                );
              }}
            >
              <X size={15} aria-hidden="true" />
              Reject
            </button>
          </div>
        ) : (
          <div className={styles.decision} ref={decisionResult} tabIndex={-1}>
            <ShieldCheck size={17} aria-hidden="true" />
            {decision === 'approved'
              ? 'Your decision. Within your price boundary.'
              : 'No reply sent. The next step is yours.'}
          </div>
        )}
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      </div>
      <div className={styles.bottom}>
        <span>Fictional prices. No real messages or payments.</span>
        <button type="button" onClick={reset}>
          <RotateCcw size={13} aria-hidden="true" />
          Reset example
        </button>
      </div>
    </div>
  );
}
