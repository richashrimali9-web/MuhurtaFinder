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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gradient">Astro Event Planner</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
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
                <li>âœ“ Multiple event types supported</li>
                <li>âœ“ Personalized muhurta calculations</li>
                <li>âœ“ Daily Panchang with details</li>
                <li>âœ“ Countdown timers & reminders</li>
                <li>âœ“ Comprehensive knowledge base</li>
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
            <p>Â© 2025 Astro Event Planner. Built with Vedic wisdom and modern technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

