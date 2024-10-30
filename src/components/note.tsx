import React, {useState, useContext, useEffect} from 'react';
import {
  IconComponent,
  TextComponent,
  ViewComponent,
  ButtonComponent,
} from './core';
import {Note} from '../interfaces/notes.types';
import {
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  CardOpenContext,
  DateContext,
  NotesContext,
  ThemeContext,
} from '../utils/context';

const NoteCard = ({item, close}: {item: Note; i: number; close: any}) => {
  const [lines, setLines] = useState<number>(1);
  const {setDate} = useContext(DateContext);
  // const {setCardOpen} = useContext(CardOpenContext);
  const {removeNote} = useContext(NotesContext);
  const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  const rounded = ['rounded-[20px]', 'rounded-[24px]'];

  const handlePick = () => {
    setDate(item.date);
    close(true);
    // setCardOpen(item.lessonid);
  };

  const onRemoveModalDismiss = (confirm: boolean) => {
    confirm && removeNote(item);
    setRemoveModalOpen(false);
    setEditModalOpen(false);
  };

  const handleRemove = () => {
    setRemoveModalOpen(true);
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => handlePick()}
      className={`flex-row flex-1 items-center`}>
      <ViewComponent
        className={`flex-1 flex-row justify-between items-center py-4 pl-4 ${
          rounded[lines - 1] ?? 'rounded-3xl'
        }`}>
        <TextComponent
          onTextLayout={e => setLines(e.nativeEvent.lines.length)}
          className="!text-[#121212]">
          {item.content}
        </TextComponent>
        <IconComponent
          name="pencil"
          className="-mt-2.5 -mb-4 px-4"
          customColor="#121212"
          center
          size={20}
          onPress={() => handleEdit()}
        />
      </ViewComponent>
    </TouchableOpacity>
  );
};

export default NoteCard;
