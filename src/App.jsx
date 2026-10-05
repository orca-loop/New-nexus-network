import { useMemo } from 'react';
import { detectQuality } from './engine/quality';
import ScrollDriver from './engine/ScrollDriver';
import WorldCanvas from './engine/WorldCanvas';
import { registry } from './engine/sceneRegistry';
import { ContactSection } from './scenes/Contact';
import Cursor from './ui/Cursor';
import Nav from './ui/Nav';
import DebugHud from './ui/DebugHud';
import LiteSite from './lite/LiteSite';
import SeoHead from './components/SeoHead';

export default function App() {
  const { lite } = useMemo(detectQuality, []);
  if (lite) return (<><SeoHead /><LiteSite /></>);
  return (
    <>
      <SeoHead />
      <ScrollDriver />
      <ContactSection />
      <WorldCanvas />
      <div className="overlays">{registry.map((s) => { const O = s.Overlay; return <O key={s.id} />; })}</div>
      <Nav />
      <Cursor />
      <DebugHud />
    </>
  );
}
