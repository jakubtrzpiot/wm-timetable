export type Timetable = {
  p: Day[];
  n: Day[];
};
export type Day = Period[];

export type Period = {
  time: Time;
  subject: Subject | Subject[];
};

export type Time = {
  start: string;
  end: string;
};

export type Subject = {
  name: string;
  type: string;
  group: string;
  week: string;
  teacher: string;
  room: string;
};
