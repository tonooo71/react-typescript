interface Window {
  chrome: {
    webview: {
      postMessage: (data: string) => void;
    };
  };
}

declare module "*.scss";
