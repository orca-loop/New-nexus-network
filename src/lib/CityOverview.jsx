import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import { scrollToScene } from '../engine/ScrollDriver';
import { AdPanel, BoxField, rng, isLow, C } from './kit';

const INFO = {
  ooh: ['OOH Hoardings', 'Large-format hoardings on the roads your audience travels every day.'],
  dooh: ['DOOH Screens', 'Digital screens in cafes, restaurants, hotel lobbies, bus stops and towers.'],
  transit: ['Transit Media', 'Buses, autos and e-rickshaws carrying your brand across the whole city.'],
  metro: ['Metro Branding', 'Train wraps, pillars, stations and viaduct hoardings seen by daily commuters.'],
  mall: ['Mall & Sampling Stalls', 'Sampling counters, demo stalls and kiosks where people shop. Get real trials.'],
  society: ['Society (RWA) Activations', 'Gate branding, standees, canopies, festival bundles and flea markets inside housing societies.'],
  sample: ['Sampling', 'Hand your product to the exact audience: societies, malls, corporate parks.'],
  tower: ['Corporate Towers', 'Lift branding, corporate sampling and canopies in corporate parks.'],
};

// Clickable hotspot: tap/click opens a card with an Enquire button.
function Spot({ id, k, from, to, position, open, setOpen }) {
  const el = useRef();
  useFrame(() => {
    if (!el.current) return;
    const p = scrollState.scenes[id], v = smoothstep(from, from + 0.06, p) * (1 - smoothstep(to - 0.06, to, p));
    el.current.style.opacity = v; el.current.style.pointerEvents = v > 0.3 ? 'auto' : 'none';
  });
  const [t, d] = INFO[k];
  return (
    <Html position={position} center pointerEvents="none" zIndexRange={[12, 0]}>
      <div ref={el} className="hotspot" style={{ opacity: 0 }}>
        <button data-cursor onClick={() => setOpen(open === k ? null : k)}><i />{t}</button>
        {open === k && <div className="hs-card"><b>{t}</b><br />{d}<br /><button className="mini" onClick={() => scrollToScene('contact')}>Enquire →</button></div>}
      </div>
    </Html>
  );
}

// One city that shows every service: OOH, DOOH, transit, metro, mall + sampling, society, corporate towers.
export default function CityOverview({ id, from = -0.1, to = 1.1 }) {
  const [open, setOpen] = useState(null);
  const items = useMemo(() => {
    const r = rng(77), o = [], low = isLow(), step = low ? 15 : 11;
    const skip = (x, z) => (x < -16 && x > -48 && z < -14 && z > -46) || (x > 20 && x < 46 && z < 24 && z > -8) || (x < -14 && x > -50 && z < 38 && z > 6);
    o.push({ p: [0, 0.05, -20], s: [9, 0.1, 150], c: C.grey }, { p: [0, 0.06, -14], s: [150, 0.1, 8], c: C.grey });
    for (let z = 40; z > -80; z -= 7) o.push({ p: [0, 0.12, z], s: [0.3, 0.02, 3], c: C.white });
    for (let x = -66; x <= 66; x += 7) o.push({ p: [x, 0.12, -14], s: [3, 0.02, 0.3], c: C.white });
    for (let x = -66; x <= 66; x += step) for (let z = 40; z > -80; z -= step) {
      if (Math.abs(x) < 16 || Math.abs(z + 14) < 10 || skip(x, z)) continue; // clear corridors so hoardings are never hidden
      const h = 4 + r() * 10;
      o.push({ p: [x, h / 2, z], s: [7 + r() * 2, h, 7 + r() * 2], c: [C.peachD, '#EFBE98', C.grey, C.peach][Math.floor(r() * 4)] });
    }
    [[-30, -30, 34], [-39, -27, 26], [-26, -40, 30]].forEach(([x, z, h]) => o.push({ p: [x, h / 2, z], s: [8, h, 8], c: C.grey }, { p: [x, h * 0.82, z], s: [8.3, 2.2, 8.3], c: C.red }));
    [[26, 0], [38, 0], [26, 16], [38, 16]].forEach(([x, z]) => o.push({ p: [x, 6, z], s: [8, 12, 8], c: C.peach }, { p: [x, 12.3, z], s: [8.2, 0.6, 8.2], c: C.red }));
    o.push({ p: [32, 0.1, 8], s: [10, 0.2, 6], c: C.peachD }, { p: [27, 3, -6], s: [0.5, 6, 0.5], c: C.black }, { p: [37, 3, -6], s: [0.5, 6, 0.5], c: C.black }, { p: [32, 6.2, -6], s: [11, 0.9, 0.6], c: C.red });
    [[28.5, 6], [35.5, 6], [28.5, 10], [35.5, 10]].forEach(([x, z]) => o.push({ p: [x, 1.6, z], s: [0.2, 3.2, 0.2], c: C.black }));
    o.push({ p: [32, 3.3, 8], s: [8, 0.3, 5.5], c: C.red }, { p: [32, 0.6, 8], s: [3, 1.2, 1], c: C.black });
    [[-10.5, 6], [10.5, -2], [-10.5, -30], [10.5, -44]].forEach(([x, z]) => o.push({ p: [x, 6, z], s: [0.5, 12, 0.5], c: C.black }));
    // metro viaduct over the cross road + station
    o.push({ p: [0, 9, -14], s: [150, 0.8, 3.4], c: C.grey });
    for (let x = -60; x <= 60; x += 15) o.push({ p: [x, 4.5, -14], s: [1.2, 9, 1.2], c: C.black });
    o.push({ p: [14, 12.5, -14], s: [16, 0.5, 6], c: C.red }, { p: [7, 11, -14], s: [0.3, 3.5, 0.3], c: C.black }, { p: [21, 11, -14], s: [0.3, 3.5, 0.3], c: C.black });
    // mall + sampling plaza
    o.push({ p: [-32, 7, 33], s: [22, 14, 8], c: C.peach }, { p: [-32, 0.1, 18], s: [24, 0.2, 14], c: C.peachD });
    [-40, -34, -28, -22].forEach((x, i) => o.push({ p: [x, 3.2, 18], s: [4.4, 0.3, 3.4], c: i % 2 ? C.red : C.black }, { p: [x, 0.8, 18], s: [3.2, 1.6, 1.2], c: C.white }, { p: [x - 1.9, 1.6, 16.5], s: [0.2, 3.2, 0.2], c: C.black }, { p: [x + 1.9, 1.6, 16.5], s: [0.2, 3.2, 0.2], c: C.black }));
    return o;
  }, []);
  const bus = useRef(), train = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (bus.current) bus.current.position.z = 50 - ((t * 7) % 120);
    if (train.current) train.current.position.x = -70 + ((t * 9) % 140);
  });
  const sc = [[-10.5, 6, 0.4], [10.5, -2, -0.4], [-10.5, -30, 0.4], [10.5, -44, -0.4]];
  const sp = { id, from, to, open, setOpen };
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -20]}><planeGeometry args={[240, 200]} /><meshStandardMaterial color={C.peachD} /></mesh>
      <BoxField items={items} />
      {sc.map(([x, z, ry], i) => <AdPanel key={i} position={[x, 12.5, z]} rotation={[0, ry, 0]} size={[9, 4.6]} variant={i % 3} glow={0.5} />)}
      {[[5.8, 22], [-5.8, -2], [5.8, -30]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><mesh position={[0, 1.8, 0]}><boxGeometry args={[0.2, 3.6, 0.2]} /><meshStandardMaterial color={C.black} /></mesh><AdPanel position={[0, 4.4, 0]} size={[2.6, 3.4]} variant={2} glow={0.8} /></group>)}
      <AdPanel position={[-32, 8, 28.9]} size={[16, 6]} variant={0} glow={0.6} label="SAMPLING ZONE" />
      <AdPanel position={[-14, 9, -12.2]} size={[14, 2.4]} variant={1} glow={0.6} label="METRO BRANDING" />
      <AdPanel position={[40, 5, -5.6]} rotation={[0, 0, 0]} size={[8, 2.2]} variant={2} glow={0.4} label="SOCIETY GATE" />
      <group ref={bus} position={[2.2, 1.5, 0]}>
        <mesh><boxGeometry args={[2.6, 2.8, 8]} /><meshStandardMaterial color={C.red} flatShading /></mesh>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[2.7, 0.9, 6.5]} /><meshStandardMaterial color={C.black} /></mesh>
        <Spot {...sp} k="transit" position={[0, 3, 0]} />
      </group>
      <group ref={train} position={[0, 10.4, -14]}>
        {[0, 5.2, 10.4].map((x) => <group key={x} position={[x, 0, 0]}><mesh><boxGeometry args={[5, 2.2, 2.6]} /><meshStandardMaterial color={C.red} flatShading /></mesh><mesh position={[0, 0.3, 0]}><boxGeometry args={[5.1, 0.7, 2.7]} /><meshStandardMaterial color={C.black} /></mesh></group>)}
      </group>
      <Spot {...sp} k="ooh" position={[-10.5, 18.5, 6]} />
      <Spot {...sp} k="dooh" position={[5.8, 8.5, 22]} />
      <Spot {...sp} k="metro" position={[14, 15, -14]} />
      <Spot {...sp} k="mall" position={[-32, 12, 18]} />
      <Spot {...sp} k="society" position={[32, 16, 8]} />
      <Spot {...sp} k="sample" position={[32, 5.5, 8]} />
      <Spot {...sp} k="tower" position={[-30, 40, -30]} />
    </group>
  );
}
