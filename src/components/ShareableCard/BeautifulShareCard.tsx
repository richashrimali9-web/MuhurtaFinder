import React from 'react';
import { CardHeader } from './CardHeader';
// import { KalashIcon } from './HeaderIcons';
const ClockIcon = ({ style = {} }) => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={style}>
    <circle cx="12" cy="12" r="10" fill="#FFF" />
    <rect x="11" y="6" width="2" height="7" rx="1" fill="#D67530" />
    <rect x="11" y="12" width="6" height="2" rx="1" fill="#D67530" />
  </svg>
);
const StarIcon = ({ style = {} }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={style}>
    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#FFF" />
  </svg>
);
const OmWatermark = () => (
  <svg width="280" height="280" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', opacity: 0.05, zIndex: 0, pointerEvents: 'none' }}>
    <text x="50%" y="55%" textAnchor="middle" fontSize="220" fill="#FFF" fontFamily="serif">ॐ</text>
  </svg>
);


export interface BeautifulShareCardProps {
  id?: string;
  eventType: string;
  location: string;
  date: string;
  dayQuality: string;
  tithi: string;
  featuredTime: string;
  timeQuality: string;
  nakshatra: string;
  sunrise: string;
  sunset: string;
  moonPhase: string;
  blessing?: string;
  qrCodeUrl?: string;
}

const BeautifulShareCard: React.FC<BeautifulShareCardProps> = ({
  id,
  eventType,
  location,
  date,
  dayQuality,
  tithi,
  featuredTime,
  timeQuality,
  nakshatra,
  sunrise,
  sunset,
  moonPhase,
  blessing = 'शुभ मुहूर्त | Auspicious Timing',
  // branding and cta removed
  qrCodeUrl,
}) => {
  return (
    <div
      id={id}
      style={{
        width: 1080,
        height: 1200,
        background: '#FFD700',
        borderRadius: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Arial, Georgia, serif',
        color: '#FFF',
        paddingTop: 36,
        paddingLeft: 36,
        paddingRight: 36,
        paddingBottom: 32,
        boxSizing: 'border-box'
      }}
    >
      <OmWatermark />
      <CardHeader
        title="Auspicious Event Muhurat"
        subtitle={`${location} | ${eventType}`}
        backgroundColor="#FFD700"
        titleColor="linear-gradient(135deg, #4B2E0F 0%, #D67530 100%)"
        subtitleColor="#3D2A1F"
        useGanesha={false} // Set to true if you have a real Ganesha icon
        style={{ marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: '1.5rem', borderRadius: 0, borderBottom: 'none', padding: 0 }}
      />
      {/* CardHeader now handles title and subtitle rendering */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#000000', marginBottom: 12, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>{date}</div>
          <div style={{ fontSize: 20, color: '#008000', marginBottom: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <span>{dayQuality} Auspicious Day</span>
          </div>
          <div style={{ fontSize: 18, color: '#000000', fontWeight: 'bold', lineHeight: 1.5, marginBottom: 20, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>{tithi}</div>
        </div>
        <div style={{ background: '#D67530', border: 'none', padding: '28px 24px', borderRadius: 14, boxShadow: '0 6px 16px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
          <ClockIcon />
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{featuredTime}</div>
          <div style={{ fontSize: 16, color: '#FFFFFF', marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
            <StarIcon /> {timeQuality} Perfect Time
          </div>
        </div>
      </div>
  <div style={{ marginTop: 32, padding: 24, background: '#3D2A1F', borderRadius: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 18 }}>
        <div style={{ background: '#3D2A1F', padding: '22px 18px', borderRadius: 10, boxShadow: '0 3px 10px rgba(0,0,0,0.3)', textAlign: 'center', border: '2px solid #D67530' }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#F4B860', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{'Nakshatra'}</div>
          <div style={{ fontSize: 18, color: '#FFFFFF', lineHeight: 1.5, wordBreak: 'break-word' }}>{nakshatra}</div>
        </div>
        <div style={{ background: '#3D2A1F', padding: '22px 18px', borderRadius: 10, boxShadow: '0 3px 10px rgba(0,0,0,0.3)', textAlign: 'center', border: '2px solid #D67530' }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#F4B860', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{'Sunrise'}</div>
          <div style={{ fontSize: 18, color: '#FFFFFF' }}>{sunrise}</div>
        </div>
        <div style={{ background: '#3D2A1F', padding: '22px 18px', borderRadius: 10, boxShadow: '0 3px 10px rgba(0,0,0,0.3)', textAlign: 'center', border: '2px solid #D67530' }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#F4B860', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{'Sunset'}</div>
          <div style={{ fontSize: 18, color: '#FFFFFF' }}>{sunset}</div>
        </div>
        <div style={{ background: '#3D2A1F', padding: '22px 18px', borderRadius: 10, boxShadow: '0 3px 10px rgba(0,0,0,0.3)', textAlign: 'center', border: '2px solid #D67530' }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#F4B860', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{'Moon Phase'}</div>
          <div style={{ fontSize: 18, color: '#FFFFFF' }}>{moonPhase}</div>
        </div>
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#000000', fontWeight: 'bold', marginBottom: 14, letterSpacing: 1, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>{blessing}</div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 16, marginBottom: 18 }}>
          <span style={{ color: '#D67530', fontWeight: 700, fontSize: 16, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>Astro Event Planner</span>
          <span style={{ color: '#000000', fontWeight: 400, fontSize: 16, textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}> | Your Guide to Auspicious Timings</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ background: '#F4B860', color: '#000000', padding: '16px 32px', borderRadius: 10, fontWeight: 'bold', fontSize: 18, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            ✨ Plan your event now: <span style={{ color: '#000000', fontWeight: 700, fontSize: 18 }}>www.astroeventplanner.com</span> ✨
          </div>
        </div>
        {/* KalashIcon removed, only CardHeader icons used for header */}
        {qrCodeUrl && (
          <img src={qrCodeUrl} alt="QR Code" style={{ position: 'absolute', right: 20, bottom: 20, width: 120, height: 120, borderRadius: 16, background: '#F4B860', border: '2px solid #F4B860' }} />
        )}
      </div>
    </div>
  );
};

export default BeautifulShareCard;
