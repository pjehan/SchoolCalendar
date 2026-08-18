export interface CalendarEntry {
  id: number;
  name: string;
  query: string;
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  locations: string[];
  groups: string[];
  subject: string;
  teachers: string[];
  description: string;
}
