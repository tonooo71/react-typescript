import React, { useEffect } from "react";

import { HTMLTable } from "@blueprintjs/core";
import { useLiveQuery } from "dexie-react-hooks";

import WorkTableLine from "./WorkTableLine";
import { db } from "./db";
import { useHoliday } from "./useHoliday";

import styles from "./WorkTable.module.scss";

const WorkTable: React.FC = () => {
  const allRestData = useLiveQuery(() => db.rest.toArray());
  const allWorkData = useLiveQuery(() => db.daywork.toArray());

  useEffect(() => {
    const elm = document.getElementById(`day${now.getDate()}`);
    elm?.scrollIntoView(false);
  }, []);

  const now = new Date();
  // 2023-01 -> 31
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  const holidays = useHoliday(year, month);

  if (allWorkData === undefined || allRestData === undefined) return null;

  return (
    <HTMLTable bordered compact>
      <thead>
        <tr className={styles.header}>
          <th></th>
          <th>日</th>
          <th>勤務事象</th>
          <th>始業時刻</th>
          <th>終業時刻</th>
          <th>休憩時間</th>
          <th>健康管理時間</th>
          <th>承認依頼処理</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {allWorkData.slice(0, endDate).map((workData, idx) => (
          <WorkTableLine
            key={idx}
            idx={idx}
            now={now}
            workData={workData}
            allRestData={allRestData}
            holidays={holidays}
          />
        ))}
      </tbody>
    </HTMLTable>
  );
};

export default WorkTable;
