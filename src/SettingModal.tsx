import React from "react";

import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  H5,
  HTMLTable,
  InputGroup,
  Intent,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import { useLiveQuery } from "dexie-react-hooks";

import { APPROVAL_PROCESS, ApprovalProcessType, db } from "./db";
import { getDiffTime } from "./utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DEFAULT_APPROVAL_PROCESS_SETTING_KEY = "defaultApprovalProcess";

const SettingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const allRestData = useLiveQuery(() => db.rest.toArray());
  const allSetting = useLiveQuery(() => db.setting.toArray());

  if (allRestData === undefined || allSetting === undefined) return null;

  const closeDisabled = allRestData.some(
    (rd) => rd.starttime === "" || rd.endtime === "",
  );

  // approval process setting
  const defaultApprovalProcess =
    allSetting.find(({ key }) => key === DEFAULT_APPROVAL_PROCESS_SETTING_KEY)
      ?.value ?? APPROVAL_PROCESS.KARI;
  const handleChangeDefaultApprovalProcess = async (
    e: React.FormEvent<HTMLInputElement>,
  ) => {
    const approvalProcess = e.currentTarget.value as ApprovalProcessType;
    if (
      (await db.setting.get(DEFAULT_APPROVAL_PROCESS_SETTING_KEY)) !== undefined
    ) {
      db.setting.update(DEFAULT_APPROVAL_PROCESS_SETTING_KEY, {
        value: approvalProcess,
      });
    } else {
      db.setting.add({
        key: DEFAULT_APPROVAL_PROCESS_SETTING_KEY,
        value: approvalProcess,
      });
    }
    db.daywork.bulkUpdate(
      Array(31)
        .fill(0)
        .map((_, idx) => ({
          key: idx + 1,
          changes: {
            approvalProcess,
          },
        })),
    );
  };

  return (
    <Dialog title="設定" isOpen={isOpen} isCloseButtonShown={false}>
      <DialogBody>
        <H5>休憩時間</H5>
        <HTMLTable bordered compact>
          <thead>
            <tr>
              <th></th>
              <th>開始時刻</th>
              <th>終了時刻</th>
              <th>休憩時間</th>
              <th>
                <Button
                  onClick={() =>
                    db.rest.add({ starttime: "12:00", endtime: "13:00" })
                  }
                  text="追加"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {allRestData.map((restData, idx) => {
              const resttime = getDiffTime(
                restData.starttime,
                restData.endtime,
              );
              return (
                <tr key={idx}>
                  <th>{`休憩 ${idx + 1}`}</th>
                  <td>
                    <InputGroup
                      type="time"
                      onChange={(e) =>
                        db.rest.update(restData.id, {
                          starttime: e.currentTarget.value,
                        })
                      }
                      value={restData.starttime}
                      intent={
                        restData.starttime === "" ? Intent.DANGER : undefined
                      }
                    />
                  </td>
                  <td>
                    <InputGroup
                      type="time"
                      onChange={(e) =>
                        db.rest.update(restData.id, {
                          endtime: e.currentTarget.value,
                        })
                      }
                      value={restData.endtime}
                      intent={
                        restData.endtime === "" ? Intent.DANGER : undefined
                      }
                    />
                  </td>
                  <td>
                    <InputGroup
                      type="time"
                      value={resttime}
                      readOnly
                      intent={resttime === "" ? Intent.DANGER : undefined}
                    />
                  </td>
                  <td>
                    <Button
                      onClick={() => db.rest.delete(restData.id)}
                      text="削除"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </HTMLTable>
        <br />
        <H5>デフォルトの承認依頼処理</H5>
        <RadioGroup
          selectedValue={defaultApprovalProcess}
          onChange={handleChangeDefaultApprovalProcess}
          inline
        >
          <Radio label="仮入力" value={APPROVAL_PROCESS.KARI} />
          <Radio label="承認依頼" value={APPROVAL_PROCESS.SHOUNINN} />
        </RadioGroup>
      </DialogBody>
      <DialogFooter
        actions={
          <Button text="Close" onClick={onClose} disabled={closeDisabled} />
        }
      />
    </Dialog>
  );
};

export default SettingModal;
