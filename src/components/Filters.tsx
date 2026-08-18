import type { CalendarEntry } from '../types';

interface FilterSelectProps {
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function FilterSelect({ placeholder, options, value, onChange }: FilterSelectProps) {
  return (
    <select className="form-select mb-3" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

interface FiltersProps {
  calendars: CalendarEntry[];
  selectedCalendar: CalendarEntry | null;
  onCalendarChange: (calendar: CalendarEntry | null) => void;
  subjects: string[];
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  groups: string[];
  selectedGroup: string;
  onGroupChange: (value: string) => void;
  teachers: string[];
  selectedTeacher: string;
  onTeacherChange: (value: string) => void;
  locations: string[];
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  onExport: () => void;
}

export default function Filters({
  calendars, selectedCalendar, onCalendarChange,
  subjects, selectedSubject, onSubjectChange,
  groups, selectedGroup, onGroupChange,
  teachers, selectedTeacher, onTeacherChange,
  locations, selectedLocation, onLocationChange,
  onExport,
}: FiltersProps) {
  return (
    <>
      <select
        className="form-select mb-3"
        value={selectedCalendar?.id ?? ''}
        onChange={e => onCalendarChange(calendars.find(cal => cal.id === parseInt(e.target.value)) ?? null)}
      >
        <option value="">-- Choisir un calendrier --</option>
        {calendars.map(cal => (
          <option key={cal.id} value={cal.id}>{cal.name}</option>
        ))}
      </select>
      <FilterSelect placeholder="Tous les sujets" options={subjects} value={selectedSubject} onChange={onSubjectChange} />
      <FilterSelect placeholder="Tous les groupes" options={groups} value={selectedGroup} onChange={onGroupChange} />
      <FilterSelect placeholder="Tous les enseignants" options={teachers} value={selectedTeacher} onChange={onTeacherChange} />
      <FilterSelect placeholder="Toutes les salles" options={locations} value={selectedLocation} onChange={onLocationChange} />
      <button className="btn btn-primary mb-3" onClick={onExport}>Copier les sujets filtrés dans le presse-papier</button>
    </>
  );
}
