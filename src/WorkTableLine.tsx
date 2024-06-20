import React from "react";

import {
  Button,
  HTMLSelect,
  InputGroup,
  OptionProps,
  Switch,
} from "@blueprintjs/core";
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
import { getAllRestTime, getDayOfWeek, getNow, updateDb } from "./utils";

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
      (starttime === "" || endtime === ""));

  const isNenkyu = dailyWorkEvent === DAILY_WORK_EVENT.NENKYU;

  return (
    <tr
      id={`day${day}`}
      className={styles.dateContainerCss}
      data-holiday={isHoliday}
      data-today={day === now.getDate()}
    >
      {/* 有効なデータ */}
      <td>
        {actionDisabled ? (
          <Blank />
        ) : (
          <Tick className="valid_day" data-index={idx} />
        )}
      </td>
      {/* 日 */}
      <td>{`${month + 1}/${day}(${dayOfWeekStr})`}</td>
      {/* 勤務事象 */}
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
      {/* 始業時刻 */}
      <td>
        <div className={styles.timeContainerCss}>
          <InputGroup
            type="time"
            onChange={(e) => {
              const _starttime = e.currentTarget.value;
              const _resttime = getAllRestTime(
                _starttime,
                endtime,
                allRestData,
              );
              updateDb(day, _starttime, endtime, _resttime, dailyWorkEvent);
            }}
            value={starttime}
            disabled={isHoliday || isNenkyu}
          />
          <Button
            icon={<Time />}
            onClick={() => {
              const _starttime = getNow();
              const _resttime = getAllRestTime(
                _starttime,
                endtime,
                allRestData,
              );
              updateDb(day, _starttime, endtime, _resttime, dailyWorkEvent);
            }}
            disabled={isHoliday || isNenkyu}
          />
        </div>
      </td>
      {/* 終業時刻 */}
      <td>
        <div className={styles.timeContainerCss}>
          <InputGroup
            type="time"
            onChange={(e) => {
              const _endtime = e.currentTarget.value;
              const _resttime = getAllRestTime(
                starttime,
                _endtime,
                allRestData,
              );
              updateDb(day, starttime, _endtime, _resttime, dailyWorkEvent);
            }}
            value={endtime}
            disabled={isHoliday || isNenkyu}
          />
          <Button
            icon={<Time />}
            onClick={() => {
              const _endtime = getNow();
              const _resttime = getAllRestTime(
                starttime,
                _endtime,
                allRestData,
              );
              updateDb(day, starttime, _endtime, _resttime, dailyWorkEvent);
            }}
            disabled={isHoliday || isNenkyu}
          />
        </div>
      </td>
      {/* 休憩時間 */}
      <td>
        <InputGroup
          type="time"
          onChange={(e) => {
            const _resttime = e.currentTarget.value;
            updateDb(day, starttime, endtime, _resttime, dailyWorkEvent);
          }}
          value={resttime}
          disabled={isHoliday || isNenkyu || starttime === "" || endtime === ""}
        />
      </td>
      {/* 健康管理時間 */}
      <td style={{ display: "flex" }}>
        {healthtimePlus ? (
          <Plus size={10} style={{ margin: "auto 4px auto 0" }} />
        ) : (
          <Minus size={10} style={{ margin: "auto 4px auto 0" }} />
        )}
        <InputGroup
          type="time"
          value={healthtime}
          disabled={isHoliday || isNenkyu || starttime === "" || endtime === ""}
          readOnly
        />
      </td>
      {/* 承認依頼処理 */}
      <td>
        <Switch
          checked={approvalProcess !== APPROVAL_PROCESS.KARI}
          onChange={() =>
            db.daywork.update(day, {
              approvalProcess:
                approvalProcess === APPROVAL_PROCESS.KARI
                  ? APPROVAL_PROCESS.SHOUNINN
                  : APPROVAL_PROCESS.KARI,
            })
          }
          disabled={isHoliday}
          innerLabelChecked="承認依頼"
          innerLabel="仮入力"
          large
        />
      </td>
      {/* アクションボタン */}
      <td>
        <Button
          icon={<ManuallyEnteredData />}
          onClick={() => reflect(idx)}
          title="reflect only this day"
          disabled={actionDisabled}
        />
        <Button
          icon={<Reset />}
          onClick={() => updateDb(day, "", "", "00:00", dailyWorkEvent)}
          title="reset only this day"
          disabled={actionDisabled}
        />
      </td>
    </tr>
  );
};

export default WorkTableLine;
