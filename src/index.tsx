import "./reset.css";
import { css } from "@linaria/core";
import React from "react";
import { createRoot } from "react-dom/client";

const App: React.FC = () => {
  return (
    <div className={app}>
      <div className={container}>
        <h1>This is React TypeScript Template</h1>
        <img src="static/react-typescript.png" width={400} className={img} />
        <span>This template depends on the following:</span>
        <ul>
          <li>React v18</li>
          <li>TypeScript</li>
          <li>linaria</li>
          <li>ESLint</li>
          <li>Prettier</li>
          <li>Yarn v3</li>
        </ul>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("contents")!);
root.render(<App />);

const app = css`
  display: flex;
  height: 100vh;
  width: 100vw;
`;

const container = css`
  margin: auto;
`;

const img = css`
  margin: 0 auto;
`;
