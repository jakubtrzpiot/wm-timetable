// import {Dispatch, SetStateAction} from 'react';
export type Notes = Note[];

export type Note = {
  lessonid: number;
  content: string;
  date: Date;
}

// type noteRemoveProps = {
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   removeNote: (confirm: boolean) => void;
// }

// type editNoteProps = {
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   note: string;
// }
