import { useState, useEffect } from 'react';
import { Clock, Bell, Calendar, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { calculatePanchang, getMuhurtaForEvent, eventTypes } from '../utils/panchangData';

export function CountdownTimer() {
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
  const [selectedEvent, setSelectedEvent] = useState('marriage');
  const [nextMuhurta, setNextMuhurta] = useState<{ date: Date; score: number } | null>(null);
  const [upcomingMuhurtas, setUpcomingMuhurtas] = useState<Array<{ foundDate: Date; score: number; daysAhead: number; index: number }>>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const savedPref = localStorage.getItem('muhurta-notifications-enabled');
      if (savedPref === 'true') {
        setNotificationsEnabled(true);
      }
    }
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    // Find next best muhurta
    const findNextMuhurta = async () => {
      let found = false;
      const today = new Date();
      
      for (let i = 0; i < 365 && !found; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const panchang = await calculatePanchang(date, selectedCity.name, selectedCity.lat, selectedCity.lon);
        const score = getMuhurtaForEvent(selectedEvent, panchang);
        if (score >= 80) {
          setNextMuhurta({ date, score });
          setNotificationScheduled(false); // Reset for new muhurta
          found = true;
        }
      }
    };
    
    findNextMuhurta();
  }, [selectedEvent, selectedCity]);
  
  // Auto-schedule notifications when muhurta changes
  useEffect(() => {
    if (nextMuhurta && notificationsEnabled && !notificationScheduled) {
      scheduleNotifications(nextMuhurta.date, selectedEvent);
      setNotificationScheduled(true);
    }
  }, [nextMuhurta, notificationsEnabled, notificationScheduled, selectedEvent]);
  
  // Load upcoming muhurtas
  useEffect(() => {
    const loadUpcomingMuhurtas = async () => {
      const upcomingList = [];
      const today = new Date();
      let searchStartDay = 0;
      
      for (let i = 0; i < 5; i++) {
        let foundDate = null;
        let score = 0;
        let daysAhead = 0;
        const minScore = 80 - (i * 3);
        
        for (let j = searchStartDay; j < 365; j++) {
          const testDate = new Date(today);
          testDate.setDate(testDate.getDate() + j);
          const panchang = await calculatePanchang(testDate, selectedCity.name, selectedCity.lat, selectedCity.lon);
          const testScore = getMuhurtaForEvent(selectedEvent, panchang);
          
          if (testScore >= minScore) {
            foundDate = testDate;
            score = testScore;
            daysAhead = j;
            searchStartDay = j + 1;
            break;
          }
        }
        
        if (foundDate) {
          upcomingList.push({ foundDate, score, daysAhead, index: i });
        }
      }
      
      setUpcomingMuhurtas(upcomingList);
    };
    
    loadUpcomingMuhurtas();
  }, [selectedEvent, selectedCity]);
  
  const getTimeRemaining = () => {
    if (!nextMuhurta) return null;
    
    const diff = nextMuhurta.date.getTime() - currentTime.getTime();
    if (diff < 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };
  
  const timeRemaining = getTimeRemaining();
  
  const scheduleNotifications = (muhurtaDate: Date, eventType: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    const now = new Date();
    const eventLabel = eventTypes.find(e => e.value === eventType)?.label || 'Event';
    
    // Schedule notification 1 day before
    const oneDayBefore = new Date(muhurtaDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    const timeToDayBefore = oneDayBefore.getTime() - now.getTime();
    
    if (timeToDayBefore > 0 && timeToDayBefore < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Upcoming Muhurta Tomorrow! 🌟', {
            body: `Auspicious time for ${eventLabel} is tomorrow at ${muhurtaDate.toLocaleDateString('en-IN')}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'muhurta-1day',
            requireInteraction: true
          });
        }
      }, timeToDayBefore);
    }
    
    // Schedule notification 1 hour before
    const oneHourBefore = new Date(muhurtaDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    const timeToHourBefore = oneHourBefore.getTime() - now.getTime();
    
    if (timeToHourBefore > 0 && timeToHourBefore < 7 * 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Muhurta Starting in 1 Hour! ⏰', {
            body: `${eventLabel} muhurta begins at ${muhurtaDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'muhurta-1hour',
            requireInteraction: true
          });
        }
      }, timeToHourBefore);
    }
  };
  
  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('muhurta-notifications-enabled', 'true');
        
        // Show immediate confirmation
        new Notification('Muhurta Notifications Enabled ✓', {
          body: 'You will receive reminders 1 day and 1 hour before upcoming auspicious dates.',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        
        // Schedule notifications for current muhurta if available
        if (nextMuhurta) {
          scheduleNotifications(nextMuhurta.date, selectedEvent);
          setNotificationScheduled(true);
        }
      } else if (permission === 'denied') {
        alert('Notification permission denied. Please enable notifications in your browser settings to use this feature.');
      }
    } else {
      alert('Notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.');
    }
  };
  
  const addToCalendar = () => {
    if (!nextMuhurta) return;
    
    const eventType = eventTypes.find(e => e.value === selectedEvent);
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${nextMuhurta.date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Auspicious Muhurta - ${eventType?.label}
DESCRIPTION:Quality Score: ${nextMuhurta.score}%
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: Auspicious date tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muhurta-reminder.ics';
    a.click();
  };
  
  const eventType = eventTypes.find(e => e.value === selectedEvent);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-gradient">Muhurta Countdown</h1>
        <p className="text-muted-foreground">
          Track time until the next highly auspicious date for your event
        </p>
      </div>
      
      {/* Event Selector */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Event Type
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      {/* Countdown Display */}
      {nextMuhurta && timeRemaining && (
        <Card className="p-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-white opacity-90">Next Best Muhurta for</h2>
              <h1 className="text-white mt-2">{eventType?.icon} {eventType?.label}</h1>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <div className="text-4xl">{timeRemaining.days}</div>
                <div className="text-sm opacity-90 mt-1">Days</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <div className="text-4xl">{timeRemaining.hours}</div>
                <div className="text-sm opacity-90 mt-1">Hours</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <div className="text-4xl">{timeRemaining.minutes}</div>
                <div className="text-sm opacity-90 mt-1">Minutes</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <div className="text-4xl">{timeRemaining.seconds}</div>
                <div className="text-sm opacity-90 mt-1">Seconds</div>
              </div>
            </div>
            
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm opacity-90">Target Date</div>
                  <div className="text-xl">
                    {nextMuhurta.date.toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <Badge className="bg-white text-purple-600 text-lg px-4 py-2">
                  {nextMuhurta.score}% Quality
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3>Browser Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get reminders 1 day and 1 hour before your muhurta
                </p>
              </div>
            </div>
            
            {notificationsEnabled && notificationScheduled && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Notifications scheduled for this muhurta
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleEnableNotifications}
              disabled={notificationsEnabled}
              className="w-full gap-2"
              variant={notificationsEnabled ? 'secondary' : 'default'}
            >
              <Bell className="w-4 h-4" />
              {notificationsEnabled ? '✓ Notifications Active' : 'Enable Notifications'}
            </Button>
            
            {!notificationsEnabled && (
              <p className="text-xs text-muted-foreground text-center">
                Works completely offline - no backend needed!
              </p>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3>Add to Calendar</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Export the next muhurta to your calendar app
                </p>
              </div>
            </div>
            
            <Button 
              onClick={addToCalendar}
              disabled={!nextMuhurta}
              className="w-full gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download ICS File
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Upcoming Muhurtas */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Upcoming High-Quality Muhurtas
        </h3>
        
        <div className="space-y-3">
          {upcomingMuhurtas.map((muhurta) => (
              <div key={muhurta.index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{muhurta.foundDate.toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric',
                    year: muhurta.daysAhead > 60 ? 'numeric' : undefined
                  })}</p>
                  <p className="text-sm text-muted-foreground">
                    {muhurta.daysAhead === 0 ? 'Today' : 
                     muhurta.daysAhead === 1 ? 'Tomorrow' : 
                     `In ${muhurta.daysAhead} days`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={muhurta.score >= 80 ? 'default' : muhurta.score >= 70 ? 'secondary' : 'outline'}>
                    {muhurta.score}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {muhurta.score >= 85 ? 'Excellent' : 
                     muhurta.score >= 75 ? 'Very Good' : 
                     muhurta.score >= 65 ? 'Good' : 'Fair'}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>
      
      {/* Information */}
      {/* City Selector */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <span role="img" aria-label="city">🏙️</span> City
        </h3>
        <select
          value={selectedCity.name}
          onChange={e => {
            const city = cities.find(c => c.name === e.target.value);
            if (city) setSelectedCity(city);
          }}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          {cities.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
      </Card>
      <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <h3 className="mb-2">About Quality Scores</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>80-100%:</strong> Highly auspicious - Best for important events</p>
          <p>• <strong>60-79%:</strong> Good - Favorable for most activities</p>
          <p>• <strong>40-59%:</strong> Moderate - Acceptable but not ideal</p>
          <p>• <strong>Below 40%:</strong> Low - Better to choose another date</p>
        </div>
      </Card>
    </div>
  );
}
