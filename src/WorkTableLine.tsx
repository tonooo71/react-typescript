import React from "react";

import { Button, Checkbox, HTMLSelect, OptionProps } from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import {
  Blank,
  ManuallyEnteredData,
  Minus,
  Plus,
  Reset,
  Tick,
  Time,
} from "@blueprintjs/icons";

import {
  APPROVAL_PROCESS,
  DAILY_WORK_EVENT,
  DailyWorkEvent,
  RestData,
  WorkData,
  db,
} from "./db";
import { reflect } from "./reflect";
import { getAllRestTime, getDayOfWeek, updateDb } from "./utils";

import styles from "./WorkTableLine.module.scss";

type Props = {
  idx: number;
  now: Date;
  workData: WorkData;
  allRestData: RestData[];
  holidays: number[];
};

const WorkTableLine: React.FC<Props> = ({
  idx,
  now,
  workData: {
    day,
    starttime,
    endtime,
    resttime,
    healthtime,
    healthtimePlus,
    dailyWorkEvent,
    approvalProcess,
  },
  allRestData,
  holidays,
}) => {
  const year = now.getFullYear();
  const month = now.getMonth();

  const dayOfWeek = new Date(year, month, day).getDay();
  const dayOfWeekStr = getDayOfWeek(dayOfWeek);

  const eventOptions: OptionProps<DailyWorkEvent>[] = [
    { value: DAILY_WORK_EVENT.WFH, label: "WFH" },
    { value: DAILY_WORK_EVENT.NENKYU, label: "年休" },
    { value: DAILY_WORK_EVENT.NENKYU_WFH, label: "年休/WFH" },
    { value: DAILY_WORK_EVENT.WFH_NENKYU, label: "WFH/年休" },
  ];

  const isHoliday = dayOfWeek % 6 === 0 || holidays.includes(day);

  const actionDisabled =
    isHoliday ||
    (dailyWorkEvent !== DAILY_WORK_EVENT.NENKYU &&
      (starttime === new Date(1970, 0, 2).getTime() ||
        endtime === new Date(1970, 0, 2).getTime()));

  const isNenkyu = dailyWorkEvent === DAILY_WORK_EVENT.NENKYU;

  return (
    <tr
      id={`day${day}`}
      className={styles.dateContainerCss}
      data-holiday={isHoliday}
      data-today={day === now.getDate()}
    >
      <td>
        {actionDisabled ? (
          <Blank />
        ) : (
          <Tick className="valid_day" data-index={idx} />
        )}
      </td>
      <td>{`${month + 1}/${day}(${dayOfWeekStr})`}</td>
      <td>
        <HTMLSelect
          options={eventOptions}
          value={dailyWorkEvent}
          onChange={(e) => {
            const restTime = getAllRestTime(starttime, endtime, allRestData);
            updateDb(
              day,
              starttime,
              endtime,
              restTime,
              e.currentTarget.value as DailyWorkEvent,
            );
          }}
          disabled={isHoliday}
        />
      </td>
      <td>
        <div className={styles.timeContainerCss}>
          <TimePicker
            selectAllOnFocus
            value={new Date(starttime)}
            onChange={(d) => {
              const restTime = getAllRestTime(
                d.getTime(),
                endtime,
                allRestData,
              );
              updateDb(day, d.getTime(), endtime, restTime, dailyWorkEvent);
            }}
            disabled={isHoliday || isNenkyu}
          />
          <Button
            icon={<Time />}
            onClick={() => {
              const now = new Date(
                1970,
                0,
                2,
                new Date().getHours(),
                new Date().getMinutes(),
              ).getTime();
              const restTime = getAllRestTime(now, endtime, allRestData);
              updateDb(day, now, endtime, restTime, dailyWorkEvent);
            }}
            disabled={isHoliday || isNenkyu}
          />
        </div>
      </td>
      <td>
        <div className={styles.timeContainerCss}>
          <TimePicker
            selectAllOnFocus
            value={new Date(endtime)}
            onChange={(d) => {
              const restTime = getAllRestTime(
                starttime,
                d.getTime(),
                allRestData,
              );
              updateDb(day, starttime, d.getTime(), restTime, dailyWorkEvent);
            }}
            disabled={isHoliday || isNenkyu}
          />
          <Button
            icon={<Time />}
            onClick={() => {
              const now = new Date(
                1970,
                0,
                2,
                new Date().getHours(),
                new Date().getMinutes(),
              ).getTime();
              const restTime = getAllRestTime(starttime, now, allRestData);
              updateDb(day, starttime, now, restTime, dailyWorkEvent);
            }}
            disabled={isHoliday || isNenkyu}
          />
        </div>
      </td>
      <td>
        <TimePicker
          value={new Date(resttime)}
          onChange={(d) => updateDb(day, starttime, endtime, d, dailyWorkEvent)}
          disabled={isHoliday || isNenkyu}
        />
      </td>
      <td style={{ display: "flex" }}>
        {healthtimePlus ? (
          <Plus size={10} style={{ margin: "auto 4px auto 0" }} />
        ) : (
          <Minus size={10} style={{ margin: "auto 4px auto 0" }} />
        )}
        <TimePicker disabled value={new Date(healthtime)} />
      </td>
      <td>
        <Checkbox
          checked={approvalProcess === APPROVAL_PROCESS.KARI}
          onChange={() =>
            db.daywork.update(day, {
              approvalProcess:
                approvalProcess === APPROVAL_PROCESS.KARI
                  ? APPROVAL_PROCESS.SHOUNINN
                  : APPROVAL_PROCESS.KARI,
            })
          }
          disabled={isHoliday}
        >
          仮入力
        </Checkbox>
      </td>
      <td>
        <Button
          icon={<ManuallyEnteredData />}
          onClick={() => reflect(idx)}
          title="reflect only this day"
          disabled={actionDisabled}
        />
        <Button
          icon={<Reset />}
          onClick={() => {
            const init = new Date(1970, 0, 2);
            updateDb(day, init.getTime(), init.getTime(), init, dailyWorkEvent);
          }}
          title="reset only this day"
          disabled={actionDisabled}
        />
      </td>
    </tr>
  );
};

export default WorkTableLine;
