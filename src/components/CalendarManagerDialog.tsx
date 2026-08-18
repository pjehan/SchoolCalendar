import { useState, type RefObject } from 'react';
import type { CalendarEntry } from '../types';

interface CalendarManagerDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  calendars: CalendarEntry[];
  onAdd: (name: string, query: string) => void;
  onDelete: (id: number) => void;
}

export default function CalendarManagerDialog({ dialogRef, calendars, onAdd, onDelete }: CalendarManagerDialogProps) {
  const [newName, setNewName] = useState('');
  const [newQuery, setNewQuery] = useState('');

  const addCalendar = () => {
    if (!newName.trim() || !newQuery.trim()) return;
    onAdd(newName.trim(), newQuery.trim());
    setNewName('');
    setNewQuery('');
  };

  return (
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
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(cal.id)}>
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
  );
}
