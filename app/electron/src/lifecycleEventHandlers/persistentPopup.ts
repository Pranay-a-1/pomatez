import { BrowserWindow, ipcMain } from "electron";
import path from "path";
import {
  SHOW_PERSISTENT_POPUP,
  HIDE_PERSISTENT_POPUP,
  UPDATE_POPUP_TIME,
} from "@pomatez/shareables";
import { getIcon } from "../helpers";
import store from "../store";

let popupWindow: BrowserWindow | null = null;

const createPopupWindow = () => {
  if (popupWindow) return;

  popupWindow = new BrowserWindow({
    width: 300,
    height: 180,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false, // Frameless for custom look
    skipTaskbar: false, // We want it to be visible
    alwaysOnTop: true,
    show: false,
    icon: getIcon(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple script requirement
    },
  });

  popupWindow.loadFile(path.join(__dirname, "../assets/popup.html"));

  popupWindow.on("closed", () => {
    popupWindow = null;
  });

  // Keep it always on top even if other windows try to take focus
  popupWindow.setAlwaysOnTop(true, "screen-saver");
  popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
};

export const registerPersistentPopupEvents = () => {
  ipcMain.on(SHOW_PERSISTENT_POPUP, () => {
    if (!popupWindow) {
      createPopupWindow();
    }

    // Ensure it's on top and visible
    popupWindow?.setAlwaysOnTop(true, "screen-saver");
    popupWindow?.show();
    popupWindow?.focus();
  });

  ipcMain.on(HIDE_PERSISTENT_POPUP, () => {
    if (popupWindow) {
      popupWindow.hide();
    }
  });

  ipcMain.on(UPDATE_POPUP_TIME, (event, data) => {
    if (popupWindow && !popupWindow.isDestroyed() && popupWindow.isVisible()) {
      const isDarkMode = store.safeGet("isDarkMode");
      popupWindow.webContents.send(UPDATE_POPUP_TIME, {
        ...data,
        theme: isDarkMode ? "dark" : "light",
      });
    }
  });
};
