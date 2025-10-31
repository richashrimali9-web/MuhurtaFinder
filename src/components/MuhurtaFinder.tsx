import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Clock, MapPin, Sparkles, Filter, Download, Share2, Info, TrendingUp, TrendingDown, Clipboard as ClipboardIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
// Select UI not used in current UI; removed to avoid unused import
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { calculatePanchang, getMuhurtaForEvent, getQualityBreakdown, eventTypes, getCurrentTithi, getCurrentNakshatra } from '../utils/panchangData';
import TimeslotList from './TimeslotListClean';
import { generateTimeSlots } from '../utils/timeslots';
import { generateCardImage } from '../utils/cardGenerator';
import { BeautifulShareCard } from './ShareableCard';

export function MuhurtaFinder() {
  // Cities array must be declared before useState that uses it
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
  const [eventType, setEventType] = useState('marriage');
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'quality'>('date');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  
  // Filter states
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [preferredNakshatras, _setPreferredNakshatras] = useState<string[]>([]);
  const [excludedTithis, _setExcludedTithis] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(60);
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
  const [muhurtaDates, setMuhurtaDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    async function fetchDates() {
      setLoading(true);
      setError(null);
      try {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Create array of all dates in the month
        const datesToFetch: Date[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(selectedYear, selectedMonth, day);
          // Skip weekends early if filter is on
          if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) continue;
          datesToFetch.push(date);
        }
        
        // Batch process to avoid rate limiting (process 10 at a time)
        const batchSize = 10; // or any suitable number
        const allResults: Array<any> = [];
        
        
        for (let i = 0; i < datesToFetch.length; i += batchSize) {
          const batch = datesToFetch.slice(i, i + batchSize);
          
          const batchPromises = batch.map(date =>
            calculatePanchang(date, selectedCity.name, selectedCity.lat, selectedCity.lon)
              .then(panchang => ({ date, panchang }))
              .catch(err => {
                console.error(`Failed to fetch panchang for ${date.toLocaleDateString()}:`, err);
                return null;
              })
          );
          
          const batchResults = await Promise.all(batchPromises);
          allResults.push(...batchResults);
          
          // Small delay between batches to avoid rate limiting
          if (i + batchSize < datesToFetch.length) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Reduced to 50ms
          }
        }
        
        // Filter and process results
        const dates = allResults
          .filter(result => result !== null)
          .map(result => {
            const { date, panchang } = result!;
            const score = getMuhurtaForEvent(eventType, panchang);
            const isPast = date < today;
            return { date, panchang, score, isPast };
          })
          .filter(item => {
            // Apply filters
            if (preferredNakshatras.length > 0 && !preferredNakshatras.includes(getCurrentNakshatra(item.panchang))) return false;
            if (excludedTithis.includes(getCurrentTithi(item.panchang))) return false;
            if (item.score < minScore) return false;
            return true;
          })
          .sort((a, b) => {
            // Sort by user preference
            if (sortBy === 'quality') {
              return b.score - a.score; // Highest score first
            } else {
              return a.date.getTime() - b.date.getTime(); // Chronological order
            }
          });
        
        if (isMounted) {
          setMuhurtaDates(dates);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching muhurta dates:', err);
        if (isMounted) {
          setError('Failed to fetch muhurta dates. Please try again.');
          setLoading(false);
        }
      }
    }
    fetchDates();
    return () => { isMounted = false; };
  }, [eventType, selectedCity, selectedMonth, selectedYear, excludeWeekends, preferredNakshatras, excludedTithis, minScore, sortBy]);

  const selectedEvent = eventTypes.find(e => e.value === eventType);

  const exportToCalendar = (date: Date) => {
    const event = selectedEvent?.label || 'Auspicious Event';
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:${event}\nDESCRIPTION:Muhurta for ${event}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muhurta.ics';
    a.click();
  };

  const shareDate = async (item: any, topSlot?: any) => {
    if (!item) {
      console.warn('shareDate called without item');
      return;
    }
    const date: Date | undefined = item.date;
    const dayQuality = item.score ?? 'N/A';
    const topStart = topSlot ? new Date(topSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const topEnd = topSlot ? new Date(topSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const title = date
      ? `${selectedEvent?.label} — ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}`
      : `${selectedEvent?.label}`;

    const lines = [title, `Day quality: ${dayQuality}%`];

    if (topSlot) {
      lines.push(`Suggested time: ${topStart} – ${topEnd} (Time quality: ${topSlot.score}%)`);
    }
    if (item.panchang) {
      lines.push(`Tithi: ${getCurrentTithi(item.panchang)} · Nakshatra: ${getCurrentNakshatra(item.panchang)}`);
    }

    const text = lines.join('\n');

    setSharing(true);
    try {

    // Try to generate an image snapshot of a small card and share that when possible
    if (typeof document !== 'undefined') {
      try {
  const cardId = 'muhurta-share-card-beautiful';
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        root.render(
          <BeautifulShareCard
            id={cardId}
            eventType={selectedEvent?.label || 'Auspicious Event'}
            location={selectedCity.name}
            date={(date || new Date()).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            dayQuality={typeof item.panchang?.qualityScore === 'number' ? `${Math.round(item.panchang.qualityScore)}%` : ''}
            tithi={getCurrentTithi(item.panchang)}
            featuredTime={topSlot ? `${topStart} – ${topEnd}` : ''}
            timeQuality={topSlot ? `${topSlot.score}%` : ''}
            nakshatra={getCurrentNakshatra(item.panchang)}
            sunrise={item.panchang?.sunrise || ''}
            sunset={item.panchang?.sunset || ''}
            moonPhase={''}
            blessing={undefined}
            branding={undefined}
            cta={undefined}
            qrCodeUrl={undefined}
          />
        );
        // Wait longer to ensure all fonts/images/styles are loaded
        // Wait longer to ensure all fonts/images/styles are loaded and card is mounted
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Ensure the card element exists before generating the image
        let cardElement = document.getElementById(cardId);
        if (!cardElement) {
          // Try a bit longer (up to 1.5s total)
          await new Promise((resolve) => setTimeout(resolve, 800));
          cardElement = document.getElementById(cardId);
        }
        if (!cardElement) {
          try { root.unmount(); } catch (e) { /* ignore */ }
          document.body.removeChild(container);
          alert('Card element not found for export. Please try again.');
          setSharing(false);
          return;
        }

        // Check if the card is visually blank (all white pixels)
  const fileName = `muhurta-${(date || new Date()).toISOString().slice(0,10)}.png`;
  const blob = await generateCardImage({ cardElementId: cardId, fileName, width: 1080, height: 1350, scale: 2, backgroundColor: '#FFD700' });
        try { root.unmount(); } catch (e) { /* ignore */ }
        document.body.removeChild(container);

        if (blob) {
          // Check if the image is blank (all white)
          const img = new Image();
          const url = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = url;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          let allWhite = true;
          if (imageData) {
            for (let i = 0; i < imageData.data.length; i += 4) {
              if (
                imageData.data[i] < 250 ||
                imageData.data[i + 1] < 250 ||
                imageData.data[i + 2] < 250
              ) {
                allWhite = false;
                break;
              }
            }
          }
          URL.revokeObjectURL(url);
          if (allWhite) {
            alert('Warning: The shared card image appears blank. Please check card data and try again.');
          }

          const file = new File([blob], fileName, { type: 'image/png' });
          try {
            // Prefer file sharing when available
            if (typeof (navigator as any).canShare === 'function' && (navigator as any).canShare({ files: [file] })) {
              try {
                await (navigator as any).share({ files: [file], title, text });
                return;
              } catch (err) {
                console.log('File share failed, falling back to fallback methods', err);
              }
            } else if (navigator.share) {
              // If file sharing not supported, try plain text sharing (may open share dialog on mobile)
              try {
                await navigator.share({ title, text });
                return;
              } catch (err) {
                console.log('Text share failed or cancelled', err);
              }
            }
          } catch (err) {
            console.log('Share attempt failed, will try download fallback', err);
          }

          // Fallback: download the image so user can manually share
          try {
            const url2 = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url2;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url2);
            return;
          } catch (err) {
            console.log('Download fallback failed', err);
          }
        }
      } catch (err) {
        console.log('Image generation failed, falling back to text share', err);
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Summary copied to clipboard!');
        return;
      }
    } catch (err) {
      console.log('Clipboard write failed', err);
    }

    // Last-resort fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Summary copied to clipboard!');
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-gradient">
            Plan Your Auspicious Events
          </h1>
          <p className="text-muted-foreground">
            Discover auspicious dates and times for your important life events based on Vedic astrology
          </p>
        </div>
      
      {/* Input Section */}
      <Card data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="eventType" className="text-sm leading-none font-medium select-none flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Event Type
            </Label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm leading-none font-medium select-none flex items-center gap-2">
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
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm leading-none font-medium select-none flex items-center gap-2">
              <span style={{ color: '#8B2C19', fontSize: '16px' }}>📅</span>
              Month
            </Label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm leading-none font-medium select-none flex items-center gap-2">
              <span style={{ color: '#8B2C19', fontSize: '16px' }}>📅</span>
              Year
            </Label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-background rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="weekends"
                checked={excludeWeekends}
                onCheckedChange={(checked: any) => setExcludeWeekends(checked as boolean)}
              />
              <Label htmlFor="weekends">Exclude weekends</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Quality Score: {minScore}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Card>
      
      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Auspicious Dates ({muhurtaDates.length} found)</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSortBy('date')}
              style={sortBy === 'date' ? { 
                background: 'linear-gradient(to right, #f97316, #d97706)',
                color: 'white',
                borderColor: '#f97316'
              } : {}}
              variant="outline"
            >
              By Date
            </Button>
            <Button
              onClick={() => setSortBy('quality')}
              style={sortBy === 'quality' ? { 
                background: 'linear-gradient(to right, #f97316, #d97706)',
                color: 'white',
                borderColor: '#f97316'
              } : {}}
              variant="outline"
            >
              By Quality
            </Button>
          </div>
        </div>
        
        {loading ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <span className="ml-4 text-orange-600">Finding auspicious dates...</span>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Retry
            </Button>
          </Card>
        ) : muhurtaDates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-foreground font-semibold">
              No auspicious dates found for the selected criteria. Try adjusting your filters or selecting a different month.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 gap-y-[28px]">
            {muhurtaDates.map((item, idx) => {
              // Use actual breakdown calculation for day score
              const breakdown = getQualityBreakdown(eventType, item.panchang);
              const dayScore = breakdown.total;
              const topSlot = generateTimeSlots({
                date: item.date,
                sunrise: item.panchang?.sunrise,
                sunset: item.panchang?.sunset,
                tithi: item.panchang?.tithi,
                nakshatra: item.panchang?.nakshatra,
                quality: dayScore,
              }, 60, 30)[0];
              const dayScoreClass = dayScore >= 80
                ? 'bg-green-100 text-green-800'
                : dayScore >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-orange-100 text-orange-800';
              const dayScoreTextClass = dayScore >= 80
                ? 'text-green-600'
                : dayScore >= 60
                ? 'text-yellow-600'
                : 'text-orange-600';

              return (
                <Card 
                  key={idx}
                  className={`bg-card text-card-foreground flex flex-col gap-6 rounded-[14px] p-4 transition-all relative ${item.isPast ? 'opacity-60' : ''}`}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #E8D4B8', borderRadius: '14px', overflow: 'hidden' }}
                >
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 200 200" fill="none">
                    <g>
                      <path d="M100 30 C110 60, 140 60, 150 30 Q120 80, 100 150 Q80 80, 50 30 C60 60, 90 60, 100 30 Z" fill="#E8833D" />
                      <ellipse cx="100" cy="120" rx="18" ry="8" fill="#FFD700" />
                    </g>
                  </svg>
                  <div className="space-y-3">
                    {/* Header with date, badge and score */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3>
                            {item.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </h3>
                          {item.isPast && (
                            <Badge className="border-transparent bg-secondary text-secondary-foreground text-xs">
                              Past
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {item.panchang.masa}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${dayScoreClass}`}>
                            <span style={{ fontSize: '12px' }}>📅</span>
                            Day
                          </span>
                          <div className={`text-2xl ${dayScoreTextClass}`}>
                            {dayScore}%
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Day quality</p>
                      </div>
                    </div>

                    {/* Featured timeslot */}
                    {topSlot && (
                      <div 
                        className={
                          item.isPast 
                            ? 'mt-3 p-4 rounded-[12px] flex items-center justify-between overflow-visible shadow-lg relative bg-orange-50 border border-orange-100'
                            : 'mt-3 p-4 rounded-[12px] flex items-center justify-between overflow-visible shadow-lg relative'
                        }
                        style={item.isPast 
                          ? { zIndex: 2, color: '#111827', padding: '14px' } 
                          : { 
                              zIndex: 2, 
                              color: 'white',
                              background: 'linear-gradient(90deg, #E8833D 0%, #D67530 100%)',
                              borderRadius: '12px',
                              padding: '14px'
                            }
                        }
                      >
                        <div>
                          <div className="text-lg md:text-xl font-semibold leading-tight">
                            {new Date(topSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} — {new Date(topSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                          <div className="text-xs" style={item.isPast ? { color: '#4b5563' } : { color: 'rgba(255,255,255,0.9)' }}>Featured suggested time</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
                              item.isPast ? 'bg-orange-200 text-orange-800' : 'bg-white/20'
                            }`}
                            style={!item.isPast ? { color: 'white' } : {}}
                            >
                              <Clock className="w-3 h-3" />
                              Time
                            </span>
                            <div className="text-2xl font-bold" style={item.isPast ? { color: '#ea580c' } : { color: 'white' }}>{topSlot.score}%</div>
                          </div>
                          <div className="text-xs" style={item.isPast ? { color: '#4b5563' } : { color: 'rgba(255,255,255,0.9)' }}>Time slot quality</div>
                        </div>
                      </div>
                    )}

                    {/* Festival badge if any */}
                    {item.panchang.festival && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-sm">🎉 {item.panchang.festival}</p>
                      </div>
                    )}

                    {/* Panchang info */}
                    <div
                      className="grid grid-cols-2 grid-rows-2 text-sm"
                      style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '8px', border: 'none', boxShadow: 'none' }}
                    >
                      {/* Tithi */}
                      <div
                        className="flex flex-col items-center justify-center"
                        style={{ background: '#FFFFFF', borderRight: '1px solid #E0CDB8', borderBottom: '1px solid #E0CDB8', padding: '18px', gap: '12px' }}
                      >
                        <span className="font-bold text-muted-foreground" style={{ fontWeight: 700, fontSize: '16px' }}>Tithi</span>
                        <span className="text-foreground" style={{ fontWeight: 500, fontSize: '18px', marginTop: '2px' }}>
                          {getCurrentTithi(item.panchang) && getCurrentTithi(item.panchang) !== 'Unknown' && getCurrentTithi(item.panchang) !== ''
                            ? getCurrentTithi(item.panchang)
                            : 'Unavailable'}
                        </span>
                      </div>
                      {/* Nakshatra */}
                      <div
                        className="flex flex-col items-center justify-center"
                        style={{ background: '#FFF9F0', borderBottom: '1px solid #E0CDB8', padding: '18px', gap: '12px', marginLeft: '12px' }}
                      >
                        <span className="font-bold text-muted-foreground" style={{ fontWeight: 700, fontSize: '16px' }}>Nakshatra</span>
                        <span className="text-foreground" style={{ fontWeight: 500, fontSize: '18px', marginTop: '2px' }}>
                          {getCurrentNakshatra(item.panchang) && getCurrentNakshatra(item.panchang) !== 'Unknown' && getCurrentNakshatra(item.panchang) !== ''
                            ? getCurrentNakshatra(item.panchang)
                            : 'Unavailable'}
                        </span>
                      </div>
                      {/* Sunrise */}
                      <div
                        className="flex flex-col items-center justify-center"
                        style={{ background: '#FFF9F0', borderRight: '1px solid #E0CDB8', padding: '18px', gap: '12px' }}
                      >
                        <span className="font-bold text-muted-foreground" style={{ fontWeight: 700, fontSize: '16px' }}>Sunrise</span>
                        <span className="text-foreground" style={{ fontWeight: 500, fontSize: '18px', marginTop: '2px' }}>
                          {typeof item.panchang.sunrise === 'string' ? item.panchang.sunrise : 'N/A'}
                        </span>
                      </div>
                      {/* Sunset */}
                      <div
                        className="flex flex-col items-center justify-center"
                        style={{ background: '#FFFFFF', padding: '18px', gap: '12px' }}
                      >
                        <span className="font-bold text-muted-foreground" style={{ fontWeight: 700, fontSize: '16px' }}>Sunset</span>
                        <span className="text-foreground" style={{ fontWeight: 500, fontSize: '18px', marginTop: '2px' }}>
                          {typeof item.panchang.sunset === 'string' ? item.panchang.sunset : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Suggested times section */}
                    <div className="flex gap-2 pt-2 items-center">
                      <div className="mt-3 px-4 py-3 rounded-[10px] flex-1" style={{ backgroundColor: '#FDF3E7', padding: '14px', border: '2px solid #DDB88C' }}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Suggested times</div>
                          <button 
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const newExpanded = new Set(expandedCards);
                              if (newExpanded.has(idx)) {
                                newExpanded.delete(idx);
                              } else {
                                newExpanded.add(idx);
                              }
                              setExpandedCards(newExpanded);
                            }}
                          >
                            {expandedCards.has(idx) ? 'Less' : `More (${generateTimeSlots({
                              date: item.date,
                              sunrise: item.panchang?.sunrise,
                              sunset: item.panchang?.sunset,
                              tithi: item.panchang?.tithi,
                              nakshatra: item.panchang?.nakshatra,
                              quality: item.score,
                            }, 60, 30).length - 1})`}
                          </button>
                        </div>
                        <div className={`mt-2 flex flex-col gap-2 ${expandedCards.has(idx) ? 'max-h-none' : 'max-h-36'} overflow-y-auto`}>
                          {generateTimeSlots({
                            date: item.date,
                            sunrise: item.panchang?.sunrise,
                            sunset: item.panchang?.sunset,
                            tithi: item.panchang?.tithi,
                            nakshatra: item.panchang?.nakshatra,
                            quality: item.score,
                          }, 60, 30).slice(0, expandedCards.has(idx) ? undefined : 1).map((slot, slotIdx) => {
                            const scoreClass = slot.score >= 80
                              ? 'text-green-600'
                              : slot.score >= 60
                              ? 'text-yellow-600'
                              : 'text-orange-600';
                            
                            return (
                              <div key={slotIdx} className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div
                                    className="font-bold text-base truncate"
                                    style={slotIdx === 0 ? {
                                      background: 'linear-gradient(90deg, #E8833D 0%, #D67530 100%)',
                                      borderRadius: '12px',
                                      padding: '6px 12px',
                                      color: '#fff',
                                      marginBottom: '6px',
                                    } : {}}
                                  >
                                    {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} — {new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    <span 
                                      style={{ 
                                        color: '#8B2C19',
                                        backgroundColor: '#FFF8DC',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        marginLeft: '8px',
                                        border: '1px solid #8B2C19'
                                      }}
                                    >
                                      {slot.score}%
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {slotIdx === 0 ? 'Featured' : 'Alternative'} slot
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    className="flex items-center justify-center transition-colors"
                                    style={{ width: 28, height: 28, background: 'none', border: 'none', color: '#E8833D' }}
                                    title="Copy time"
                                    onClick={() => {
                                      const timeText = `${new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                      navigator.clipboard.writeText(timeText);
                                    }}
                                    onMouseOver={e => e.currentTarget.style.color = '#FFD700'}
                                    onMouseOut={e => e.currentTarget.style.color = '#E8833D'}
                                  >
                                    <ClipboardIcon className="w-7 h-7" style={{ color: 'inherit' }} />
                                  </button>
                                    <span
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Calendar clicked for slot:', slotIdx);
                                        // Download .ics calendar event for this slot
                                        const slotStart = new Date(slot.start);
                                        const slotEnd = new Date(slot.end);
                                        const pad = (n) => n.toString().padStart(2, '0');
                                        const formatICS = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
                                        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${formatICS(slotStart)}\nDTEND:${formatICS(slotEnd)}\nSUMMARY:Astro Event Planner Slot\nDESCRIPTION:Suggested time slot for event\nEND:VEVENT\nEND:VCALENDAR`;
                                        const blob = new Blob([ics], { type: 'text/calendar' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `event-slot-${slotIdx+1}.ics`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      aria-label="Add to calendar"
                                      title="Add to calendar"
                                      style={{ 
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '32px',
                                        minHeight: '32px',
                                        userSelect: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      📅
                                    </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {item.isPast && (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: '8px', textAlign: 'center', margin: 0, padding: 0 }}>
    <p className="text-xs text-muted-foreground" style={{ margin: 0, padding: 0, fontSize: '11px', opacity: 0.7 }}>Historical reference only</p>
  </div>
)}

                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-9 h-9 p-0 flex items-center justify-center rounded border bg-white dark:bg-gray-800"
                          title="Why this date"
                          aria-label="Why this date"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Quality Breakdown</DialogTitle>
                          <DialogDescription>
                            Detailed analysis of factors contributing to this date's auspiciousness score
                          </DialogDescription>
                        </DialogHeader>
                        {(() => {
                          const breakdown = getQualityBreakdown(eventType, item.panchang);
                          return (
                            <div className="space-y-4">
                              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                                <div className="text-4xl mb-2 font-bold text-gray-900">{breakdown.total}%</div>
                                <p className="text-sm text-gray-600 font-semibold">Overall Quality Score</p>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="font-semibold">Contributing Factors:</h4>
                                {breakdown.factors.map((factor, fidx) => (
                                  <div 
                                    key={fidx}
                                    className={`p-3 rounded-lg border ${
                                      factor.value > 0 
                                        ? 'bg-green-50 border-green-200' 
                                        : factor.value < 0
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          {factor.value > 0 ? (
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                          ) : factor.value < 0 ? (
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                          ) : (
                                            <span className="w-4 h-4 text-gray-400">◆</span>
                                          )}
                                          <span className="font-medium">{factor.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{factor.reason}</p>
                                      </div>
                                      <Badge 
                                        variant={factor.value > 0 ? 'default' : factor.value < 0 ? 'destructive' : 'secondary'}
                                        className="ml-2"
                                      >
                                        {factor.value > 0 ? '+' : ''}{factor.value}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9 p-0 flex items-center justify-center rounded border bg-white dark:bg-gray-800"
                      onClick={() => exportToCalendar(item.date)}
                      title="Export to calendar"
                      aria-label="Export to calendar"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-9 h-9 p-0 flex items-center justify-center rounded border bg-white dark:bg-gray-800"
                      onClick={() => shareDate(item, topSlot)}
                      disabled={sharing}
                      title="Share date"
                      aria-label="Share date"
                    >
                      {sharing ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </main>
  );
}

