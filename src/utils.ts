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

export const getAllRestTime = (
  start: number,
  end: number,
  allRestData: RestData[],
) => {
  let allRestTime = 0;
  allRestData.forEach(({ starttime, endtime }) => {
    const restStart = starttime;
    const restEnd = endtime;
    const _tmpS = start > restEnd ? restEnd : start;
    const _restStart = _tmpS > restStart ? _tmpS : restStart;
    const _tmpE = restStart > end ? restStart : end;
    const _restEnd = _tmpE > restEnd ? restEnd : _tmpE;
    allRestTime += _restEnd - _restStart;
  });
  return new Date(allRestTime - 9 * 60 * 60 * 1000);
};

export const updateDb = (
  day: number,
  starttime: number,
  endtime: number,
  restTime: Date,
  dailyWorkEvent: DailyWorkEvent,
) => {
  const allTime = new Date(endtime - starttime - 9 * 60 * 60 * 1000);
  const regularTime =
    dailyWorkEvent === DAILY_WORK_EVENT.WFH
      ? 7.75
      : dailyWorkEvent === DAILY_WORK_EVENT.NENKYU_WFH
        ? 4.5
        : 3.25;
  const isHealthTimePlus =
    allTime.getTime() - restTime.getTime() - regularTime * 60 * 60 * 1000 >= 0;
  const healthTime = isHealthTimePlus
    ? new Date(
        allTime.getTime() -
          restTime.getTime() -
          (9 + regularTime) * 60 * 60 * 1000,
      )
    : new Date(
        regularTime * 60 * 60 * 1000 -
          allTime.getTime() +
          restTime.getTime() -
          9 * 60 * 60 * 1000,
      );
  db.daywork.update(day, {
    starttime: starttime,
    endtime: endtime,
    resttime: restTime.getTime(),
    healthtime: healthTime.getTime(),
    healthtimePlus: isHealthTimePlus,
    dailyWorkEvent: dailyWorkEvent,
  });
};
