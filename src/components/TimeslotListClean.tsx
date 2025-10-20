import { useMemo, useState } from 'react';
import { generateTimeSlots, TimeSlot, icsForSlot } from '../utils/timeslots';
import { Calendar as CalendarIcon, Clipboard as ClipboardIcon } from 'lucide-react';

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
    const ics = icsForSlot(dateInfo.panchang?.tithi || undefined, slot);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slot-${idx + 1}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-3 p-2 rounded-md bg-gray-50 dark:bg-gray-900/40 border-l-4 border-purple-200 dark:border-purple-700">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Suggested times</div>
        <button className="text-xs text-muted-foreground" onClick={() => setExpanded((p) => !p)} aria-expanded={expanded}>
          {expanded ? 'Less' : `More (${slots.length})`}
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2 max-h-36 overflow-y-auto">
        {top.map((s, i) => {
          const start = new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const end = new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const displayIdx = expanded ? i : 0;
          return (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {start} — {end} <span className="text-xs text-green-600 ml-2">{s.score}%</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{(s.reasons || []).join(' · ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    className="w-9 h-9 p-0 flex items-center justify-center rounded border bg-white dark:bg-gray-800"
                    onClick={async () => {
                      const fullText = `${dateInfo.date.toLocaleDateString('en-IN')} ${start} - ${end} (Quality: ${s.score}%)`;
                      await copyText(fullText);
                      setCopiedIndex(displayIdx);
                      setTimeout(() => setCopiedIndex(null), 1800);
                    }}
                    title="Copy time"
                  >
                    <ClipboardIcon className="w-4 h-4" />
                  </button>
                  {copiedIndex === displayIdx && (
                    <div className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded">Copied</div>
                  )}
                </div>
                <button
                  className="w-9 h-9 p-0 flex items-center justify-center rounded border bg-white dark:bg-gray-800"
                  onClick={() => downloadIcs(s, displayIdx)}
                  aria-label="Add to calendar"
                  title="Add to calendar"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
