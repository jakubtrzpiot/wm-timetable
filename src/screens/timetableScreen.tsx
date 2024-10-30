import React, {useState, useEffect, useContext, useRef} from 'react';
import {SafeAreaView, View} from 'react-native';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {fetchTimetable, getDay, addDays, getWeekType} from '../utils/helpers';
import {SwipeComponent, Loader} from '../components/core';
import HeaderBar from '../components/headerBar';
import LessonTile from '../components/lessonTile';
import Empty from '../components/lessonTile/empty';
import {
  DateContext,
  ThemeContext,
  CardOpenContext,
  TimetableContext,
} from '../utils/context';
import {Day} from '../interfaces/timetable.types';
// import useKeyboardState from '../utils/hooks';

const TimetableScreen = () => {
  const timetable = useContext(TimetableContext);
  const [today, setToday] = useState<Day>();
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [week, setWeek] = useState<string>('');
  const [openCardId, setCardOpen] = useState<number>(-1);
  const colorHex = useContext(ThemeContext);

  // const {isKeyboardOpen, keyboardHeight} = useKeyboardState();

  useEffect(() => {
    const day = getDay(date);

    const week = getWeekType(date);
    setWeek(week);

    timetable &&
      (setToday(timetable[(week === 'n' ? 0 : 1) * 7 + day]), setCardOpen(-1));

    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
  }, [date, timetable, loading]);

  const handleSwipe = (dir: string) => {
    switch (dir) {
      case 'left':
        setDate(addDays(date, 1));
        break;
      case 'right':
        setDate(addDays(date, -1));
        break;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchTimetable(true).then(() => setLoading(false));
  };

  const flatListRef = useRef<FlatList>(null);

  return week && date ? (
    <>
      <DateContext.Provider value={{date, setDate}}>
        <HeaderBar week={week} />
        {today ? (
          <SwipeComponent onSwipe={dir => handleSwipe(dir)}>
            <SafeAreaView className="flex-1">
              <CardOpenContext.Provider value={{openCardId, setCardOpen}}>
                <FlatList
                  className="min-h-full px-4"
                  keyboardShouldPersistTaps="always"
                  showsVerticalScrollIndicator={false}
                  data={today}
                  renderItem={({item, index}) => (
                    <LessonTile i={index} {...item} />
                  )}
                  ref={flatListRef}
                  ItemSeparatorComponent={() => <View className="h-4" />}
                  ListEmptyComponent={() => <Empty />}
                  ListHeaderComponent={() => <View className="h-3" />}
                  ListFooterComponent={() => (
                    <View className="h-5" style={{paddingBottom: 320}} />
                  )}
                  refreshControl={
                    <RefreshControl
                      colors={['#121212']}
                      progressBackgroundColor={colorHex}
                      refreshing={loading}
                      onRefresh={() => handleRefresh()}
                    />
                  }
                />
              </CardOpenContext.Provider>
            </SafeAreaView>
          </SwipeComponent>
        ) : (
          <Loader />
        )}
      </DateContext.Provider>
    </>
  ) : (
    <Loader />
  );
};

export default TimetableScreen;
