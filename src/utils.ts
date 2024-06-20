import { DAILY_WORK_EVENT, DailyWorkEvent, RestData, db } from "./db";

export const getDayOfWeek = (idx: number) => {
  switch (idx) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
    default:
      return "---";
  }
};

export const getDiffTime = (
  time1: StringTime, // starttime
  time2: StringTime, // endtime
): StringTime => {
  if (time1.length > 0 && time2.length > 0) {
    const [hour1, minute1] = time1.split(":").map((d) => parseInt(d));
    const [hour2, minute2] = time2.split(":").map((d) => parseInt(d));
    const hour = hour2 - hour1 - (minute2 >= minute1 ? 0 : 1);
    const minute = minute2 - minute1 + (minute2 >= minute1 ? 0 : 60);
    if (hour >= 0 && minute >= 0) {
      return (
        hour.toString().padStart(2, "0") +
        ":" +
        minute.toString().padStart(2, "0")
      );
    }
  }
  return "";
};

export const getAddTime = (
  time1: StringTime,
  time2: StringTime,
): StringTime => {
  if (time1.length > 0) {
    if (time2.length > 0) {
      const [hour1, minute1] = time1.split(":").map((d) => parseInt(d));
      const [hour2, minute2] = time2.split(":").map((d) => parseInt(d));
      const hour = hour2 + hour1 + (minute2 + minute1 >= 60 ? 1 : 0);
      const minute = minute2 + minute1 - (minute2 + minute1 >= 60 ? 60 : 0);
      return (
        hour.toString().padStart(2, "0") +
        ":" +
        minute.toString().padStart(2, "0")
      );
    } else {
      return time1;
    }
  } else {
    if (time2.length > 0) {
      return time2;
    } else {
      return "00:00";
    }
  }
};

export const getAllRestTime = (
  start: StringTime,
  end: StringTime,
  allRestData: RestData[],
): StringTime => {
  const allRestTime = allRestData.reduce((prev, { starttime, endtime }) => {
    const restStart = starttime;
    const restEnd = endtime;
    const _tmpS = start > restEnd ? restEnd : start;
    const _restStart = _tmpS > restStart ? _tmpS : restStart;
    const _tmpE = restStart > end ? restStart : end;
    const _restEnd = _tmpE > restEnd ? restEnd : _tmpE;
    const restTime = getDiffTime(_restStart, _restEnd);
    return getAddTime(prev, restTime);
  }, "00:00");
  return allRestTime;
};

export const getNow = () => {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  return (
    hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0")
  );
};

export const updateDb = (
  day: number,
  starttime: StringTime,
  endtime: StringTime,
  resttime: StringTime,
  dailyWorkEvent: DailyWorkEvent,
) => {
  const alltime = getDiffTime(starttime, endtime);
  if (alltime.length > 0) {
    if (resttime.length > 0) {
      const regulartime =
        dailyWorkEvent === DAILY_WORK_EVENT.WFH
          ? "07:45"
          : dailyWorkEvent === DAILY_WORK_EVENT.NENKYU_WFH
            ? "04:30"
            : "03:15";
      const sumtime = getAddTime(regulartime, resttime);
      const _healthtime = getDiffTime(sumtime, alltime);
      const healthtimePlus = _healthtime.length > 0;
      const healthtime = healthtimePlus
        ? _healthtime
        : getDiffTime(alltime, sumtime);
      db.daywork.update(day, {
        starttime,
        endtime,
        resttime,
        healthtime,
        healthtimePlus,
        dailyWorkEvent,
      });
    } else {
      db.daywork.update(day, {
        starttime,
        endtime,
        resttime,
        healthtime: "00:00",
        healthtimePlus: true,
        dailyWorkEvent,
      });
    }
  } else {
    db.daywork.update(day, {
      starttime,
      endtime,
      resttime: "00:00",
      healthtime: "00:00",
      healthtimePlus: true,
      dailyWorkEvent,
    });
  }
};
