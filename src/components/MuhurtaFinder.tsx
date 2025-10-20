import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Calendar, Clock, MapPin, Sparkles, Filter, Download, Share2, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
// Select UI not used in current UI; removed to avoid unused import
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { calculatePanchang, getMuhurtaForEvent, getQualityBreakdown, eventTypes, getFestivalsForMonth } from '../utils/panchangData';
import TimeslotList from './TimeslotListClean';
import { generateTimeSlots } from '../utils/timeslots';
import { generateCardImage } from '../utils/cardGenerator';
import SmallShareCard from './ShareableCard/SmallShareCard';

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
      console.log('Starting to fetch dates for', months[selectedMonth], selectedYear);
      setLoading(true);
      setError(null);
      try {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log(`Fetching ${daysInMonth} days for ${months[selectedMonth]} ${selectedYear}`);
        
        // Create array of all dates in the month
        const datesToFetch: Date[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(selectedYear, selectedMonth, day);
          // Skip weekends early if filter is on
          if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) continue;
          datesToFetch.push(date);
        }
        
        console.log(`After filtering, ${datesToFetch.length} dates to fetch`);
        
        // Batch process to avoid rate limiting (process 10 at a time)
        const batchSize = 10;
        const allResults: Array<any> = [];
        
        for (let i = 0; i < datesToFetch.length; i += batchSize) {
          const batch = datesToFetch.slice(i, i + batchSize);
          console.log(`Fetching batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(datesToFetch.length/batchSize)} (${batch.length} dates)`);
          
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
        
        console.log(`Fetched ${allResults.filter(r => r !== null).length} results successfully`);
        
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
            if (preferredNakshatras.length > 0 && !preferredNakshatras.includes(item.panchang.nakshatra)) return false;
            if (excludedTithis.includes(item.panchang.tithi)) return false;
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
        
        console.log(`After filtering by score (>=${minScore}), ${dates.length} dates remain`);
        
        if (isMounted) {
          console.log('Setting muhurtaDates state with', dates.length, 'dates');
          setMuhurtaDates(dates);
          setLoading(false);
          console.log('Dates loaded successfully!');
          
          // Debug: Check state after a short delay
          setTimeout(() => {
            console.log('State check - muhurtaDates should now have', dates.length, 'items');
          }, 100);
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

  const festivals = getFestivalsForMonth(selectedYear, selectedMonth);
  
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
      lines.push(`Tithi: ${item.panchang.tithi} · Nakshatra: ${item.panchang.nakshatra}`);
    }

    const text = lines.join('\n');

  setSharing(true);
  try {

  // Try to generate an image snapshot of a small card and share that when possible
  if (typeof document !== 'undefined') {
      try {
        const cardId = 'muhurta-share-card-small';
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        root.render(
          <SmallShareCard
            id={cardId}
            date={date || new Date()}
            city={selectedCity.name}
            dayQuality={dayQuality}
            topSlot={topSlot}
            tithi={item.panchang?.tithi}
            nakshatra={item.panchang?.nakshatra}
            sunrise={item.panchang?.sunrise}
            sunset={item.panchang?.sunset}
          />
        );
        await new Promise((resolve) => setTimeout(resolve, 120));

          try {
          const fileName = `muhurta-${(date || new Date()).toISOString().slice(0,10)}.png`;
          const blob = await generateCardImage({ cardElementId: cardId, fileName, width: 420, height: 260, scale: 2, backgroundColor: '#ffffff' });
          try { root.unmount(); } catch (e) { /* ignore */ }
          document.body.removeChild(container);

          if (blob) {
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
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
              return;
            } catch (err) {
              console.log('Download fallback failed', err);
            }
          }
        } catch (err) {
          console.log('Image generation failed, falling back to text share', err);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-gradient">Plan Your Auspicious Events</h1>
        <p className="text-muted-foreground">
          Discover auspicious dates and times for your important life events based on Vedic astrology
        </p>
      </div>
      
      {/* Input Section */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="eventType" className="flex items-center gap-2">
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
            <Label htmlFor="location" className="flex items-center gap-2">
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
            <Label htmlFor="month" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
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
            <Label htmlFor="year" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
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
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
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
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('date')}
            >
              By Date
            </Button>
            <Button
              variant={sortBy === 'quality' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('quality')}
            >
              By Quality
            </Button>
          </div>
        </div>
        
        {loading ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-4 text-purple-500">Finding auspicious dates...</span>
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
            <p className="text-muted-foreground">
              No auspicious dates found for the selected criteria. Try adjusting your filters or selecting a different month.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {muhurtaDates.map((item, idx) => {
              const festivalOnDate = festivals.find(f => 
                f.date.getDate() === item.date.getDate()
              );
              
              const topSlot = generateTimeSlots({
                date: item.date,
                sunrise: item.panchang?.sunrise,
                sunset: item.panchang?.sunset,
                tithi: item.panchang?.tithi,
                nakshatra: item.panchang?.nakshatra,
                quality: item.score,
              }, 60, 30)[0];

              return (
                      <Card 
                        key={idx}
                        className={`p-4 transition-all hover:shadow-lg ${
                          idx === 0 && !item.isPast ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20' : ''
                        } ${item.isPast ? 'opacity-60' : ''}`}
                      >
                        <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3>
                            {item.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </h3>
                          {idx === 0 && !item.isPast && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              Best
                            </Badge>
                          )}
                          {item.isPast && (
                            <Badge variant="secondary" className="text-xs">
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
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${item.score >= 80 ? 'bg-green-100 text-green-800' : item.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                            <Calendar className="w-3 h-3" />
                            Day
                          </span>
                          <div className={`text-2xl ${item.score >= 80 ? 'text-green-600' : item.score >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                            {item.score}%
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Day quality</p>
                      </div>
                    </div>
                    {/* Prominent featured timeslot (top suggestion) */}
                    {topSlot && (
                      <div className={`mt-3 p-4 rounded-lg flex items-center justify-between overflow-visible shadow-lg relative ${item.isPast ? 'bg-white/5 text-muted-foreground border border-gray-100' : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'}`} style={{ zIndex: 2 }}>
                        <div>
                          <div className="text-lg md:text-xl font-semibold leading-tight">
                            {new Date(topSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(topSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs opacity-90">Featured suggested time</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium bg-white/20 text-white/90">
                              <Clock className="w-3 h-3" />
                              Time
                            </span>
                            <div className="text-2xl font-bold">{topSlot.score}%</div>
                          </div>
                          <div className="text-xs opacity-90">Time slot quality</div>
                        </div>
                      </div>
                    )}
                    
                    {festivalOnDate && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-sm">🎉 {festivalOnDate.name}</p>
                      </div>
                    )}
                    
                    {/* Compact horizontal info row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tithi:</span>
                        <span className="font-medium">{item.panchang.tithi}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Nakshatra:</span>
                        <span className="font-medium">{item.panchang.nakshatra}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sunrise:</span>
                        <span className="font-medium">{item.panchang.sunrise}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sunset:</span>
                        <span className="font-medium">{item.panchang.sunset}</span>
                      </div>
                    </div>
                    
                    {!item.isPast && (
                      <div className="flex gap-2 pt-2 items-center">
                        {/* Suggested times (kept compact) */}
                        <TimeslotList dateInfo={item} />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-9 h-9 p-0 flex items-center justify-center"
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
                                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                                    <div className="text-4xl mb-2">{breakdown.total}%</div>
                                    <p className="text-sm text-muted-foreground">Overall Quality Score</p>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <h4>Contributing Factors:</h4>
                                    {breakdown.factors.map((factor, fidx) => (
                                      <div 
                                        key={fidx}
                                        className={`p-3 rounded-lg border ${
                                          factor.value > 0 
                                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                                            : factor.value < 0
                                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                            : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
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
                                            <p className="text-sm text-muted-foreground mt-1">{factor.reason}</p>
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
                          size="sm"
                          variant="outline"
                          className="w-9 h-9 p-0 flex items-center justify-center"
                          onClick={() => exportToCalendar(item.date)}
                          title="Export to calendar"
                          aria-label="Export to calendar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-9 h-9 p-0 flex items-center justify-center"
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
                    )}
                    {item.isPast && (
                      <div className="pt-2 text-center">
                        <p className="text-xs text-muted-foreground">Historical reference only</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

