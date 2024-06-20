interface Window {
  chrome: {
    webview: {
      postMessage: (data: string) => void;
    };
  };
}

declare module "*.scss";

type StringTime = string; // HH:MM or ""(empty)
