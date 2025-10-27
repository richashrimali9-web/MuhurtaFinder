import { Button } from './ui/button';
import { PanchangData } from '../utils/panchangData';
import { PanchangCard } from './PanchangCard';
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
        <PanchangCard date={date} city={city} panchang={exportPanchang} cardId={cardId} />
      </div>

      {/* Share Button Only */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleShareCard}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          📤 Share Card
        </Button>
      </div>
    </div>
  );
}
