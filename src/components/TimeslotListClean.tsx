import { useMemo, useState } from 'react';
import { generateTimeSlots, TimeSlot, icsForSlot } from '../utils/timeslots';
import { Clipboard as ClipboardIcon } from 'lucide-react';

export default function TimeslotList({ dateInfo }: { dateInfo: any }) {
  const slots: TimeSlot[] = useMemo(() =>
    generateTimeSlots(
      {
        date: dateInfo.date,
        sunrise: dateInfo.panchang?.sunrise,
        sunset: dateInfo.panchang?.sunset,
        tithi: dateInfo.panchang?.tithi,
        nakshatra: dateInfo.panchang?.nakshatra,
        quality: dateInfo.score,
        title: dateInfo.panchang?.tithi,
      },
      60,
      30
    ), [dateInfo]
  );

  const [expanded, setExpanded] = useState(false);

  if (!slots || slots.length === 0) return null;
  const top = slots.slice(0, expanded ? 5 : 1);

  async function copyText(text: string) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {
      // noop
    }
  }

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function downloadIcs(slot: TimeSlot, idx: number) {
    try {
      console.log('downloadIcs called with slot:', slot, 'idx:', idx);
      const ics = icsForSlot(dateInfo.panchang?.tithi || undefined, slot);
      console.log('Generated ICS:', ics);
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slot-${idx + 1}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Calendar download completed');
    } catch (error) {
      console.error('Error downloading calendar:', error);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-gray-900">Suggested times</h4>
        <button 
          className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline" 
          onClick={() => setExpanded((p) => !p)} 
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `More (${slots.length})`}
        </button>
      </div>

      <div className="space-y-2.5">
        {top.map((s, i) => {
          const start = new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const end = new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const displayIdx = expanded ? i : 0;
          return (
            <div 
              key={i} 
              className="relative"
            >
              <div 
                className="flex items-center justify-between gap-3 p-3.5 border border-gray-200 hover:border-gray-300 transition-all bg-white"
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-gray-900 whitespace-nowrap">
                      {start} — {end}
                    </span>
                    <span 
                      style={{ 
                        color: '#8B2C19',
                        backgroundColor: '#FFF8DC',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        border: '1px solid #8B2C19',
                        textShadow: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      {s.score}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{(s.reasons || []).join(' · ')}</div>
                </div>
                <div className="flex items-center flex-shrink-0 gap-2">
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    onClick={async () => {
                      const fullText = `${dateInfo.date.toLocaleDateString('en-IN')} ${start} - ${end} (Quality: ${s.score}%)`;
                      await copyText(fullText);
                      setCopiedIndex(displayIdx);
                      setTimeout(() => setCopiedIndex(null), 1800);
                    }}
                    title="Copy time"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Calendar clicked for slot:', displayIdx);
                      downloadIcs(s, displayIdx);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Add to calendar"
                    title="Add to calendar"
                    style={{ 
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '40px',
                      minHeight: '40px',
                      userSelect: 'none',
                      backgroundColor: '#8B2C19',
                      border: '2px solid #8B2C19',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#A0341A';
                      e.currentTarget.style.borderColor = '#A0341A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#8B2C19';
                      e.currentTarget.style.borderColor = '#8B2C19';
                    }}
                  >
                    📅
                  </span>
                </div>
              </div>
              {copiedIndex === displayIdx && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Copied!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
