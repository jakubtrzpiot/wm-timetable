import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useInitialValues} from './src/utils/hooks';
import TimetableScreen from './src/screens/timetableScreen';
import SetupScreen from './src/screens/setupScreen';
import {Loader} from './src/components/core';
import {
  ThemeContext,
  LanguageContext,
  RefreshContext,
  TimetableContext,
  NotesContext,
} from './src/utils/context';
import asyncStorage from './src/utils/asyncStorage';
import {Timetable} from './src/interfaces/timetable.interfaces';
import {Note, Notes} from './src/interfaces/notes.interfaces';

const App: React.FC = () => {
  const [initialValuesSet, setInitialValuesSet] = useState(false);
  const [color, setColor] = useState('#c5e1f5');
  const [language, setLanguage] = useState('pl');
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [timetable, setTimetable] = useState<Timetable>([]);
  const [notes, setNotes] = useState<Notes>([]);

  const addNote = (note: Note) => {
    if (!note.content.replace(/\s/g, '').length) return;
    const newNotes = [...notes];
    newNotes.push(note);
    setNotes(newNotes);
    asyncStorage.setItem('notes', newNotes);
  };

  const removeNote = (note: Note) => {
    const newNotes = [...notes];
    const index = newNotes.findIndex(
      n =>
        n.content === note.content &&
        n.date.toLocaleDateString() === note.date.toLocaleDateString() &&
        n.lessonid === note.lessonid,
    );
    newNotes.splice(index, 1);
    setNotes(newNotes);
    asyncStorage.setItem('notes', newNotes);
  };

  useEffect(() => {
    useRefresh();
    asyncStorage
      .getItem('timetable')
      .then(result => result && setTimetable(result));
    const today = new Date().getTime();
    asyncStorage
      .getItem('notes')
      .then(
        result =>
          result &&
          setNotes(
            result
              .map((note: Note) => ({...note, date: new Date(note.date)}))
              .filter((note: Note) => today - note.date.getTime() < 604800000),
          ),
      );
  }, [initialValuesSet]);

  const useRefresh = (item?: 'color' | 'lang' | 'submit' | 'setup') => {
    if (!item || item === 'lang')
      asyncStorage
        .getItem('language')
        .then(result => result && setLanguage(result));
    if (!item || item === 'color')
      asyncStorage.getItem('color').then(result => result && setColor(result));
    if (!item || item === 'submit')
      useInitialValues().then(
        result => (
          setInitialValuesSet(result), setLoading(false), setSetupOpen(false)
        ),
      );
    if (item === 'setup') setSetupOpen(!setupOpen), setLoading(false);
  };

  return (
    <RefreshContext.Provider value={useRefresh}>
      <LanguageContext.Provider value={language}>
        <ThemeContext.Provider value={color}>
          <View className="flex-1 bg-[#121212]">
            {!loading ? (
              !initialValuesSet ? (
                <SetupScreen
                  isSetup={!initialValuesSet}
                  setTimetable={(timetable: any) => setTimetable(timetable)}
                />
              ) : !setupOpen ? (
                <GestureHandlerRootView className="flex-1 bg-inherit">
                  <TimetableContext.Provider value={timetable}>
                    <NotesContext.Provider value={{notes, addNote, removeNote}}>
                      <TimetableScreen />
                    </NotesContext.Provider>
                  </TimetableContext.Provider>
                </GestureHandlerRootView>
              ) : (
                <SetupScreen
                  isSetup={!initialValuesSet}
                  setTimetable={(timetable: any) => setTimetable(timetable)}
                />
              )
            ) : (
              <Loader />
            )}
          </View>
        </ThemeContext.Provider>
      </LanguageContext.Provider>
    </RefreshContext.Provider>
  );
};

export default App;

//BEFORE RELEASE
//TODO [] add addNote, removeNote
//TODO [x] add notes screen 
//TODO [x] add note indicator
//TODO [] add current time as a line across the timetable
//TODO [x] add custom theme for dropdown
//TODO [] add animations
//TODO [] add better alerts
//TODO [] add splash screen instead of loader on initial load
//TODO [] get the metarial ui colors
//TODO [x] add readme
//TODO [] maybe add smooth transitions between screens
//TODO [] scroll to opened card when opening it
//TODO [] Add mechanic to set first odd week
//FIXME [] fix the bug with keyboard not opening when component is too low on the screen
//FIXME [] language group name not displayed correctly
//FIXME [] going into the settings shouldnt refresh the date context
