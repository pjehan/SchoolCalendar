import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react'
import multiMonthPlugin from '@fullcalendar/multimonth'
import iCalendarPlugin from '@fullcalendar/icalendar'
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import {Tooltip} from 'bootstrap';
import ical from 'ical.js';

interface Event {
  title: string;
  start: string;
  end: string;
  location: string;
  groups: string[];
  subject: string;
  teacher: string;
  description: string;
}

interface CalendarEntry {
  id: number;
  name: string;
  query: string;
}

// http://formations.mayenne.cci.fr/net-ypareo/index.php/planning/ical/73D7406C-824F-4643-B643-F96B2A1CA85D/
export default function Calendar() {
    const [calendars, setCalendars] = useState<CalendarEntry[]>(() => {
        const stored = localStorage.getItem('calendars');
        return stored ? JSON.parse(stored) : [];
    });
    const [selectedCalendar, setSelectedCalendar] = useState<CalendarEntry|null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [teachers, setTeachers] = useState<string[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [locations, setLocations] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [newName, setNewName] = useState('');
    const [newQuery, setNewQuery] = useState('');
    const dialogRef = useRef<HTMLDialogElement>(null);
    let tooltip: React.RefObject<Tooltip|null> = useRef(null);

    useEffect(() => {
        localStorage.setItem('calendars', JSON.stringify(calendars));
    }, [calendars]);

    const addCalendar = () => {
        if (!newName.trim() || !newQuery.trim()) return;
        const newId = Math.max(0, ...calendars.map(c => c.id)) + 1; // Generate a new ID based on the highest existing ID
        setCalendars(prev => [...prev, { id: newId, name: newName.trim(), query: newQuery.trim() }]);
        setNewName('');
        setNewQuery('');
    };

    const deleteCalendar = (id: number) => {
        setCalendars(prev => prev.filter(c => c.id !== id));
        if (selectedCalendar?.id === id) setSelectedCalendar(null);
    };

    const filteredEvents = events.filter((event: Event) =>
        (selectedSubject.length === 0 || selectedSubject.includes(event.subject)) &&
        (selectedGroup.length === 0 || event.groups.includes(selectedGroup)) &&
        (selectedLocation === "" || selectedLocation === event.location) &&
        (selectedTeacher === "" || selectedTeacher === event.teacher)
    );

    const exportEventsSubjects = () => {
      const subjects = filteredEvents.map(event => event.subject);
      navigator.clipboard.writeText(subjects.join('\n')).then(() => {
        alert('Sujets copiés dans le presse-papier !');
      }).catch(err => {
        console.error('Erreur lors de la copie dans le presse-papier : ', err);
      });
    };

    const eventMouseEnter = (info) => {
      tooltip.current = Tooltip.getInstance(info.el);
      if (tooltip.current == null) {
        tooltip.current = new Tooltip(info.el, {
          title: info.event.extendedProps.description,
          placement: 'top',
          trigger: 'manual',
          container: 'body',
          html: true,
        });
      }
      tooltip.current.show();
    }

    const eventMouseLeave = () => {
      if (tooltip.current) {
        tooltip.current.hide();
      }
    }

    useEffect(() => {
        if (!selectedCalendar) {
          return;
        }
        const isAbsoluteUrl = /^https?:\/\//.test(selectedCalendar.query);
        const url = isAbsoluteUrl
          ? selectedCalendar.query
          : selectedCalendar.query.endsWith('.ics')
            ? selectedCalendar.query
            : `/api/ical/${selectedCalendar.query}`;
        fetch(url)
        .then(response => response.text())
        .then(data => {
            const jcalData = ical.parse(data);
            let events: Event[] = [];

            const subjectsList: string[] = [];
            const groupsList: string[] = [];
            const teachersList: string[] = [];
            const locationsList: string[] = [];
            for (const jcalEvent of jcalData[2].filter(item => item[0] === 'vevent')) {
              const location = jcalEvent[1][5][3].split('-')[0].trim();
              const groups = jcalEvent[1][6][3].split('-').slice(1).map(group => group.trim());
              const subject = jcalEvent[1][6][3].split('-')[0].trim();
              const teacher = jcalEvent[1][2][3].split('Personnels : ')[1]?.trim() || "";
                events.push({
                    title: jcalEvent[1][6][3],
                    start: jcalEvent[1][3][3],
                    end: jcalEvent[1][4][3],
                    location: location,
                    groups: groups,
                    subject: subject,
                    teacher: teacher,
                    description: `Sujet : ${subject}<br/>Groupe(s) : ${groups.join(', ')}<br/>Professeur : ${teacher}<br/>Salle : ${location}<br/>Début : ${new Date(jcalEvent[1][3][3]).toLocaleString()}<br/>Fin : ${new Date(jcalEvent[1][4][3]).toLocaleString()}`
                });
                if (!subjectsList.includes(subject) && subject !== "") {
                    subjectsList.push(subject);
                }
                for (const group of groups) {
                    if (!groupsList.includes(group) && group !== "") {
                        groupsList.push(group);
                    }
                }
                if (!locationsList.includes(location) && location !== "") {
                    locationsList.push(location);
                }
                if (!teachersList.includes(teacher) && teacher !== "") {
                    teachersList.push(teacher);
                }
            }
            setSubjects(subjectsList.toSorted());
            setGroups(groupsList.toSorted());
            setLocations(locationsList.toSorted());
            setTeachers(teachersList.toSorted());
            setEvents(events);
        })
        .catch(error => console.error('Error fetching iCal data:', error));
    }, [selectedCalendar]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <dialog
        ref={dialogRef}
        style={{ width: '600px', maxWidth: '90vw', borderRadius: '8px', border: '1px solid #dee2e6', padding: '1.5rem' }}
        onClick={e => { if (e.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Gérer les calendriers</h5>
          <button className="btn-close" onClick={() => dialogRef.current?.close()}></button>
        </div>
        <table className="table table-sm table-bordered">
          <thead className="table-light">
            <tr>
              <th>Nom</th>
              <th>URL / Token</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {calendars.map(cal => (
              <tr key={cal.id}>
                <td className="align-middle">{cal.name}</td>
                <td className="align-middle">
                  <code style={{ fontSize: '0.7em', wordBreak: 'break-all' }}>{cal.query}</code>
                </td>
                <td className="align-middle text-center">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCalendar(cal.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <h6>Ajouter un calendrier</h6>
        <input
          className="form-control form-control-sm mb-2"
          placeholder="Nom"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          className="form-control form-control-sm mb-2"
          placeholder="URL complète (https://…) ou token iCal"
          value={newQuery}
          onChange={e => setNewQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addCalendar(); }}
        />
        <button className="btn btn-sm btn-primary" onClick={addCalendar} disabled={!newName.trim() || !newQuery.trim()}>
          <i className="bi bi-plus-lg me-1"></i>Ajouter
        </button>
      </dialog>

      <div>
        <div className="d-flex gap-2 mb-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <i className={`bi bi-chevron-${filtersOpen ? 'up' : 'down'} me-1`}></i>
            {filtersOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => dialogRef.current?.showModal()}
          >
            <i className="bi bi-calendar2-plus me-1"></i>Gérer les calendriers
          </button>
        </div>
        <div className={filtersOpen ? '' : 'd-none'}>
          <select className="form-select mb-3" onChange={e => setSelectedCalendar(calendars.find(cal => cal.id === parseInt(e.target.value)) ?? null)}>
            <option value="">-- Choisir un calendrier --</option>
            {calendars.map(cal => (
              <option key={cal.id} value={cal.id}>{cal.name}</option>
            ))}
          </select>
          <select className="form-select mb-3" onChange={e => setSelectedSubject(e.target.value)}>
            <option value="">Tous les sujets</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select className="form-select mb-3" onChange={e => setSelectedGroup(e.target.value)}>
            <option value="">Tous les groupes</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          <select className="form-select mb-3" onChange={e => setSelectedTeacher(e.target.value)}>
            <option value="">Tous les enseignants</option>
            {teachers.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
          <select className="form-select mb-3" onChange={e => setSelectedLocation(e.target.value)}>
            <option value="">Toutes les salles</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <button className="btn btn-primary mb-3" onClick={exportEventsSubjects}>Copier les sujets filtrés dans le presse-papier</button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <FullCalendar
          plugins={[ multiMonthPlugin, iCalendarPlugin, bootstrap5Plugin ]}
          themeSystem='bootstrap5'
          initialView="multiMonthYear"
          multiMonthMaxColumns={2}
          events={filteredEvents}
          eventMouseEnter={eventMouseEnter}
          eventMouseLeave={eventMouseLeave}
          height="100%"
        />
      </div>
    </div>
  )
}
