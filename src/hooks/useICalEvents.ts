import { useEffect, useState } from 'react';
import ICAL from 'ical.js';
import type { CalendarEntry, CalendarEvent } from '../types';

function resolveUrl(query: string): string {
  if (/^https?:\/\//.test(query) || query.endsWith('.ics')) {
    return query;
  }
  return `/api/ical/${query}`;
}

// Les flux Ypareo encodent le sujet et les groupes dans SUMMARY ("Sujet - Groupe1 - Groupe2",
// séparateur " - " avec espaces, les noms pouvant contenir des tirets sans espaces),
// les salles dans LOCATION ("B01-salle informatique 28, B02-salle classique 28")
// et les enseignants dans DESCRIPTION ("…\nPersonnels : M. NOM1, M. NOM2").
function parseEvents(data: string): CalendarEvent[] {
  const calendar = new ICAL.Component(ICAL.parse(data));
  for (const vtimezone of calendar.getAllSubcomponents('vtimezone')) {
    ICAL.TimezoneService.register(vtimezone);
  }
  return calendar.getAllSubcomponents('vevent').map(vevent => {
    const event = new ICAL.Event(vevent);
    const summary = event.summary ?? '';
    const [subject = '', ...groups] = summary.split(' - ').map(part => part.trim());
    const locations = (event.location ?? '')
      .split(',')
      .map(room => room.split('-')[0].trim())
      .filter(room => room !== '');
    const teachers = event.description?.split('Personnels : ')[1]
      ?.split('\n')[0]
      .split(',')
      .map(teacher => teacher.trim())
      .filter(teacher => teacher !== '') ?? [];
    const start = event.startDate.toJSDate();
    const end = event.endDate.toJSDate();
    return {
      title: summary,
      start,
      end,
      locations,
      groups,
      subject,
      teachers,
      description: `Sujet : ${subject}<br/>Groupe(s) : ${groups.join(', ')}<br/>Professeur(s) : ${teachers.join(', ')}<br/>Salle(s) : ${locations.join(', ')}<br/>Début : ${start.toLocaleString()}<br/>Fin : ${end.toLocaleString()}`,
    };
  });
}

export default function useICalEvents(calendar: CalendarEntry | null): CalendarEvent[] {
  const [loaded, setLoaded] = useState<{ calendarId: number; events: CalendarEvent[] } | null>(null);

  useEffect(() => {
    if (!calendar) {
      return;
    }
    const controller = new AbortController();
    fetch(resolveUrl(calendar.query), { signal: controller.signal })
      .then(response => response.text())
      .then(data => setLoaded({ calendarId: calendar.id, events: parseEvents(data) }))
      .catch(error => {
        if (!controller.signal.aborted) {
          console.error('Error fetching iCal data:', error);
        }
      });
    return () => controller.abort();
  }, [calendar]);

  return calendar !== null && loaded?.calendarId === calendar.id ? loaded.events : [];
}
