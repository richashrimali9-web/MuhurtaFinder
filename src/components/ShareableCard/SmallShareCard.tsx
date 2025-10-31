import { BaseShareCard } from './BaseShareCard';

interface SmallShareCardProps {
  id: string;
  date: Date;
  city: string;
  dayQuality: number | string;
  topSlot?: any;
  tithi?: string;
  nakshatra?: string;
  sunrise?: string;
  sunset?: string;
}

export function SmallShareCard({ id, date, city, dayQuality, topSlot, tithi, nakshatra, sunrise, sunset }: SmallShareCardProps) {
  const formatted = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const hasData = topSlot || tithi || nakshatra || sunrise || sunset;
  return (
    <BaseShareCard id={id} width={420} height={260} containerStyle={{ padding: '14px', background: 'linear-gradient(180deg,#ffffff 0%, #fbfbfb 100%)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 56 }}>
        <div style={{ maxWidth: '65%' }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1, wordBreak: 'keep-all' }}>{formatted}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{city || <span style={{ color: 'red' }}>Location unavailable</span>}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{dayQuality ? `${dayQuality}%` : '--'}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Day quality</div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '14px', borderRadius: 12, background: 'linear-gradient(90deg, #E8833D 0%, #D67530 100%)', color: 'white', minHeight: 68, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>{topSlot ? `${new Date(topSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(topSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not available'}</div>
        <div style={{ fontSize: 15, opacity: 0.95, marginTop: 6 }}>{topSlot && topSlot.score ? `Time quality: ${topSlot.score}%` : 'No suggested time'}</div>
      </div>

      {/* Diagonal checkerboard grid for details - always render */}
      <div style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: 0,
        alignItems: 'start',
        fontSize: 15,
        borderRadius: 10,
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'none',
      }}>
        {/* Tithi: white */}
        <div style={{ background: '#FFFFFF', borderRight: '1px solid #E0CDB8', borderBottom: '1px solid #E0CDB8', padding: '18px', gap: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#4B2E0F' }}>Tithi</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: '#6b7280' }}>{tithi ? tithi : <span style={{ color: 'red' }}>Not available</span>}</div>
        </div>
        {/* Nakshatra: pale gold */}
        <div style={{ background: '#FFF9F0', borderBottom: '1px solid #E0CDB8', padding: '18px', gap: '8px', marginLeft: '0px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#4B2E0F' }}>Nakshatra</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: '#6b7280' }}>{nakshatra ? nakshatra : <span style={{ color: 'red' }}>Not available</span>}</div>
        </div>
        {/* Sunrise: pale gold */}
        <div style={{ background: '#FFF9F0', borderRight: '1px solid #E0CDB8', padding: '18px', gap: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#4B2E0F' }}>Sunrise</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: '#6b7280' }}>{sunrise ? sunrise : <span style={{ color: 'red' }}>Not available</span>}</div>
        </div>
        {/* Sunset: white */}
        <div style={{ background: '#FFFFFF', padding: '18px', gap: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#4B2E0F' }}>Sunset</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: '#6b7280' }}>{sunset ? sunset : <span style={{ color: 'red' }}>Not available</span>}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ marginTop: 12, height: 1, background: '#e0e7ef', width: '100%' }} />

      {/* Footer: tagline and subtle watermark to fill space */}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9aa0a6', fontSize: 12 }}>
        <div>Plan with confidence — share this card with family</div>
        <div style={{ opacity: 0.25, fontWeight: 700 }}>muhurta.app</div>
      </div>
    </BaseShareCard>
  );
}

export default SmallShareCard;
