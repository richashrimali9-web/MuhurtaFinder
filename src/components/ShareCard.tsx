import { Button } from './ui/button';
import { PanchangData } from '../utils/panchangData';
import { BeautifulShareCard } from './ShareableCard';
import { eventTypes, getCurrentTithi, getCurrentNakshatra } from '../utils/panchangData';
import { shareCardImage } from '../utils/cardGenerator';
 

interface ShareCardProps {
  date: Date;
  city: string;
  panchang: PanchangData;
}

export function ShareCard({ date, city, panchang }: ShareCardProps) {
  const cardId = 'panchang-share-card';
  const fileName = `Panchang-${date.toISOString().split('T')[0]}.png`;
  // Pass the original Panchang object directly to ensure all fields are present
  const exportPanchang = panchang;

  const handleShareCard = async () => {
    const element = document.getElementById(cardId);
    if (!element) {
      alert('Card element not found!');
      return;
    }

    const success = await shareCardImage(
      {
        cardElementId: cardId,
        fileName,
      },
      {
        title: "Today's Panchang",
        text: `Check out today's Panchang for ${city}!`,
      }
    );

    if (!success) {
      alert('Failed to generate card image. Please check the console for details.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Hidden Card for Image Generation - Not visible to users */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
        <BeautifulShareCard
          eventType={(() => {
            const evt = eventTypes?.find(e => e.value === panchang?.eventType) || eventTypes[0];
            return evt?.label || 'Auspicious Event';
          })()}
          location={city}
          date={date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          dayQuality={typeof panchang?.qualityScore === 'number' ? `${Math.round(panchang.qualityScore)}%` : ''}
          tithi={getCurrentTithi(panchang)}
          featuredTime={panchang?.auspiciousPeriods?.[0]?.startTime ? `${panchang.auspiciousPeriods[0].startTime} - ${panchang.auspiciousPeriods[0].endTime}` : ''}
          timeQuality={panchang?.auspiciousPeriods?.[0]?.type === 'auspicious' ? 'Auspicious' : ''}
          nakshatra={getCurrentNakshatra(panchang)}
          sunrise={panchang?.sunrise || ''}
          sunset={panchang?.sunset || ''}
          moonPhase={''}
          blessing={undefined}
          branding={undefined}
          cta={undefined}
          qrCodeUrl={undefined}
        />
      </div>

      {/* Share Button Only */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleShareCard}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
        >
          📤 Share Card
        </Button>
      </div>
    </div>
  );
}
