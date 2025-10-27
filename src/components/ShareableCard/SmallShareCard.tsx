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
  return (
  <BaseShareCard id={id} width={420} height={260} containerStyle={{ padding: '14px', background: 'linear-gradient(180deg,#ffffff 0%, #fbfbfb 100%)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 56 }}>
        <div style={{ maxWidth: '65%' }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1, wordBreak: 'keep-all' }}>{formatted}</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground, #6b7280)', marginTop: 8 }}>{city}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{dayQuality}%</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground, #6b7280)' }}>Day quality</div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '12px', borderRadius: 10, background: '#0f6b5a', color: 'white', minHeight: 68, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{topSlot ? `${new Date(topSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(topSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '—'}</div>
        <div style={{ fontSize: 14, opacity: 0.95, marginTop: 6 }}>{topSlot ? `Time quality: ${topSlot.score}%` : 'No suggested time'}</div>
      </div>

  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 10, alignItems: 'start', fontSize: 13, color: 'var(--muted-foreground, #6b7280)' }}>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Tithi</div>
          <div style={{ color: 'var(--muted-foreground, #6b7280)' }}>{tithi ? tithi : <span style={{ color: 'red' }}>Data unavailable</span>}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Nakshatra</div>
          <div style={{ color: 'var(--muted-foreground, #6b7280)' }}>{nakshatra ? nakshatra : <span style={{ color: 'red' }}>Data unavailable</span>}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Sunrise</div>
          <div>{sunrise || '-'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Sunset</div>
          <div>{sunset || '-'}</div>
        </div>
      </div>
      {/* Divider */}
      <div style={{ marginTop: 12, height: 1, background: 'rgba(15,23,42,0.04)', width: '100%' }} />

      {/* Footer: tagline and subtle watermark to fill space */}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground, #9aa0a6)', fontSize: 12 }}>
        <div>Plan with confidence — share this card with family</div>
        <div style={{ opacity: 0.25, fontWeight: 700 }}>muhurta.app</div>
      </div>
    </BaseShareCard>
  );
}

export default SmallShareCard;
