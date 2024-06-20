import Dexie, { type EntityTable } from "dexie";

const DAILY_WORK_EVENT = {
  WFH: "O1",
  NENKYU: "AA",
  NENKYU_WFH: "CC1",
  WFH_NENKYU: "CC2",
  // SHUCCHO: "OA", // 使わないか?
  // NENKYU_SHUCCHO: "CD1", // 使わないか?
  // SHUCCHO_NENKYU: "CD2", // 使わないか?
  // SHUCCHO_WFH: "OB", // 使わないか?
  // WFH_SHUCCHO: "OC", // 使わないか?
} as const;

type DailyWorkEvent = (typeof DAILY_WORK_EVENT)[keyof typeof DAILY_WORK_EVENT];

const APPROVAL_PROCESS = {
  SHOUNINN: "01",
  KARI: "02",
  // SAKUJO: "03"
};

type ApprovalProcessType =
  (typeof APPROVAL_PROCESS)[keyof typeof APPROVAL_PROCESS];

type WorkData = {
  day: number;
  starttime: StringTime;
  endtime: StringTime;
  resttime: StringTime;
  healthtime: StringTime;
  healthtimePlus: boolean;
  dailyWorkEvent: DailyWorkEvent;
  approvalProcess: ApprovalProcessType;
};

type RestData = {
  id: number;
  starttime: StringTime;
  endtime: StringTime;
};

type Setting = {
  key: string;
  value: string;
};

const db = new Dexie("worktime") as Dexie & {
  daywork: EntityTable<WorkData, "day">;
  rest: EntityTable<RestData, "id">;
  setting: EntityTable<Setting, "key">;
};

db.version(1).stores({
  daywork:
    "day, starttime, endtime, resttime, worktime, healthtime, healthtimePlus, dailyWorkEvent, process",
  rest: "++id, starttime, endtime",
  setting: "key, value",
});

/* Initialized */
const initdaywork = async () => {
  const allWorkData = await db.daywork.toArray();
  if (allWorkData.length === 0) {
    for (let day = 1; day < 32; day++) {
      const workData: WorkData = {
        day,
        starttime: "",
        endtime: "",
        resttime: "00:00",
        healthtime: "00:00",
        healthtimePlus: true,
        dailyWorkEvent: DAILY_WORK_EVENT.WFH,
        approvalProcess: APPROVAL_PROCESS.KARI,
      };
      db.daywork.add(workData);
    }
  }
};
const initrest = async () => {
  const allRestData = await db.rest.toArray();
  if (allRestData.length === 0) {
    await db.rest.add({
      starttime: "12:00",
      endtime: "13:00",
    });
    await db.rest.add({
      starttime: "17:30",
      endtime: "17:45",
    });
    await db.rest.add({
      starttime: "19:00",
      endtime: "19:30",
    });
    await db.rest.add({
      starttime: "20:00",
      endtime: "20:15",
    });
  }
};
await initdaywork();
await initrest();

export {
  type RestData,
  type WorkData,
  type DailyWorkEvent,
  type ApprovalProcessType,
};
export { db, DAILY_WORK_EVENT, APPROVAL_PROCESS };

export const resetdb = async () => {
  await db.daywork.clear();
  await initdaywork();
};
