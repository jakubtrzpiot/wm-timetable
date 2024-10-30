import {useContext, useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
import asyncStorage from './asyncStorage';
import {NotesContext} from './context';

export const useInitialValuesSet = async () => {
  try {
    const course = await asyncStorage.getItem('course');
    const groups = await asyncStorage.getItem('groups');
    const language = await asyncStorage.getItem('language');
    const courseName = await asyncStorage.getItem('courseName');

    return course && groups && language && courseName;
  } catch (err) {
    console.error(err, 'in useInitialValues');
    return false;
  }
};

export const useNoteCount = () => {
  const {notes} = useContext(NotesContext);
  return notes?.length || 0;
};

const useKeyboardState = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setIsKeyboardOpen(true);
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return {isKeyboardOpen, keyboardHeight};
};

export default useKeyboardState;
