import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import { scrollToScene } from '../engine/ScrollDriver';
import CityOverview from '../lib/CityOverview';

export default function Scene() { return <CityOverview id="hero" from={-0.1} to={0.7} />; }

export const cameraKeys = [
  { t: 0, pos: [-34, 88, 92], look: [-16, 0, -14] },
  { t: 0.55, pos: [24, 38, 52], look: [0, 3, -14] },
  { t: 1, pos: [0, 3, 30], look: [0, 4, -30] },
];

export const SERVICES = ['Hoardings & OOH', 'DOOH Screens', 'Transit Media', 'RWA Activations', 'Sampling', 'Lift & Corporate Branding'];

export function Overlay() {
  const root = useRef();
  useEffect(() => {
    const f = () => { const el = root.current; if (!el) return; const o = 1 - smoothstep(0.4, 0.75, scrollState.scenes.hero); el.style.opacity = o; el.style.visibility = o < 0.02 ? 'hidden' : 'visible'; };
    gsap.ticker.add(f); return () => gsap.ticker.remove(f);
  }, []);
  return (
    <div ref={root} className="ov">
      <div className="ov-copy hero-copy">
        <h1>Right Placement.<br />True Engagement.</h1>
        <p>Your brand, everywhere a city looks, shops, lives and works. Scroll to ride through the city.</p>
        <div className="chips">{SERVICES.map((s) => <span key={s} className={s === 'Sampling' ? 'hot' : ''}>{s}</span>)}</div>
        <button className="btn" data-cursor onClick={() => scrollToScene('contact')}>Plan a Campaign</button>
      </div>
      <span className="scroll-cue">Scroll to enter</span>
    </div>
  );
}

export const fog = { near: 140, far: 420 }; // aerial city view: keep it clear
