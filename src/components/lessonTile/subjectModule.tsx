import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  PixelRatio,
} from 'react-native';
import {IconComponent, TextComponent, ViewComponent} from '../core';
import {Subject} from '../../interfaces/timetable.types';
import subjectMap from '../../utils/subjectMap';
import {
  LanguageContext,
  CardOpenContext,
  DateContext,
  NotesContext,
} from '../../utils/context';

interface SubjectModuleProps extends Subject {
  i: number;
  notes?: string[];
}

const SubjectModule = ({name, teacher, type, i}: SubjectModuleProps) => {
  const {openCardId, setCardOpen} = useContext(CardOpenContext);
  const [noteText, setNoteText] = useState<string>('');
  const [lines, setLines] = useState<number>(1);
  const {notes, addNote, removeNote} = useContext(NotesContext);
  const {date} = useContext(DateContext);

  const pixelRatio = PixelRatio.getFontScale();

  const handleSubmitEditing = () =>
    noteText &&
    (addNote({lessonid: i, date: date, content: noteText}), setNoteText(''));

  const lang = useContext(LanguageContext);
  const en = lang === 'en';
  switch (type) {
    case 'j':
      type = en ? 'english' : 'język obcy';
      break;
    case 'w':
      type = en ? 'lecture' : 'wykład';
      break;
    case 'ć':
      type = en ? 'practical' : 'ćwiczenia';
      break;
    case 'l':
      type = en ? 'lab' : 'laboratorium';
      break;
    case 's':
      type = en ? 'seminar' : 'seminarium';
      break;
    case 'p':
      type = en ? 'project' : 'projekt';
      break;
    case 'k':
      type = en ? 'pc lab' : 'komputery';
      break;
    default:
  }

  type = type && type[0].toUpperCase() + type.slice(1);

  const handleCardOpen = () => {
    openCardId === i ? setCardOpen(-1) : setCardOpen(i);
  };

  const filteredNotes = notes.filter(note => {
    return (
      note.lessonid === i &&
      note.date.toLocaleDateString() === date.toLocaleDateString()
    );
  });

  const notesLength = filteredNotes.length;

  return (
    <TouchableOpacity
      className="flex-row flex-1 mr-2"
      activeOpacity={0.75}
      onPress={() => handleCardOpen()}>
      <ViewComponent className={`flex-1 rounded-3xl justify-between pt-4`}>
        <View className="flex-1 justify-between px-4 pb-4">
          <View className="flex-row">
            <TextComponent
              onTextLayout={e => setLines(e.nativeEvent.lines.length)}
              numberOfLines={i === openCardId ? lines : 1}
              className="flex-1 text-base leading-5 !text-[#121212] tracking-wider pb-[7]">
              {subjectMap[name] ? subjectMap[name] : name}
            </TextComponent>
          </View>
          <View className="flex-row justify-between">
            <View className="flex-row">
              <TextComponent className="!text-[#121212] text-xs tracking-wide">
                {teacher.toUpperCase()}
              </TextComponent>
              {notesLength !== 0 && (
                <>
                  <Text
                    className="pl-2 font-lexend-semibold text-xs text-[#121212]"
                    style={{fontSize: 10 / pixelRatio}}>
                    {notesLength}
                  </Text>
                  <IconComponent
                    className="ml-0.5 mt-[1]"
                    name="bookmark"
                    size={12}
                    disabled
                    customColor="#121212"
                  />
                </>
              )}
            </View>
            <TextComponent className="!text-[#121212] leading-4 tracking-wide">
              {type}
            </TextComponent>
          </View>
        </View>
        {i === openCardId && (
          <TouchableOpacity activeOpacity={1} className="pl-4 pr-2">
            {notesLength > 0 && (
              <TextComponent
                className={`!text-[#121212] text-[13px] tracking-wide pb-2 -mt-4`}>
                {en ? 'Notes:' : 'Notatki:'}
              </TextComponent>
            )}
            {notes
              .filter(
                note =>
                  note.lessonid === i &&
                  note.date.toLocaleDateString() === date.toLocaleDateString(),
              )
              ?.map((note, idx) => (
                <View key={idx} className="flex-row mb-2">
                  <TextComponent
                    className={`flex-1 !text-[#121212] text-xs tracking-wide pb-2`}>
                    {`- ${note.content}`}
                  </TextComponent>
                  {/* <IconComponent
                    className="px-2"
                    name="close"
                    size={14}
                    customColor="#121212"
                    onPress={() =>
                      removeNote({
                        lessonid: i,
                        date: date,
                        content: filteredNotes[idx].content,
                      })
                    }
                  /> */}
                </View>
              ))}
            <TextInput
              className="!text-[#121212] text-xs tracking-wide font-lexend-semibold pb-1.5 pt-0 pl-0 pr-2"
              placeholder={en ? 'Add note' : 'Dodaj notatkę'}
              placeholderTextColor="#121212"
              value={noteText}
              onChangeText={text => setNoteText(text)}
              onSubmitEditing={() => handleSubmitEditing()}
              textAlignVertical="top"
            />
          </TouchableOpacity>
        )}
      </ViewComponent>
    </TouchableOpacity>
  );
};

export default SubjectModule;
