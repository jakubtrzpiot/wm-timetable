import {createContext, Dispatch, SetStateAction} from 'react';
import {Timetable} from '../interfaces/timetable.types';
import {Note, Notes} from '../interfaces/notes.types';

export const ThemeContext = createContext('#c5e1f5');

export const LanguageContext = createContext('pl');

export const RefreshContext = createContext(
  (item?: 'color' | 'lang' | 'submit' | 'setup') => {},
);

interface DateContextType {
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
}

export const DateContext = createContext<DateContextType>({
  date: new Date(),
  setDate: () => {},
});

interface CardOpenContextType {
  openCardId: number;
  setCardOpen: Dispatch<SetStateAction<number>>;
}

export const CardOpenContext = createContext<CardOpenContextType>({
  openCardId: -1,
  setCardOpen: () => {},
});

export const TimetableContext = createContext<Timetable>([]);

interface NotesContextType {
  notes: Notes;
  addNote: (note: Note) => void;
  removeNote: (note: Note) => void;
}

export const NotesContext = createContext<NotesContextType>({
  notes: [],
  addNote: () => {},
  removeNote: () => {},
});
