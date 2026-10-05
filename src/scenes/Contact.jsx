import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import CityOverview from '../lib/CityOverview';
import { SERVICES } from './Hero';
import { CONTACT, TIER1_CITIES, TIER2_CITIES, BRAND } from '../config/siteConfig';

const TYPES = ['Hoardings / OOH', 'DOOH Screens', 'Transit', 'RWA Activation', 'Sampling', 'Lift Branding', 'Corporate Activation', 'Flea Market', 'Festival Bundle', 'Other'];

// Shared so LiteSite reuses the exact same form.
export function ContactForm() {
  const [state, setState] = useState('idle'); // idle | sending | ok | bad
  const [err, setErr] = useState('');
  const onSubmit = async (e) => {
    e.preventDefault();
    const f = e.target, data = Object.fromEntries(new FormData(f).entries());
    if (data._gotcha) return; // honeypot
    if (!data.name || !data.phone) { setErr('Name and phone are required.'); return; }
    setErr(''); setState('sending');
    try {
      if (CONTACT.formEndpoint.includes('REPLACE_ME')) { // no form service set up yet: send the enquiry straight to WhatsApp
        const t = `New enquiry%0AName: ${data.name}%0ACompany: ${data.company || '-'}%0APhone: ${data.phone}%0ACity: ${data.city || '-'}%0AService: ${data.type}%0A${data.message || ''}`;
        window.open(`${CONTACT.whatsapp}?text=${t}`, '_blank'); setState('ok'); f.reset(); return;
      }
      const res = await fetch(CONTACT.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
      if (res.ok) { setState('ok'); f.reset(); } else setState('bad');
    } catch { setState('bad'); }
  };
  return (
    <form className="cform" onSubmit={onSubmit}>
      <input className="hp" name="_gotcha" tabIndex={-1} autoComplete="off" />
      <div className="cform-row">
        <div><label htmlFor="name">Name</label><input id="name" name="name" required data-cursor /></div>
        <div><label htmlFor="company">Company</label><input id="company" name="company" data-cursor /></div>
      </div>
      <div className="cform-row">
        <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" required data-cursor /></div>
        <div><label htmlFor="city">City</label><input id="city" name="city" data-cursor /></div>
      </div>
      <div>
        <label htmlFor="type">Campaign type</label>
        <select id="type" name="type" data-cursor defaultValue={TYPES[0]}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <div><label htmlFor="message">Message</label><textarea id="message" name="message" data-cursor /></div>
      <button className="btn" type="submit" data-cursor disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send'}</button>
      {err && <div className="cform-msg bad">{err}</div>}
      {state === 'ok' && <div className="cform-msg ok">Thanks — we'll get back to you shortly.</div>}
      {state === 'bad' && <div className="cform-msg bad">Something went wrong. Please WhatsApp or call us instead.</div>}
    </form>
  );
}

export default function Scene() { return <CityOverview id="contact" from={0.25} to={1.2} />; }

export const cameraKeys = [
  { t: 0, pos: [0, 4, 26], look: [0, 4, -30] },
  { t: 1, pos: [-34, 88, 92], look: [-16, 0, -14] },
];

export function Overlay() {
  const root = useRef();
  useEffect(() => {
    const f = () => { const el = root.current; if (!el) return; const o = smoothstep(0.08, 0.3, scrollState.scenes.contact); el.style.opacity = o; el.style.visibility = o < 0.02 ? 'hidden' : 'visible'; };
    gsap.ticker.add(f); return () => gsap.ticker.remove(f);
  }, []);
  return (
    <div ref={root} className="ov" style={{ visibility: 'hidden' }}>
      <div className="ov-copy top"><h2>Your brand, all over the city.</h2><p>One partner for every placement. Scroll down to start your campaign.</p></div>
    </div>
  );
}

// Normal page section after the 3D ride, so it scrolls and taps naturally on phone and PC.
export function ContactSection() {
  return (
    <section id="enquire" className="enquire">
      <div className="enq-grid">
        <div>
          <h2>Let's put your brand where it gets noticed.</h2>
          <div className="chips dark">{SERVICES.map((s) => <span key={s} className={s === 'Sampling' ? 'hot' : ''}>{s}</span>)}</div>
          <div className="quicklinks">
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={`tel:+91${CONTACT.phone}`}>{CONTACT.phone}</a>
          </div>
        </div>
        <div className="contact-wrap"><ContactForm /></div>
      </div>
      <div className="footer-list">
        <span><b>{BRAND.name}</b></span>
        {[...TIER2_CITIES, ...TIER1_CITIES].map((c) => <span key={c}>{c}</span>)}
        <span>© {new Date().getFullYear()} {BRAND.short}. All rights reserved.</span>
      </div>
    </section>
  );
}

export const fog = { near: 140, far: 420 }; // aerial city view: keep it clear
