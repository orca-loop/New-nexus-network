import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import { AdPanel, BoxField, cityBuildings, isLow, C } from '../lib/kit';
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

// Recognisable horseshoe magnet (U-shape + two tips) with a small lightning bolt sitting in the gap,
// same shapes as the logo/nav icon so it reads clearly instead of as loose primitives.
function Magnet() {
  const g = useRef();
  useFrame(() => {
    if (!g.current) return;
    g.current.rotation.y += (scrollState.pointer.x * 0.5 - g.current.rotation.y) * 0.04;
    g.current.rotation.x += (-scrollState.pointer.y * 0.2 - g.current.rotation.x) * 0.04;
    const p = scrollState.scenes.contact;
    g.current.scale.setScalar(0.7 + 0.3 * smoothstep(0, 0.2, p));
  });
  return (
    <group ref={g}>
      <mesh position={[-1.1, 0, 0]}><torusGeometry args={[1.5, 0.45, 8, 20, Math.PI]} /><meshStandardMaterial color={C.red} flatShading /></mesh>
      <mesh position={[-1.1, 1.5, 0]} rotation-z={Math.PI}><boxGeometry args={[0.9, 0.9, 0.9]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      <mesh position={[-1.1, -1.5, 0]} rotation-z={Math.PI}><boxGeometry args={[0.9, 0.9, 0.9]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      {/* bolt, built from 3 thin boxes so it reads clearly instead of an abstract cone */}
      <group position={[0.35, 0, 0.55]} rotation-z={-0.2}>
        <mesh position={[0.15, 0.55, 0]} rotation-z={0.55}><boxGeometry args={[0.18, 0.9, 0.18]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
        <mesh position={[0, 0, 0]} rotation-z={-0.5}><boxGeometry args={[0.18, 0.9, 0.18]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
        <mesh position={[-0.15, -0.55, 0]} rotation-z={0.55}><boxGeometry args={[0.18, 0.7, 0.18]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      </group>
    </group>
  );
}

// Orbiting halftone dots pulled toward the magnet, matching the hero's "attraction" motif.
function OrbitDots() {
  const dots = useRef();
  const pts = useMemo(() => Array.from({ length: isLow() ? 40 : 80 }, (_, i) => ({ a: (i / 80) * Math.PI * 2, r: 3.4 + (i % 5) * 0.5, sp: 0.3 + (i % 3) * 0.15 })), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (!dots.current) return;
    dots.current.children.forEach((m, i) => {
      const pt = pts[i], pull = 1 - ((t * pt.sp) % 1);
      m.position.set(Math.cos(pt.a) * pt.r * (0.4 + 0.6 * pull), Math.sin(t + i) * 0.3, Math.sin(pt.a) * pt.r * (0.4 + 0.6 * pull));
      m.scale.setScalar(0.06 + 0.05 * pull);
    });
  });
  return <group ref={dots}>{pts.map((_, i) => <mesh key={i}><boxGeometry /><meshStandardMaterial color={i % 4 ? C.red : C.black} flatShading /></mesh>)}</group>;
}

// A small city skyline behind the magnet with a couple of lit billboards — closes the loop back
// to the OOH/hoarding scenes instead of leaving the magnet floating on an empty background.
function Skyline() {
  const items = useMemo(() => [...cityBuildings(51, 30, -6, -1), ...cityBuildings(52, 30, -6, 1)], []);
  const glow = useRef(), glow2 = useRef();
  useFrame((s) => {
    const v = 0.55 + Math.sin(s.clock.elapsedTime * 0.8) * 0.1;
    if (glow.current) glow.current.emissiveIntensity = v;
    if (glow2.current) glow2.current.emissiveIntensity = v * 0.85;
  });
  return (
    <group position={[0, 0, -18]}>
      <BoxField items={items} />
      <AdPanel position={[-9, 6, -4]} rotation={[0, 0.5, 0]} size={[4.2, 2.4]} variant={0} glow={0.5} matRef={glow} />
      <AdPanel position={[9.5, 5, -6]} rotation={[0, -0.5, 0]} size={[4.2, 2.4]} variant={1} glow={0.5} matRef={glow2} />
    </group>
  );
}

export default function Scene() {
  const floor = useMemo(() => [{ p: [0, -0.1, -10], s: [50, 0.2, 40], c: C.peachD }], []);
  return (
    <group position={[0, 3.4, 0]}>
      <BoxField items={floor} />
      <Skyline />
      <Magnet />
      <OrbitDots />
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [0, 3.4, 16], look: [0, 3.4, 0] },
  { t: 1, pos: [0, 3.6, 11], look: [0, 3.2, 0] },
];

export function Overlay() {
  const root = useRef();
  useEffect(() => {
    const f = () => { const el = root.current; if (!el) return; const o = smoothstep(0.06, 0.22, scrollState.scenes.contact); el.style.opacity = o; el.style.visibility = o < 0.02 ? 'hidden' : 'visible'; };
    gsap.ticker.add(f); return () => gsap.ticker.remove(f);
  }, []);
  return (
    <div ref={root} className="ov" style={{ visibility: 'hidden' }}>
      {/* scrolls internally so the form and footer are always reachable, regardless of screen height */}
      <div className="contact-scroll">
        <div className="contact-panel">
          <h2>Let's put your brand where it gets noticed.</h2>
          <div className="contact-wrap"><ContactForm /></div>
          <div className="quicklinks">
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" data-cursor>WhatsApp</a>
            <a href={`mailto:${CONTACT.email}`} data-cursor>{CONTACT.email}</a>
            <a href={`tel:+91${CONTACT.phone}`} data-cursor>{CONTACT.phone}</a>
          </div>
        </div>
        <div className="footer-list">
          <span><b>{BRAND.name}</b></span>
          {[...TIER2_CITIES, ...TIER1_CITIES].map((c) => <span key={c}>{c}</span>)}
          <span>© {new Date().getFullYear()} {BRAND.short}. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
