import { useState } from 'react';
import { Sparkles, Calendar, User, Clock, BookOpen, Menu, X, Sun } from 'lucide-react';
import { Button } from './components/ui/button';
import { MuhurtaFinder } from './components/MuhurtaFinder';
import { PanchangDisplay } from './components/PanchangDisplay';
import { PersonalizedMuhurta } from './components/PersonalizedMuhurta';
import { CountdownTimer } from './components/CountdownTimer';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ChoghadiyaViewer } from './components/ChoghadiyaViewer';

type View = 'finder' | 'panchang' | 'personalized' | 'countdown' | 'choghadiya' | 'knowledge';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('finder');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'finder' as View, label: 'Event Planner', icon: Sparkles },
    { id: 'panchang' as View, label: 'Daily Panchang', icon: Calendar },
    { id: 'choghadiya' as View, label: 'Choghadiya', icon: Sun },
    { id: 'personalized' as View, label: 'Personalized', icon: User },
    { id: 'countdown' as View, label: 'Countdown', icon: Clock },
    { id: 'knowledge' as View, label: 'Knowledge Base', icon: BookOpen }
  ];

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e27b31ff 0%, #e27b31ff  100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Astro Event Planner</h1>
                <p className="text-xs text-gray-600 hidden sm:block font-medium">
                  Your Guide to Auspicious Timings
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item: any) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  onClick={() => handleNavClick(item.id)}
                  className="gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 flex flex-col gap-2">
              {navigation.map((item: any) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'finder' && <MuhurtaFinder />}
        {currentView === 'panchang' && <PanchangDisplay />}
        {currentView === 'choghadiya' && <ChoghadiyaViewer />}
        {currentView === 'personalized' && <PersonalizedMuhurta />}
        {currentView === 'countdown' && <CountdownTimer />}
        {currentView === 'knowledge' && <KnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 dark:border-purple-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-3">About Astro Event Planner</h3>
              <p className="text-sm text-muted-foreground">
                A comprehensive web application for finding auspicious dates and times based on Vedic astrology principles.
              </p>
            </div>
            
            <div>
              <h3 className="mb-3">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Multiple event types supported</li>
                <li>✓ Personalized muhurta calculations</li>
                <li>✓ Daily Panchang with details</li>
                <li>✓ Countdown timers & reminders</li>
                <li>✓ Comprehensive knowledge base</li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-3">Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                This tool provides guidance based on classical Vedic astrology. For important decisions, consult with a qualified astrologer. 
                All data is stored locally in your browser.
              </p>
            </div>
          </div>
          
            <div className="mt-8 pt-8 border-t border-purple-100 dark:border-purple-800 text-center text-sm text-muted-foreground">
            <p>© 2025 Astro Event Planner. Built with Vedic wisdom and modern technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

