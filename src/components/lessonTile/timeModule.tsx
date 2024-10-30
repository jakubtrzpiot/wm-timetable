import React from 'react';
import {View} from 'react-native';
import {TextComponent, ViewComponent} from '../core';
import {Time} from '../../interfaces/timetable.types';

const TimeModule = ({start, end}: Time) => (
  <View className="flex-row mr-2.5 justify-end w-[14%]">
    <View className="justify-between items-end mr-[6]">
      <TextComponent className="leading-4">{start}</TextComponent>
      <TextComponent className="leading-4">{end}</TextComponent>
    </View>
    <ViewComponent className="w-[1.75] my-[1] rounded"></ViewComponent>
  </View>
);

export default TimeModule;
