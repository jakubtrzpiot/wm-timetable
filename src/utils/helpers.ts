import {Period, Subject, Timetable} from '../interfaces/timetable.types';
import asyncStorage from './asyncStorage';
import {parseTimetable, parseCourseName, parseCourses} from './parser';

//get day as a number starting from 0 and monday
export const getDay = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

//add days to date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

//check if week is even or odd and return 'p' or 'n' starting from monday
export const getWeekType = (date: Date): string => {
  const weekNumber = Math.ceil(
    (date.getTime() -
      // 24 * 60 * 60 * 1000 - //FIXME
      new Date(date.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );

  return !(weekNumber % 2) ? 'n' : 'p';
};

//genereate array of numbers from start to stop with step
export const range = (start: number, stop?: number, step?: number) => {
  !stop ? ((stop = start), (start = 0)) : null;
  !step ? (step = 1) : null;

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }

  let result = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }

  return result;
};

export const setInitialValues = async (
  course?: number,
  groups?: Array<string>,
  language?: string,
  courseName?: string,
) => {
  groups &&
    groups.map((group: string) => {
      if (group !== 'all' && !/\d/.test(group))
        groups.push([...group].reverse().join(''));
      else return group;
    });

  try {
    const storedCourse = await asyncStorage.getItem('course');
    // console.log(storedCourse, course);
    course && storedCourse && storedCourse.toString() !== course.toString()
      ? await asyncStorage.removeItem('timetable')
      : null;

    course
      ? await asyncStorage.setItem('course', course.toString()) // 22
      : await asyncStorage.removeItem('course');

    groups
      ? await asyncStorage.setItem('groups', groups) // ['l06', 'k05', 'p05', 'dg3', 'all']
      : await asyncStorage.removeItem('groups');
    // console.log(course, groups);

    language
      ? await asyncStorage.setItem('language', language)
      : await asyncStorage.removeItem('language');

    courseName
      ? await asyncStorage.setItem('courseName', courseName)
      : await asyncStorage.removeItem('courseName');
  } catch (err) {
    console.error(err, 'in setInitialValues');
  }
};

export const fetchTimetable = async (refresh: boolean = false) => {
  try {
    const course = await asyncStorage.getItem('course');
    if (course === null) {
      throw new Error('No course selected');
    }

    const storedTimetable = await asyncStorage.getItem('timetable');
    const timetable = await parseTimetable(course);
    !storedTimetable || refresh
      ? await asyncStorage.setItem('timetable', timetable)
      : null;
  } catch (err) {
    console.error(err, 'in fetchTimetable');
  }
};

// export const fetchCourseName = async (course: number) => {
//   const courseName = await parseCourseName(course);
//   return courseName;
// };

export const fetchCourses = async () => {
  const courses = await parseCourses();
  return courses;
};
