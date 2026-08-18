import { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react'
import multiMonthPlugin from '@fullcalendar/multimonth'
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import type { EventHoveringArg } from '@fullcalendar/core';
import { Tooltip } from 'bootstrap';
import useICalEvents from '../hooks/useICalEvents';
import CalendarManagerDialog from './CalendarManagerDialog';
import Filters from './Filters';
import type { CalendarEntry, CalendarEvent } from '../types';

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(value => value !== ''))].toSorted();
}

export default function Calendar() {
    const [calendars, setCalendars] = useState<CalendarEntry[]>(() => {
        const stored = localStorage.getItem('calendars');
        return stored ? JSON.parse(stored) : [];
    });
    const [selectedCalendar, setSelectedCalendar] = useState<CalendarEntry|null>(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(true);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const tooltipRef = useRef<Tooltip|null>(null);

    const events = useICalEvents(selectedCalendar);

    useEffect(() => {
        localStorage.setItem('calendars', JSON.stringify(calendars));
    }, [calendars]);

    const subjects = useMemo(() => uniqueSorted(events.map(event => event.subject)), [events]);
    const groups = useMemo(() => uniqueSorted(events.flatMap(event => event.groups)), [events]);
    const teachers = useMemo(() => uniqueSorted(events.flatMap(event => event.teachers)), [events]);
    const locations = useMemo(() => uniqueSorted(events.flatMap(event => event.locations)), [events]);

    const changeCalendar = (calendar: CalendarEntry|null) => {
        setSelectedCalendar(calendar);
        setSelectedSubject("");
        setSelectedGroup("");
        setSelectedTeacher("");
        setSelectedLocation("");
    };

    const addCalendar = (name: string, query: string) => {
        setCalendars(prev => {
            const newId = Math.max(0, ...prev.map(c => c.id)) + 1; // Generate a new ID based on the highest existing ID
            return [...prev, { id: newId, name, query }];
        });
    };

    const deleteCalendar = (id: number) => {
        setCalendars(prev => prev.filter(c => c.id !== id));
        if (selectedCalendar?.id === id) changeCalendar(null);
    };

    const filteredEvents = events.filter((event: CalendarEvent) =>
        (selectedSubject === "" || selectedSubject === event.subject) &&
        (selectedGroup === "" || event.groups.includes(selectedGroup)) &&
        (selectedTeacher === "" || event.teachers.includes(selectedTeacher)) &&
        (selectedLocation === "" || event.locations.includes(selectedLocation))
    );

    const exportEventsSubjects = () => {
      const subjects = filteredEvents.map(event => event.subject);
      navigator.clipboard.writeText(subjects.join('\n')).then(() => {
        alert('Sujets copiés dans le presse-papier !');
      }).catch(err => {
        console.error('Erreur lors de la copie dans le presse-papier : ', err);
      });
    };

    const eventMouseEnter = (info: EventHoveringArg) => {
      tooltipRef.current = Tooltip.getInstance(info.el) ?? new Tooltip(info.el, {
        title: info.event.extendedProps.description,
        placement: 'top',
        trigger: 'manual',
        container: 'body',
        html: true,
      });
      tooltipRef.current.show();
    }

    const eventMouseLeave = () => {
      tooltipRef.current?.hide();
    }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CalendarManagerDialog
        dialogRef={dialogRef}
        calendars={calendars}
        onAdd={addCalendar}
        onDelete={deleteCalendar}
      />

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
          <Filters
            calendars={calendars}
            selectedCalendar={selectedCalendar}
            onCalendarChange={changeCalendar}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            groups={groups}
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            teachers={teachers}
            selectedTeacher={selectedTeacher}
            onTeacherChange={setSelectedTeacher}
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            onExport={exportEventsSubjects}
          />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <FullCalendar
          plugins={[ multiMonthPlugin, bootstrap5Plugin ]}
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
