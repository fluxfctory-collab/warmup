import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { contactConfig } from '../config/contact';
import { contact } from '../content/product';
import { buttonStyles } from '../components/ButtonLink';
import styles from './Contact.module.css';

type Field = 'name' | 'email' | 'organisation' | 'message';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'not-connected' }
  | { kind: 'failed' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = 'Enter your name.';
  if (!v.email.trim()) e.email = 'Enter your work email.';
  else if (!EMAIL.test(v.email.trim())) e.email = 'Enter an email address in the format name@organisation.org.';
  if (!v.message.trim()) e.message = 'Enter a message.';
  else if (v.message.trim().length < 10) e.message = 'Add a little more detail to your message.';
  return e;
}

const empty: Values = { name: '', email: '', organisation: '', message: '' };

export function Contact() {
  const uid = useId();
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [announce, setAnnounce] = useState('');
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    organisation: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  const id = (f: Field) => `${uid}-${f}`;

  const onChange = (f: Field, value: string) => {
    const next = { ...values, [f]: value };
    setValues(next);
    if (status.kind !== 'idle' && status.kind !== 'sending') setStatus({ kind: 'idle' });
    // once a field has been checked, re-check it as the user corrects it
    if (touched[f]) setErrors((prev) => ({ ...prev, [f]: validate(next)[f] }));
  };

  const onBlur = (f: Field) => {
    if (f === 'organisation') return;
    if (!values[f].trim()) return; // don't nag on an empty field the user is just passing
    setTouched((t) => ({ ...t, [f]: true }));
    setErrors((prev) => ({ ...prev, [f]: validate(values)[f] }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const keys = (Object.keys(found) as Field[]).filter((k) => found[k]);
    if (keys.length) {
      setStatus({ kind: 'idle' });
      setAnnounce(
        keys.length === 1 ? 'There is 1 problem with the form.' : `There are ${keys.length} problems with the form.`,
      );
      refs[keys[0]].current?.focus();
      return;
    }
    setAnnounce('');
    if (!contactConfig.endpoint) {
      setStatus({ kind: 'not-connected' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(contactConfig.endpoint, {
        method: contactConfig.method,
        headers: contactConfig.headers,
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          organisation: values.organisation.trim(),
          message: values.message.trim(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: 'sent' });
      setValues(empty);
      setTouched({});
    } catch {
      setStatus({ kind: 'failed' });
    }
  };

  const describedBy = (f: Field, extra?: string) =>
    [errors[f] ? `${id(f)}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined;

  const field = (f: Exclude<Field, 'message'>, label: string, opts: { type: string; autoComplete: string; optional?: boolean }) => (
    <div className={styles.field} data-invalid={errors[f] ? 'true' : 'false'}>
      <label htmlFor={id(f)} className={styles.label}>
        {label}
        {opts.optional && <span className={styles.optional}> (optional)</span>}
      </label>
      <input
        ref={refs[f]}
        id={id(f)}
        name={f}
        type={opts.type}
        autoComplete={opts.autoComplete}
        className={styles.input}
        value={values[f]}
        onChange={(e) => onChange(f, e.target.value)}
        onBlur={() => onBlur(f)}
        aria-invalid={errors[f] ? true : undefined}
        aria-describedby={describedBy(f)}
        aria-required={opts.optional ? undefined : true}
        spellCheck={f === 'email' ? false : undefined}
      />
      {errors[f] && (
        <p id={`${id(f)}-error`} className={styles.error}>
          {errors[f]}
        </p>
      )}
    </div>
  );

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro} data-reveal>
          <h2 id="contact-title">{contact.title}</h2>
          <p className={styles.body}>{contact.body}</p>
          <dl className={styles.notes}>
            {contact.notes.map((n) => (
              <div key={n.label} className={styles.note}>
                <dt>{n.label}</dt>
                <dd>{n.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <form className={styles.form} noValidate onSubmit={onSubmit} aria-labelledby="contact-title" data-reveal>
          <div className={styles.row}>
            {field('name', 'Name', { type: 'text', autoComplete: 'name' })}
            {field('email', 'Work email', { type: 'email', autoComplete: 'email' })}
          </div>
          {field('organisation', 'Organisation', { type: 'text', autoComplete: 'organization', optional: true })}
          <div className={styles.field} data-invalid={errors.message ? 'true' : 'false'}>
            <label htmlFor={id('message')} className={styles.label}>
              Message
            </label>
            <p id={`${id('message')}-hint`} className={styles.hint}>
              {contact.privacy}
            </p>
            <textarea
              ref={refs.message}
              id={id('message')}
              name="message"
              rows={5}
              className={`${styles.input} ${styles.textarea}`}
              value={values.message}
              onChange={(e) => onChange('message', e.target.value)}
              onBlur={() => onBlur('message')}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy('message', `${id('message')}-hint`)}
              aria-required
            />
            {errors.message && (
              <p id={`${id('message')}-error`} className={styles.error}>
                {errors.message}
              </p>
            )}
          </div>

          <div className={styles.submitRow}>
            <button type="submit" className={`${buttonStyles.button} ${styles.submit}`} disabled={status.kind === 'sending'}>
              {status.kind === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            {!contactConfig.endpoint && <p className={styles.formNote}>{contact.formNote}</p>}
            <div className={styles.statusWrap} role="status" aria-live="polite">
              {announce && <p className="visually-hidden">{announce}</p>}
              {status.kind === 'not-connected' && (
                <p className={styles.status} data-tone="info">
                  This form isn&rsquo;t connected yet, so your message was not sent.
                </p>
              )}
              {status.kind === 'failed' && (
                <p className={styles.status} data-tone="error">
                  Your message could not be sent. Please try again later.
                </p>
              )}
              {status.kind === 'sent' && (
                <p className={styles.status} data-tone="ok">
                  Thank you. Your message was sent.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
