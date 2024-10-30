import {DOMParser as parser} from 'react-native-html-parser';
import {WM_URL} from './constants';
import {Timetable, Day, Period, Subject} from '../interfaces/timetable.types';
import asyncStorage from './asyncStorage';

const transpose = (array: Array<any>) => {
  return array[0].map((_: any, i: number) => {
    return array.map(col => {
      return col[i];
    });
  });
};

const unwrap = (node: any) => {
  if (node.childNodes.length > 1 || node.firstChild.childNodes) {
    //one or more subjects
    return Array.from(node.getElementsByAttribute('class', 'p'))
      .filter(
        (subject: any) =>
          subject.firstChild.nodeValue.split(' ')[0].trim()[0] !== '#',
      )
      .map((subject: any, index: number) => {
        const p = subject.firstChild.nodeValue.replace(/  +/g, ' ');
        const name =
          p.substr(0, 2) === 'J '
            ? p.split(' ').slice(0, 2).join(' ').trim().split('-')[0]
            : p.split(' ').slice(0, -1).join(' ').trim();

        let week, teacher;
        try {
          week = p
            .split(' ')
            [p.split(' ').length - 1].split('-')[1]
            .trim()
            .replace(/[()]/g, '')
            .replace('.', '')
            .toLowerCase()[0];
        } catch (err) {
          week = subject.nextSibling.nodeValue
            .trim()
            .replace(/[()\-0-9]/g, '')
            .replace('.', '')
            .toLowerCase();
        }

        try {
          teacher = node
            .getElementsByAttribute('class', 'n')
            [index].firstChild.nodeValue.toUpperCase();
        } catch (err) {
          teacher = subject.nextSibling.nextSibling.firstChild.nodeValue
            .slice(1)
            .replace(/[0-9]/g, '')
            .toUpperCase();
        }

        const t =
          p.substr(0, 2) === 'J '
            ? 'j'
            : p
                .trim()
                .split(' ')
                [p.split(' ').length - 1].split('-')[0]
                .toLowerCase();

        let type = t[0];

        const group =
          t.length > 1
            ? t
            : type === 'j'
            ? subject.nextSibling.nextSibling.firstChild.nodeValue
                .replace('#', '')
                .toLowerCase()
            : ['ć', 'w'].includes(type)
            ? 'all'
            : null;

        let room = node
          .getElementsByAttribute('class', 's')
          [index].firstChild.nodeValue.split('-')
          .slice(0, -1)
          .join('-')
          .split('/')[0]
          .trim();
        room.toLowerCase() === 'e-learning' ? (room = 'ONLINE') : null;

        //FIXME: remove this, temporarily disable teachers initals
        teacher = type == 'j' ? group : '';

        return {
          name,
          type,
          group,
          week,
          teacher,
          room,
        } as Subject;
      });
  } else {
    //no subject
    return [];
  }
};

const stripNullValuesFromEdges = (array: Array<any>) => {
  // Remove null values from the beginning of the array
  while (array.length > 0 && array[0].subject === null) {
    array.shift();
  }

  // Remove null values from the end of the array
  while (array.length > 0 && array[array.length - 1].subject === null) {
    array.pop();
  }

  return array;
};

const filter = (timetable: Day[], groups: Array<string>): Timetable => {
  // console.log('timetable:', timetable, '\ngroups:', groups);
  const byWeek = (week: string): Day[] =>
    timetable.map(
      day =>
        day &&
        stripNullValuesFromEdges(
          day.map(({time, subject}: Period) => ({
            time,
            subject:
              (subject as Subject[])?.filter(subject => {
                if (subject.week.includes(week)) {
                  if (groups.includes('en0') && subject.type == 'j')
                    return true;
                  if (groups.includes(subject.group)) return true;
                }
              })[0] || null,
          })),
        ),
    );

  const result = {n: byWeek('n'), p: byWeek('p')}
  // console.log('Filter result', result);
  return result;
};

export const parseTimetable = async (course: number): Promise<Timetable> => {
  const groups = await asyncStorage.getItem('groups');
  // const do_compact = await asyncStorage.getItem('compact');
  // const compact = (timetable: Timetable): Timetable => {
  //   return timetable.map(day => {
  //     const compacted: Period[] = [];
  //     let i = 0;
  //     while (i < day.length) {
  //       const lesson = day[i];
  //       if (lesson.subject) {
  //         let j = i + 1;
  //         while (
  //           j < day.length &&
  //           //@ts-expect-error
  //           day[j]?.subject?.name === lesson.subject.name &&
  //           //@ts-expect-error
  //           day[j]?.subject?.type === lesson.subject.type &&
  //           j - i < 3
  //         ) {
  //           j++;
  //         }
  //         compacted.push({
  //           time: {
  //             start: lesson.time.start,
  //             end: day[j - 1].time.end,
  //           },
  //           subject: lesson.subject,
  //         });
  //         i = j;
  //       } else {
  //         compacted.push(lesson);
  //         i++;
  //       }
  //     }
  //     return compacted.filter(lesson => lesson.subject);
  //   });
  // };

  // const res = true ? compact(timetable) : timetable; // do_compact
  return await fetch(`${WM_URL}/plany/o${course}.html`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok.');
      }
      return res.text();
    })
    .then(html => {
      const doc = new parser().parseFromString(
        html.replace(/(\r\n|\n|\r)/gm, ''),
        'text/html',
      );

      const transposed = transpose(
        Array.from(
          doc.getElementsByAttribute('class', 'tabela')[0].childNodes,
          (row: any) => Array.from(row.childNodes),
        ).slice(1),
      ).slice(1);

      const hours = transposed[0].map((hour: any) => {
        hour = hour.firstChild.data.replace(/(\s)/gm, '').split('-');
        return {start: hour[0], end: hour[1]};
      });

      let timetable = transposed.slice(1).map((day: any) => {
        return day.map((lesson: any, i: number) => {
          const time = hours[i];
          return {
            time,
            subject: unwrap(lesson) || [],
          };
        });
      });

      // type PeriodProps = {
      //   dayIndex: number;
      //   lessonIndex: number | number[];
      //   subject: {
      //     name: string;
      //     group?: string;
      //     week?: string;
      //     type?: string;
      //     teacher?: string;
      //     room?: string;
      //   };
      // }

      // const insertPeriods = ({lessonIndex, dayIndex, subject}: PeriodProps) => {
      //   for (let idx of lessonIndex as number[]) {
      //     timetable[dayIndex][idx].subject.push(subject);
      //   }
      // };
      // const deletePeriods = ({lessonIndex, dayIndex, subject}: PeriodProps) => {
      //   for (let idx of lessonIndex as number[]) {
      //     let subjectIndex = 0;
      //     while (subjectIndex > -1) {
      //       subjectIndex = timetable[dayIndex][idx].subject
      //         .slice(subjectIndex)
      //         .findIndex((s: Subject) => s.name === subject.name);

      //       timetable[dayIndex][idx].subject.pop(subjectIndex);
      //     }
      //   }
      // };

      timetable = filter(timetable, groups);
      // console.log(res);
      return timetable
    })
    .catch(err => err && console.error(err, 'parseTimetable'));
};

//parse course name

interface courseProps {
  label: string;
  value: number;
}

// export const parseCourses = (): Promise<
//   PromiseSettledResult<courseProps>[]
// > => {
//   let courses = Array.from(Array(125).keys()).map(
//     async n => await parseCourseName(n),
//   );
//   return Promise.allSettled(courses);
// };
export const parseCourses = async (): Promise<courseProps[]> => {
  return await fetch(`${WM_URL}/lista.html`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok.');
      }
      return res.text();
    })
    .then(html => {
      const doc = new parser().parseFromString(
        html.replace(/(\r\n|\n|\r)/gm, ''),
        'text/html',
      );
      const courses = doc
        .querySelect('#oddzialy a[href="plany/o"]')
        .map((node: any) => ({
          label: node.childNodes[0].nodeValue,
          value: node.attributes[0].nodeValue.replace(/[^0-9]/g, ''),
        }));
      return courses;
    });
};

// export const parseCourseName = async (course: number): Promise<courseProps> => {
//   return await fetch(`${WM_URL}/plany/o${course}.html`)
//     .then(res => {
//       if (!res.ok) {
//         throw new Error('Network response was not ok.');
//       }
//       return res.text();
//     })
//     .then(html => {
//       const doc = new parser().parseFromString(
//         html.replace(/(\r\n|\n|\r)/gm, ''),
//         'text/html',
//       );

//       return {
//         label: doc.getElementsByAttribute('class', 'tytulnapis')[0].firstChild
//           .nodeValue,
//         value: course,
//       };
//     });
// };
