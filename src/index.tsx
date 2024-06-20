import React, { useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Cog, ManuallyEnteredData, Reset } from "@blueprintjs/icons";
import { createRoot } from "react-dom/client";

import SettingModal from "./SettingModal";
import WorkTable from "./WorkTable";
import { resetdb } from "./db";
import { reflectMulti } from "./reflect";

import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/normalize.css";
import styles from "./index.module.scss";

const App: React.FC = () => {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const handleClickReflectMulti = () => {
    const idxs = Array.from(document.querySelectorAll(".valid_day")).map(
      // @ts-expect-error
      (elm) => parseInt(elm.dataset.index),
    );
    reflectMulti(idxs);
  };

  return (
    <div className={styles.container}>
      <div className={styles.center}>
        <SettingModal
          isOpen={isSettingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
        <div className={styles.buttons}>
          <Button
            onClick={handleClickReflectMulti}
            intent={Intent.PRIMARY}
            icon={<ManuallyEnteredData />}
          >
            全ての有効なデータをExtimeに反映する
          </Button>
          <Button onClick={resetdb} icon={<Reset />}>
            全てクリアする
          </Button>
          <Button
            icon={<Cog />}
            text="設定"
            onClick={() => setSettingsOpen(true)}
          />
        </div>
        <br />
        <div className={styles.worktable}>
          <WorkTable />
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("contents")!);
root.render(<App />);
