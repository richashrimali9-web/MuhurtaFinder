import { useState } from 'react';
import { BookOpen, HelpCircle, Star, Moon, Sun, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

export function KnowledgeBase() {
  const articles = [
    {
      id: 1,
      title: 'What is Muhurta?',
      category: 'Basics',
      icon: Star,
      content: `Muhurta is an auspicious time period in Vedic astrology used for performing important activities and ceremonies. The word 'Muhurta' comes from Sanskrit, meaning a specific period of time (approximately 48 minutes).

In Vedic tradition, time is not uniform - certain periods are more conducive to success for specific activities. A properly selected Muhurta ensures that cosmic energies are aligned favorably for the intended purpose.

Key factors considered in Muhurta:
• Tithi (Lunar day)
• Nakshatra (Lunar mansion)
• Yoga (Auspicious combinations)
• Karana (Half-tithi)
• Vara (Weekday)
• Lagna (Ascendant)
• Planetary positions

Choosing the right Muhurta is believed to maximize positive outcomes and minimize obstacles for important life events like marriages, business ventures, travel, and religious ceremonies.`
    },
    {
      id: 2,
      title: 'Understanding Panchang',
      category: 'Basics',
      icon: Calendar,
      content: `Panchang (also spelled Panchanga) means "five limbs" in Sanskrit. It is the Hindu astronomical almanac that provides details about five key elements of time:

1. Tithi (Lunar Day): Based on the moon's position relative to the sun. There are 30 tithis in a lunar month.

2. Nakshatra (Lunar Mansion): 27 divisions of the sky that the moon passes through. Each nakshatra has unique characteristics.

3. Yoga: 27 specific combinations of sun and moon positions. Some are highly auspicious, while others should be avoided.

4. Karana: Half of a tithi. There are 11 karanas that repeat through the lunar month.

5. Vara (Weekday): The seven days of the week, each ruled by a specific planet.

Together, these five elements determine the quality of any given time period and help identify auspicious moments for various activities.`
    },
    {
      id: 3,
      title: 'Tithi Explained',
      category: 'Elements',
      icon: Moon,
      content: `A Tithi is a lunar day in the Hindu calendar, calculated based on the longitudinal angle between the Sun and Moon. Each tithi covers 12 degrees of this angle.

Types of Tithis:
• Nanda (1, 6, 11): Good for celebrations and joyous events
• Bhadra (2, 7, 12): Auspicious for construction and stable ventures  
• Jaya (3, 8, 13): Favorable for conquests and competitions
• Rikta (4, 9, 14): Generally avoided for important events
• Purna (5, 10, 15): Full of energy, good for completions

Special Tithis:
• Purnima (Full Moon - 15th): Very auspicious for spiritual practices
• Amavasya (New Moon - 30th): Good for ancestor worship but generally avoided for new beginnings
• Ekadashi (11th): Sacred for fasting and spiritual practices

The choice of tithi depends greatly on the type of activity being planned.`
    },
    {
      id: 4,
      title: 'Nakshatra and Their Significance',
      category: 'Elements',
      icon: Star,
      content: `Nakshatras are 27 (or 28) lunar mansions that divide the zodiac into segments of 13°20' each. The moon spends approximately one day in each nakshatra.

Highly Auspicious Nakshatras:
• Ashwini: Quick results, healing, travel
• Rohini: Growth, beauty, material prosperity
• Pushya: Most auspicious; nourishment, spiritual growth
• Hasta: Skill, craftsmanship, success in ventures
• Swati: Independence, trade, favorable for business
• Anuradha: Friendship, success, devotion
• Shravana: Learning, listening, acquiring knowledge
• Revati: Completion, journeys, prosperity

Nakshatras to Avoid:
• Bharani: Endings, transformations (not for beginnings)
• Ashlesha: Caution needed, deceptive energies
• Jyeshtha: Seniority issues, potential conflicts
• Mula: Destruction before creation, risky

Each nakshatra is also associated with a deity, symbol, and planetary ruler that influence its characteristics.`
    },
    {
      id: 5,
      title: 'Selecting Muhurta for Marriage',
      category: 'Events',
      icon: Star,
      content: `Marriage Muhurta is one of the most important selections in Vedic astrology, as it's believed to influence the couple's entire married life.

Best Nakshatras for Marriage:
• Rohini, Mrigashira, Magha, Uttara Phalguni
• Hasta, Swati, Anuradha, Uttara Ashadha
• Uttara Bhadrapada, Revati

Best Tithis:
• 2nd, 3rd, 5th, 7th, 10th, 11th, 13th of bright fortnight
• Avoid 4th, 6th, 8th, 9th, 14th, and dark fortnight

Best Months:
• Magh, Falgun, Vaishakh, Jyeshtha (depending on region)
• Avoid Chaitra, Ashadh, Bhadrapad, Paush

Additional Considerations:
• Bride and groom's birth charts should be analyzed
• Avoid malefic planetary periods (dashas)
• Ensure Venus and Jupiter are well-placed
• Moon should be strong and waxing
• Avoid eclipses, inauspicious yogas

A qualified astrologer should be consulted for final Muhurta selection considering both birth charts.`
    },
    {
      id: 6,
      title: 'Business and Financial Muhurta',
      category: 'Events',
      icon: Sun,
      content: `Starting a business or making significant financial decisions at an auspicious time can set the foundation for long-term success.

Best Nakshatras:
• Pushya: Nourishment and growth
• Hasta: Manual skills and crafts
• Ashwini: Quick action and initiative
• Revati: Commerce and trade

Best Days:
• Wednesday (Mercury - communication, trade)
• Thursday (Jupiter - expansion, wisdom)
• Friday (Venus - luxury goods, arts)

Best Tithis:
• 2nd, 3rd, 5th, 7th, 10th, 11th, 13th
• Avoid Rikta tithis (4th, 9th, 14th)

Best Time:
• Shukla Paksha (Waxing moon)
• Morning hours (Brahma Muhurta for spiritual businesses)
• Avoid Rahu Kala and Yamaghanta

Special Considerations:
• Jupiter should be strong in the chart
• Avoid Saturn or Mars in 10th house
• Ensure Mercury is not retrograde for communication-based businesses
• Choose based on business type (Venus for beauty, Mars for real estate, etc.)

Opening on Diwali (Lakshmi Puja) or Akshaya Tritiya is considered extremely auspicious.`
    }
  ];
  
  const faqs = [
    {
      question: 'Why isn\'t every day auspicious?',
      answer: 'According to Vedic astrology, planetary positions and lunar phases create varying energy patterns throughout time. Some combinations are more harmonious and supportive of specific activities, while others may create obstacles. Just as seasons affect agriculture, cosmic timing affects human endeavors.'
    },
    {
      question: 'What is Choghadiya?',
      answer: 'Choghadiya is a Vedic system that divides the day into 8 time periods (muhurtas), each ruled by a planet. These periods rotate between auspicious (Amrit, Shubh, Labh, Char) and inauspicious (Rog, Kaal, Udveg) times. It\'s commonly used for quick daily decisions and travel.'
    },
    {
      question: 'How accurate is Muhurta selection?',
      answer: 'Muhurta is based on thousands of years of Vedic astronomical and astrological observations. While it cannot guarantee outcomes, it optimizes cosmic timing. Think of it as planting seeds in the right season - it creates favorable conditions for growth. Personal effort and circumstances also play crucial roles.'
    },
    {
      question: 'Can I use Muhurta without knowing my birth time?',
      answer: 'Yes! Basic Muhurta can be calculated using Panchang elements (tithi, nakshatra, etc.) that apply to everyone. However, for personalized Muhurta that considers your birth chart, accurate birth time is needed for maximum precision.'
    },
    {
      question: 'What if I can\'t follow the suggested Muhurta?',
      answer: 'While an ideal Muhurta is beneficial, practical constraints are understandable. Focus on avoiding clearly inauspicious times (eclipses, highly malefic yogas) and choose the best available option within your constraints. Intention and effort matter significantly.'
    },
    {
      question: 'How far in advance should I plan for Muhurta?',
      answer: 'For major events like weddings, plan 6-12 months ahead to get optimal dates. For business openings or housewarming, 2-3 months is good. For daily activities, even same-day Choghadiya can help. The more important the event, the more advance planning recommended.'
    },
    {
      question: 'Does Muhurta work for everyone regardless of religion?',
      answer: 'Muhurta is based on astronomical positions and time cycles that affect everyone universally, regardless of religious beliefs. Many people from various backgrounds use it as a timing tool. It\'s more about cosmic timing than religious practice, though it originates from Vedic tradition.'
    },
    {
      question: 'What is the difference between Muhurta and horoscope?',
      answer: 'A horoscope (birth chart) is created for when you were born and describes your personality and life patterns. Muhurta is about selecting the best time to start something new. Think of horoscope as "who you are" and Muhurta as "when to act" for best results.'
    }
  ];
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', 'Basics', 'Elements', 'Events'];
  
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-gradient">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Learn about Muhurta, Panchang, and Vedic astrology concepts
        </p>
      </div>
      
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Badge>
            ))}
          </div>
          
          {/* Articles */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map(article => (
              <Card key={article.id} className="p-6 hover:shadow-lg transition-all">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <article.icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3>{article.title}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {article.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
          
          {/* Additional Resources */}
          <Card className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-2 border-orange-400 dark:border-orange-800 shadow-lg card-enhanced">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <BookOpen className="w-6 h-6" />
              Need More Help?
            </h3>
            <p className="text-muted-foreground mb-4">
              For complex questions or personalized consultations, consider speaking with a qualified Vedic astrologer who can analyze your specific birth chart and requirements.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Remember: This tool provides general guidance based on classical Muhurta principles. Individual results may vary based on personal charts and circumstances.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
