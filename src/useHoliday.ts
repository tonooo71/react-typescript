import { useEffect, useState } from "react";

type holidaysLocalStorageDataType = {
  month: number;
  holidays: number[];
};

const getHolidays = async (year: number, month: number) => {
  const allRawHolidays = await fetch(
    "https://holidays-jp.github.io/api/v1/date.json",
  )
    .then((res) => res.text())
    .then((data) => data);
  const allHolidays = JSON.parse(allRawHolidays);
  const holidays = Object.keys(allHolidays)
    .filter((day) =>
      day.startsWith(`${year}-${month < 9 ? "0" : ""}${month + 1}`),
    )
    .map((day) => parseInt(day.split("-")[2]));
  return holidays;
};

export const useHoliday = (year: number, month: number) => {
  const [holidays, setHolidays] = useState<number[]>([]);

  useEffect(() => {
    const strHolidaysData = localStorage.getItem("holidays");
    if (strHolidaysData === null) {
      getHolidays(year, month).then((_holidays) => {
        setHolidays(_holidays);
        const data: holidaysLocalStorageDataType = {
          month,
          holidays: _holidays,
        };
        localStorage.setItem("holidays", JSON.stringify(data));
      });
    } else {
      const _holidays = JSON.parse(
        strHolidaysData,
      ) as holidaysLocalStorageDataType;
      if (_holidays.month === month) {
        setHolidays(_holidays.holidays);
      } else {
        getHolidays(year, month).then((_holidays) => {
          setHolidays(_holidays);
          const data: holidaysLocalStorageDataType = {
            month,
            holidays: _holidays,
          };
          localStorage.setItem("holidays", JSON.stringify(data));
        });
      }
    }
  }, []);

  return holidays;
};
