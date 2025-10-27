import { useState, useEffect } from 'react';
import { User, Save, Trash2, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { calculatePanchang, moonSigns, getCurrentTithi, getCurrentNakshatra } from '../utils/panchangData';

interface UserProfile {
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  moonSign: string;
}

export function PersonalizedMuhurta() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('Jodhpur');
  const [isEditing, setIsEditing] = useState(false);
  const [personalizedDates, setPersonalizedDates] = useState<Array<{ date: Date; panchang: any; score: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('muhurtaProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      parsed.birthDate = new Date(parsed.birthDate);
      setProfile(parsed);
    }
  }, []);
  
  useEffect(() => {
    // Load personalized dates when profile changes
    const loadPersonalizedDates = async () => {
      if (!profile) {
        setPersonalizedDates([]);
        return;
      }
      
      setIsLoading(true);
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        const panchang = await calculatePanchang(date, profile.birthPlace);
        
        // Personalized scoring based on moon sign compatibility
        let personalScore = panchang.qualityScore;
        
        // Boost score if moon sign matches
        if (panchang.moonSign === profile.moonSign) {
          personalScore += 15;
        }
        
        // Boost on birth tithi (simplified)
        const birthDay = profile.birthDate.getDate();
        if (date.getDate() === birthDay) {
          personalScore += 10;
        }
        
        personalScore = Math.min(100, personalScore);
        
        if (personalScore >= 75) {
          dates.push({ date, panchang, score: personalScore });
        }
      }
      
      const sortedDates = dates.sort((a, b) => b.score - a.score).slice(0, 10);
      setPersonalizedDates(sortedDates);
      setIsLoading(false);
    };
    
    loadPersonalizedDates();
  }, [profile]);
  
  const handleSaveProfile = async () => {
    if (!name || !birthDate || !birthTime) {
      alert('Please fill all fields');
      return;
    }
    
    // Calculate moon sign based on actual Panchang data from birth date
    const date = new Date(birthDate);
    const birthPanchang = await calculatePanchang(date, birthPlace);
    
    const newProfile: UserProfile = {
      name,
      birthDate: date,
      birthTime,
      birthPlace,
      moonSign: birthPanchang.moonSign // Use actual calculated moon sign from Panchang
    };
    
    setProfile(newProfile);
    localStorage.setItem('muhurtaProfile', JSON.stringify(newProfile));
    setIsEditing(false);
  };
  
  const handleDeleteProfile = () => {
    if (confirm('Are you sure you want to delete your profile?')) {
      setProfile(null);
      localStorage.removeItem('muhurtaProfile');
      setName('');
      setBirthDate('');
      setBirthTime('');
    }
  };
  
  const cities = ['Jodhpur', 'Pali', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-gradient">Personalized Muhurta</h1>
        <p className="text-muted-foreground">
          Get customized auspicious dates based on your birth chart and personal planetary positions
        </p>
      </div>
      
      {/* Profile Section */}
      {!profile || isEditing ? (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
          <h2 className="mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Create Your Profile
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthTime">Birth Time</Label>
              <Input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <select
                id="birthPlace"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button onClick={handleSaveProfile} className="gap-2">
              <Save className="w-4 h-4" />
              Save Profile
            </Button>
            {profile && (
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {profile.name}
              </h2>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>📅 Born: {profile.birthDate.toLocaleDateString('en-IN')} at {profile.birthTime}</p>
                <p>📍 Place: {profile.birthPlace}</p>
                <p>🌙 Moon Sign: <Badge variant="secondary">{profile.moonSign}</Badge></p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit
              </Button>
              <Button onClick={handleDeleteProfile} variant="outline" size="sm" className="text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Personalized Dates */}
      {profile && !isEditing && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2>Your Best Muhurtas (Next 90 Days)</h2>
          </div>
          
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-muted-foreground">Loading personalized dates...</p>
              </div>
            </Card>
          ) : personalizedDates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No highly favorable dates found in the next 90 days. Check back later or adjust your search.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {personalizedDates.map((item, idx) => (
                <Card 
                  key={idx}
                  className={`p-4 transition-all hover:shadow-lg ${
                    idx === 0 ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3>
                            {item.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </h3>
                          {idx === 0 && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              Top Pick
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {item.panchang.masa}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl text-green-600">
                          {item.score}%
                        </div>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                    
                    {item.panchang.moonSign === profile.moonSign && (
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                        <p className="text-sm">🌙 Moon in your sign!</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tithi:</span>
                        <p>{getCurrentTithi(item.panchang) ? getCurrentTithi(item.panchang) : <span className="text-red-600">Data unavailable</span>}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nakshatra:</span>
                        <p>{getCurrentNakshatra(item.panchang) ? getCurrentNakshatra(item.panchang) : <span className="text-red-600">Data unavailable</span>}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Moon Sign:</span>
                        <p>{item.panchang.moonSign}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paksha:</span>
                        <p className="text-xs">{item.panchang.paksha.split(' ')[0]}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        ✨ Personalized based on your {profile.moonSign} moon sign
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Information */}
      {!profile && !isEditing && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="mb-2">Why Create a Profile?</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>✓ Get dates matched to your personal moon sign</li>
            <li>✓ Receive recommendations based on your birth chart</li>
            <li>✓ Higher accuracy for important life events</li>
            <li>✓ Personalized reminders for auspicious times</li>
            <li>✓ All data stored securely in your browser</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
