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
    starttime,
    endtime,
    healthtime: `${healthtimePlus ? "" : "-"}${healthtime}`,
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
    (messageData.starttime === "" || messageData.endtime === "")
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
          (starttime === "" || endtime === "")
        ),
    );

  console.log(data);
  window.chrome.webview.postMessage(JSON.stringify(data));
};
