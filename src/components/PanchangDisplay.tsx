import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Sun, Moon, Star, Info, MapPin } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaTwitter, FaShareAlt } from 'react-icons/fa';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { calculatePanchang, type PanchangData, getActionableInsights, getFestivalForDate } from '../utils/panchangData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
// lightweight: not using ICS export in this component right now
import { generateCardImage } from '../utils/cardGenerator';
import { PanchangCard } from './PanchangCard';

export function PanchangDisplay() {
  const cities = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
    { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
    { name: 'Pali', lat: 25.7725, lon: 73.3234 }
  ];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  // Helper function to generate card image and share via social media
  const shareCardToSocial = async (platform: 'whatsapp' | 'twitter' | 'facebook' | 'instagram') => {
    const cardId = 'panchang-share-card';
    const fileName = `Panchang-${selectedDate.toISOString().split('T')[0]}.png`;
    
    const blob = await generateCardImage({
      cardElementId: cardId,
      fileName,
    });

    if (!blob) {
      alert('Failed to generate card image');
      return;
    }

    // Convert blob to URL for social sharing
    const imageUrl = URL.createObjectURL(blob);
    const text = `Check out today's Panchang for ${selectedCity.name}! - Astro Event Planner`;

    // Try Web Share API (Level 2) to share the image file directly when available (mobile browsers)
    try {
      const file = new File([blob], fileName, { type: blob.type || 'image/png' });

      // Use navigator.canShare if available to check file share support
      const canShareFiles = (navigator as any).canShare ? (navigator as any).canShare({ files: [file] }) : false;

      if ((navigator as any).share && canShareFiles) {
        await (navigator as any).share({ files: [file], text });
        URL.revokeObjectURL(imageUrl);
        return;
      }
    } catch (err) {
      // swallow and fall back to existing behavior
      console.info('Web Share API unavailable or failed, falling back to download+link share', err);
    }

    // Fallbacks: download image for apps that don't accept direct file sharing from the browser
    switch (platform) {
      case 'whatsapp':
        // Download image and open WhatsApp web/text share
        {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(imageUrl);
          // Open chat composer with text (image must be attached manually in most cases)
          window.open(`https://wa.me/?text=${encodeURIComponent(text + ' https://astroeventplanner.com')}`, '_blank');
        }
        break;
      case 'twitter':
        // Twitter Web Intent cannot pre-upload images from the browser. Share the text + site link.
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://astroeventplanner.com`, '_blank');
        break;
      case 'facebook':
        // Facebook web share accepts URLs only; recommend uploading the downloaded image in-app
        window.open(`https://www.facebook.com/sharer/sharer.php?u=https://astroeventplanner.com&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        // Instagram web doesn't allow direct image uploads — download and prompt user
        {
          const downloadLink = document.createElement('a');
          downloadLink.href = imageUrl;
          downloadLink.download = fileName;
          downloadLink.click();
          URL.revokeObjectURL(imageUrl);
          alert('Image downloaded! Please open Instagram and share from your gallery.');
        }
        break;
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    async function fetchData() {
      try {
        const result = await calculatePanchang(selectedDate, selectedCity.name, selectedCity.lat, selectedCity.lon);
        if (!cancelled) {
          setPanchang(result);
        }
      } catch (e) {
        if (!cancelled) setError('Failed to fetch panchang data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    fetchData();
    return () => { cancelled = true; };
  }, [selectedDate, selectedCity]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    handleDateChange(newDate);
  };
  
  const goToToday = () => {
    handleDateChange(new Date());
  };
  
  const infoItems = [
    {
      label: 'Tithi',
      value: panchang?.tithi || '--',
      description: 'Lunar day in the Hindu calendar',
      icon: Moon
    },
    {
      label: 'Nakshatra',
      value: panchang?.nakshatra || '--',
      description: 'Lunar mansion or constellation',
      icon: Star
    },
    {
      label: 'Yoga',
      value: panchang?.yoga || '--',
      description: 'Auspicious combination of sun and moon',
      icon: Sun
    },
    {
      label: 'Karana',
      value: panchang?.karana || '--',
      description: 'Half of a Tithi',
      icon: CalendarIcon
    }
  ];
  
  return (
    <div className="relative">
      {/* Header as full-bleed bar; inner content aligned to main container width */}
      <Card className="header-gradient header-glow rounded-2xl py-3 glass-card w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-gradient text-3xl sm:text-4xl font-semibold tracking-tight mx-auto">Astro Event Planner</h1>
          <p className="text-muted-foreground text-sm mt-1 mx-auto">Daily Panchang Guide</p>
          <div className="mt-3 border-t border-purple-200/60"></div>
        </div>
      </Card>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Hidden card for image generation (kept off-screen for html2canvas) */}
      {panchang && (
        <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
          <PanchangCard 
            date={selectedDate} 
            city={selectedCity.name} 
            panchang={panchang} 
            cardId="panchang-share-card" 
          />
        </div>
      )}
      
      
      
  {/* Date and Location Selector */}
  <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm transition-shadow hover:shadow-md glass-card">
        <div className="grid gap-3 sm:gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-xs sm:text-sm">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <select
              id="location"
              value={selectedCity.name}
              onChange={e => {
                const city = cities.find(c => c.name === e.target.value);
                if (city) {
                  setSelectedCity(city);
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
            >
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <Button onClick={goToPreviousDay} variant="outline" size="sm" className="w-20 sm:w-auto">
            ← Prev
          </Button>
          
          <div className="text-center space-y-1">
            <h2 className="text-sm sm:text-base md:text-lg whitespace-normal break-words">
              {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </h2>
            {panchang && (
              <p className="text-muted-foreground text-xs">
                {panchang.masa} | {panchang.paksha}
              </p>
            )}
          </div>
          
          <Button onClick={goToNextDay} variant="outline" size="sm" className="w-20 sm:w-auto">
            Next →
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <Button onClick={goToToday} variant="secondary" size="sm">
            Today
          </Button>
        </div>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></span>
          <span className="ml-4 text-blue-500">Loading panchang data...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : panchang ? (
        <>
      {/* Festival Highlights */}
      {(() => {
        const festival = getFestivalForDate(selectedDate);
        if (!festival) return null;
        
        const getFestivalEmoji = (name: string) => {
          if (name.includes('Diwali')) return '🪔';
          if (name.includes('Holi')) return '🌈';
          if (name.includes('Krishna') || name.includes('Janmashtami')) return '🪈';
          if (name.includes('Ganesha')) return '🐘';
          if (name.includes('Christmas')) return '🎄';
          if (name.includes('Independence')) return '🇮🇳';
          if (name.includes('Republic')) return '🇮🇳';
          if (name.includes('Makar')) return '🌾';
          return '🎉';
        };
        
        return (
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 rounded-lg shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{getFestivalEmoji(festival.name)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-200">
                  🎊 {festival.name}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  {festival.description}
                </p>
                <Badge 
                  variant="secondary" 
                  className={`mt-2 ${
                    festival.type === 'major' ? 'bg-red-200 dark:bg-red-900' :
                    festival.type === 'regional' ? 'bg-blue-200 dark:bg-blue-900' :
                    'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {festival.type === 'major' ? '★ Major Festival' : festival.type === 'regional' ? '◆ Regional' : '○ Minor'}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })()}
      
      {/* Auspiciousness Score (circular progress) */}
  <Card className="p-6 cursor-pointer rounded-2xl transition-shadow hover:shadow-md glass-card" onClick={() => setShowQualityDetails(!showQualityDetails)}>
          <div className="flex flex-col items-center justify-center gap-4 text-center w-full">
          <div>
            <h3 className="text-lg font-semibold">Auspiciousness Score</h3>
            <p className="text-muted-foreground text-sm">Click to see contributing factors</p>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="relative w-32 h-32 mx-auto">
              {/* compute stroke dasharray based on circumference (radius ~15.9155 => circumference ~100) */}
              {(() => {
                const score = Math.max(0, Math.min(100, Number(panchang.qualityScore ?? 0)));
                const radius = 15.9155;
                const circumference = 2 * Math.PI * radius;
                const dash = `${(score / 100) * circumference} ${circumference}`;
                const gradientId = 'grade-ui';
                return (
                  <svg viewBox="0 0 36 36" className="w-full h-full" role="img" aria-labelledby="grade-title grade-desc">
                    <title id="grade-title">Auspiciousness score</title>
                    <desc id="grade-desc">Daily auspiciousness: {panchang.qualityScore}%</desc>
                    <defs>
                      <linearGradient id={gradientId} x1="0%" x2="100%">
                        <stop offset="0%" stopColor="var(--chart-1, #f59e0b)" />
                        <stop offset="50%" stopColor="var(--chart-5, #f97316)" />
                        <stop offset="100%" stopColor="var(--chart-2, #60a5fa)" />
                      </linearGradient>
                    </defs>
                    <path d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831" fill="none" strokeOpacity="0.08" strokeWidth="4" stroke="var(--muted-foreground, #6b7280)" />
                    <path
                      d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="4"
                      strokeDasharray={dash}
                      strokeLinecap="round"
                    />
                  </svg>
                );
              })()}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`text-2xl font-semibold ${panchang.qualityScore >= 70 ? 'text-green-600' : panchang.qualityScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}
                  aria-hidden
                  style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-0.06em)' }}
                >
                  {Math.max(0, Math.min(100, Number(panchang.qualityScore ?? 0)))}%
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-center">
              <Badge 
              variant={panchang.isAuspicious ? 'default' : 'secondary'}
              className={panchang.isAuspicious ? 'bg-green-600' : ''}
            >
              {panchang.isAuspicious ? 'Auspicious' : 'Moderate'}
            </Badge>
            </div>
          </div>
        </div>
        
        {/* Factor Breakdown (appears on click) */}
        {showQualityDetails && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="font-semibold text-sm">Why {panchang.qualityScore}%?</p>
            <ul className="text-sm space-y-1">
              <li className="flex justify-between">
                <span>✓ {panchang.nakshatra} (Nakshatra):</span>
                <span className="text-green-600">+20</span>
              </li>
              <li className="flex justify-between">
                <span>✓ {panchang.tithi} (Tithi):</span>
                <span className="text-green-600">+15</span>
              </li>
              <li className="flex justify-between">
                <span>{panchang.paksha === 'Shukla Paksha' ? '✓' : '◦'} {panchang.paksha}:</span>
                <span className="text-yellow-600">+10</span>
              </li>
              <li className="flex justify-between">
                <span>Base Score:</span>
                <span>+50</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground italic mt-3">
              💡 Tip: Different events may have different ideal Nakshatras and Tithis. Check event-specific recommendations!
            </p>
          </div>
        )}
      </Card>
      
  {/* Today's Do's and Don'ts Card */}
      {(() => {
        const insights = getActionableInsights(panchang);
        return (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 rounded-lg shadow-sm transition-shadow hover:shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              💡 Today's Do's and Don'ts
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Do's Column */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
                  ✅ Best For
                </h3>
                {insights.dos.length > 0 ? (
                  <ul className="space-y-1">
                    {insights.dos.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Neutral day for most activities</p>
                )}
              </div>
              
              {/* Don'ts Column */}
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
                  ⚠️ Avoid
                </h3>
                {insights.donts.length > 0 ? (
                  <ul className="space-y-1">
                    {insights.donts.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Most activities are favorable</p>
                )}
              </div>
              
              {/* Lucky Activities */}
              <div className="space-y-2 md:col-span-2">
                <h3 className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-400">
                  🌟 Lucky Activities
                </h3>
                {insights.luckyActivities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {insights.luckyActivities.map((activity, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Regular day activities</p>
                )}
              </div>
              
              {/* Fasting Info */}
              {insights.fasting && (
                <div className="space-y-2 md:col-span-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {insights.fasting}
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })()}
      
      {/* Panchang Details */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {infoItems.map((item, idx) => (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-3 sm:p-4 rounded-2xl shadow-sm transition-shadow hover:shadow-lg cursor-help glass-card flex flex-col justify-center min-h-[72px]">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex-shrink-0">
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.label}</p>
                        <Info className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="mt-1 text-sm sm:text-base font-semibold break-words">{item.value}</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      {/* Additional Details */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
  <Card className="p-4 sm:p-6 rounded-md shadow-sm transition-shadow hover:shadow-md">
          <h3 className="mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            Sun Timings
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs sm:text-base">
              <span className="text-muted-foreground">Sunrise</span>
              <span className="font-semibold">{panchang.sunrise}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/20 rounded text-xs sm:text-base">
              <span className="text-muted-foreground">Sunset</span>
              <span className="font-semibold">{panchang.sunset}</span>
            </div>
          </div>
        </Card>
        
  <Card className="p-4 sm:p-6 rounded-md shadow-sm transition-shadow hover:shadow-md">
          <h3 className="mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Lunar Details
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded text-xs sm:text-base">
              <span className="text-muted-foreground">Moon Sign</span>
              <span className="font-semibold">{panchang.moonSign}</span>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded text-xs sm:text-base">
              <span className="text-muted-foreground">Paksha</span>
              <span className="font-semibold">{panchang.paksha}</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Social share area: visible label + centered icon buttons with tooltips, hover & focus styles */}
      <div className="w-full flex justify-center items-center gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 shadow-sm">
            <FaShareAlt className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Share</span>
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Share on WhatsApp"
                  aria-describedby="share-help"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full text-white transition-transform duration-200 ease-out hover:scale-110 hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: 'var(--brand-whatsapp, #25D366)', boxShadow: '0 6px 24px rgba(37,211,102,0.18)' }}
                  onClick={() => shareCardToSocial('whatsapp')}
                >
                  <FaWhatsapp className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share to WhatsApp</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Share on X"
                  aria-describedby="share-help"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full text-white transition-transform duration-200 ease-out hover:scale-110 hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: 'var(--brand-twitter, #000000)', boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }}
                  onClick={() => shareCardToSocial('twitter')}
                >
                  <FaTwitter className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share to X (Twitter)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Share on Facebook"
                  aria-describedby="share-help"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full text-white transition-transform duration-200 ease-out hover:scale-110 hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: 'var(--brand-facebook, #1877F2)', boxShadow: '0 6px 24px rgba(24,119,242,0.18)' }}
                  onClick={() => shareCardToSocial('facebook')}
                >
                  <FaFacebookF className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share to Facebook</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Open Instagram"
                  aria-describedby="share-help"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full text-white transition-transform duration-200 ease-out hover:scale-110 hover:shadow-xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ background: 'var(--brand-instagram, linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%))', boxShadow: '0 6px 24px rgba(217,106,175,0.14)' }}
                  onClick={() => window.open('https://instagram.com/', '_blank')}
                >
                  <FaInstagram className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Instagram</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Helper text to explain sharing behavior (useful on mobile/web) */}
      <div className="w-full flex justify-center mt-1">
        <p id="share-help" className="text-xs text-muted-foreground text-center max-w-xl px-4">
          Tap to download a share image. On mobile you can then open the social app and post the downloaded image from your gallery.
        </p>
      </div>
      {/* Information Box */}
  <Card className="p-4 sm:p-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 rounded-lg shadow-sm transition-shadow hover:shadow-md">
        <h3 className="mb-2 text-base sm:text-lg font-semibold">What is Panchang?</h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Panchang is a Hindu calendar and almanac that provides important astronomical and astrological data for each day. 
          It consists of five elements (Panch-Ang): Tithi, Nakshatra, Yoga, Karana, and Var (weekday). 
          These elements are used to determine auspicious times (Muhurta) for important events and ceremonies.
        </p>
      </Card>
        </>
      ) : null}
    </div>
    </div>
  );
}
