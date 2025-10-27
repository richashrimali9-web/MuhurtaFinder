import { useState, useEffect } from 'react';
import { Clock, MapPin, Sun, Moon, Info, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { calculatePanchang } from '../utils/panchangData';
import { calculateChoghadiya, getCurrentChoghadiya, type ChoghadiyaPeriod } from '../utils/choghadiyaData';

export function ChoghadiyaViewer() {
  // State and logic block
    const [selectedDate, setSelectedDate] = useState(new Date());
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
    const [selectedCity, setSelectedCity] = useState(cities[0]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showNight, setShowNight] = useState(false);
    const [panchang, setPanchang] = useState<any>(null);
    const [choghadiya, setChoghadiya] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedPeriods, setExpandedPeriods] = useState<Set<number>>(new Set());
    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      async function fetchData() {
        try {
          const result = await calculatePanchang(selectedDate, selectedCity.name, selectedCity.lat, selectedCity.lon);
          if (!cancelled) {
            setPanchang(result);
            setChoghadiya(calculateChoghadiya(selectedDate, result.sunrise, result.sunset));
          }
        } catch (e) {
          if (!cancelled) setError('Failed to fetch sun timings');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      fetchData();
      return () => { cancelled = true; };
    }, [selectedDate, selectedCity]);
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(timer);
    }, []);
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const currentPeriod = choghadiya
      ? getCurrentChoghadiya([...choghadiya.day, ...choghadiya.night], currentTime)
      : null;
    // ...existing code...
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auspicious':
        return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700';
      case 'inauspicious':
        return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auspicious':
        return '✓';
      case 'inauspicious':
        return '✗';
      default:
        return '○';
    }
  };
  
  const renderPeriod = (period: ChoghadiyaPeriod, index: number, isCurrent: boolean) => (
    <div
      key={index}
      className={`p-4 rounded-lg border-2 transition-all ${
        getTypeColor(period.type)
      } ${isCurrent ? 'ring-4 ring-purple-500 scale-105' : 'hover:scale-102'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2">
              <span className={`text-xl ${period.type === 'auspicious' ? 'text-green-600' : period.type === 'inauspicious' ? 'text-red-600' : 'text-gray-600'}`}>
                {getTypeIcon(period.type)}
              </span>
              {period.name}
            </h3>
            {isCurrent && (
              <Badge className="bg-purple-600 text-white animate-pulse">
                Current
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ruled by {period.ruler}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-3 h-3" />
            <span>{period.startTime}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            to {period.endTime}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {period.description}
      </p>
      
      <div className="space-y-2">
        <p className="text-xs font-medium">
          {period.type === 'auspicious' ? 'Best for:' : period.type === 'inauspicious' ? 'Avoid:' : 'Activities:'}
        </p>
        <div className="flex flex-wrap gap-1">
          {(expandedPeriods.has(index) ? period.activities : period.activities.slice(0, 3)).map((activity, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {activity}
            </Badge>
          ))}
          {period.activities.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer hover:bg-accent"
              onClick={() => {
                const newExpanded = new Set(expandedPeriods);
                if (expandedPeriods.has(index)) {
                  newExpanded.delete(index);
                } else {
                  newExpanded.add(index);
                }
                setExpandedPeriods(newExpanded);
              }}
            >
              {expandedPeriods.has(index) 
                ? 'Show less' 
                : `+${period.activities.length - 3} more`
              }
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
  
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-gradient">Choghadiya Calculator</h1>
        <p className="text-muted-foreground">
          Find auspicious time periods throughout the day for quick decisions and daily activities
        </p>
      </div>
      {/* Controls */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
        <div className="grid gap-4 md:grid-cols-2">
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
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <div className="flex gap-2">
              <Button onClick={goToPreviousDay} variant="outline" size="sm">
                ←
              </Button>
              <div className="flex-1 px-3 py-2 bg-background rounded-md border text-center">
                {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <Button onClick={goToNextDay} variant="outline" size="sm">
                →
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button onClick={goToToday} variant="secondary" size="sm">
            Today
          </Button>
        </div>
        {/* Sun Timings Section */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></span>
            <span className="ml-3">Loading sun timings...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Sun className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sunrise</p>
                  <p className="text-2xl">{panchang?.sunrise || '--'}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Moon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sunset</p>
                  <p className="text-2xl">{panchang?.sunset || '--'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>
      
      {/* Current Status */}
      {isToday && currentPeriod && (
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white mb-2">Current Choghadiya</h2>
              <div className="flex items-center gap-3">
                <div className="text-4xl">
                  {currentPeriod && getTypeIcon(currentPeriod.type)}
                </div>
                <div>
                  <h3 className="text-white text-2xl">{currentPeriod?.name}</h3>
                  <p className="text-white/90 text-sm mt-1">
                    {currentPeriod?.startTime} - {currentPeriod?.endTime}
                  </p>
                </div>
              </div>
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              currentPeriod?.type === 'auspicious' 
                ? 'bg-green-600' 
                : currentPeriod?.type === 'inauspicious'
                ? 'bg-red-600'
                : 'bg-gray-600'
            }`}>
              {currentPeriod?.type ? currentPeriod.type.charAt(0).toUpperCase() + currentPeriod.type.slice(1) : ''}
            </Badge>
          </div>
        </Card>
      )}
      
      {/* Day/Night Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={!showNight ? 'default' : 'outline'}
          onClick={() => setShowNight(false)}
          className="gap-2"
        >
          <Sun className="w-4 h-4" />
          Day Choghadiya
        </Button>
        <Button
          variant={showNight ? 'default' : 'outline'}
          onClick={() => setShowNight(true)}
          className="gap-2"
        >
          <Moon className="w-4 h-4" />
          Night Choghadiya
        </Button>
      </div>
      
      {/* Choghadiya Periods */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2">
          {showNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {showNight ? 'Night' : 'Day'} Periods ({showNight ? choghadiya?.night?.length || 0 : choghadiya?.day?.length || 0})
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(showNight ? choghadiya?.night : choghadiya?.day)?.map((period: ChoghadiyaPeriod, idx: number) => {
            const isCurrent = isToday && currentPeriod?.name === period.name && currentPeriod?.startTime === period.startTime;
            return renderPeriod(period, idx, isCurrent);
          })}
        </div>
      </div>
      
      {/* Information */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">About Choghadiya</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Choghadiya is a Vedic Hindu calendar system used for finding auspicious time periods. 
          The day is divided into 8 periods during the day and 8 during the night, each ruled by a different planet.
        </p>
      </Card>
    </div>
  );
}
