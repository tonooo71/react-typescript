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
  starttime: number;
  endtime: number;
  resttime: number;
  healthtime: number;
  healthtimePlus: boolean;
  dailyWorkEvent: DailyWorkEvent;
  approvalProcess: ApprovalProcessType;
};

type RestData = {
  id: number;
  starttime: number;
  endtime: number;
};

const db = new Dexie("worktime") as Dexie & {
  daywork: EntityTable<WorkData, "day">;
  rest: EntityTable<RestData, "id">;
};

db.version(1).stores({
  daywork:
    "day, starttime, endtime, resttime, worktime, healthtime, healthtimePlus, dailyWorkEvent, process",
  rest: "++id, starttime, endtime",
});

/* Initialized */
const initdaywork = async () => {
  const allWorkData = await db.daywork.toArray();
  if (allWorkData.length === 0) {
    for (let day = 1; day < 32; day++) {
      const workData: WorkData = {
        day,
        starttime: new Date(1970, 0, 2).getTime(),
        endtime: new Date(1970, 0, 2).getTime(),
        resttime: new Date(1970, 0, 2).getTime(),
        healthtime: new Date(1970, 0, 2).getTime(),
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
      starttime: new Date(1970, 0, 2, 12, 0).getTime(),
      endtime: new Date(1970, 0, 2, 13, 0).getTime(),
    });
    await db.rest.add({
      starttime: new Date(1970, 0, 2, 17, 30).getTime(),
      endtime: new Date(1970, 0, 2, 17, 45).getTime(),
    });
    await db.rest.add({
      starttime: new Date(1970, 0, 2, 19, 0).getTime(),
      endtime: new Date(1970, 0, 2, 19, 30).getTime(),
    });
    await db.rest.add({
      starttime: new Date(1970, 0, 2, 20, 15).getTime(),
      endtime: new Date(1970, 0, 2, 20, 30).getTime(),
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
