import React from "react";

import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  H3,
  HTMLTable,
} from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import { Minus, Plus } from "@blueprintjs/icons";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "./db";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SettingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const allRestData = useLiveQuery(() => db.rest.toArray());

  if (allRestData === undefined) return null;

  return (
    <Dialog title="設定" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <H3>休憩時間</H3>
        <HTMLTable bordered compact>
          <thead>
            <tr>
              <th></th>
              <th>開始時刻</th>
              <th>終了時刻</th>
              <th>休憩時間</th>
              <th>
                <Button
                  icon={<Plus />}
                  onClick={() =>
                    db.rest.add({
                      starttime: new Date(1970, 0, 2, 12, 0).getTime(),
                      endtime: new Date(1970, 0, 2, 13, 0).getTime(),
                    })
                  }
                  text="追加"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {allRestData.map((restData, idx) => {
              return (
                <tr key={idx}>
                  <th>{`休憩 ${idx + 1}`}</th>
                  <td>
                    <TimePicker
                      selectAllOnFocus
                      value={new Date(restData.starttime)}
                      onChange={(d) =>
                        db.rest.update(restData.id, { starttime: d.getTime() })
                      }
                    />
                  </td>
                  <td>
                    <TimePicker
                      selectAllOnFocus
                      value={new Date(restData.endtime)}
                      onChange={(d) =>
                        db.rest.update(restData.id, { endtime: d.getTime() })
                      }
                    />
                  </td>
                  <td>
                    <TimePicker
                      disabled
                      value={
                        new Date(
                          restData.endtime -
                            restData.starttime -
                            9 * 60 * 60 * 1000,
                        )
                      }
                    />
                  </td>
                  <td>
                    <Button
                      icon={<Minus />}
                      onClick={() => db.rest.delete(restData.id)}
                      text="削除"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </HTMLTable>
      </DialogBody>
      <DialogFooter actions={<Button text="Close" onClick={onClose} />} />
    </Dialog>
  );
};

export default SettingModal;
