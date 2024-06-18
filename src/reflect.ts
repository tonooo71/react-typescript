import { DAILY_WORK_EVENT, WorkData, db } from "./db";

type MessageDataType = {
  day: string;
  starttime: string;
  endtime: string;
  healthtime: string;
  dailyWorkEvent: string;
  approvalProcess: string;
};

const getOneDayMessageData = (workData: WorkData) => {
  const {
    day,
    starttime,
    endtime,
    healthtime,
    healthtimePlus,
    dailyWorkEvent,
    approvalProcess,
  } = workData;

  const oneDayMessageData: MessageDataType = {
    day: day.toString(),
    starttime: `${new Date(starttime).getHours()}:${new Date(starttime)
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
    endtime: `${new Date(endtime).getHours()}:${new Date(endtime)
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
    healthtime: `${healthtimePlus ? "" : "-"}${new Date(
      healthtime,
    ).getHours()}:${new Date(healthtime)
      .getMinutes()
      .toString()
      .padStart(2, "0")}`,
    dailyWorkEvent,
    approvalProcess,
  };

  return oneDayMessageData;
};

export const reflect = async (idx: number) => {
  const workData = await db.daywork.get(idx + 1);

  if (workData === undefined) {
    console.error("No data.");
    return;
  }

  const messageData = getOneDayMessageData(workData);

  if (
    workData.dailyWorkEvent !== DAILY_WORK_EVENT.NENKYU &&
    (messageData.starttime === "0:00" || messageData.endtime === "0:00")
  ) {
    console.error("May be invalid data.");
    return;
  }

  const data = [messageData];

  console.log(data);
  window.chrome.webview.postMessage(JSON.stringify(data));
};

export const reflectMulti = async (idxs: number[]) => {
  const allWorkData = await db.daywork.toArray();

  if (allWorkData === undefined) {
    console.error("No data.");
    return;
  }

  const data = idxs
    .map((idx) => getOneDayMessageData(allWorkData[idx]))
    .filter(
      ({ starttime, endtime, dailyWorkEvent }) =>
        !(
          dailyWorkEvent !== DAILY_WORK_EVENT.NENKYU &&
          (starttime === "0:00" || endtime === "0:00")
        ),
    );

  console.log(data);
  window.chrome.webview.postMessage(JSON.stringify(data));
};
