import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { AppError } from "../types/app";

const settingsActions = {
  autostart: async (enabled: boolean) => {
    if (enabled) {
      console.info("Registering autostart...");
      await enable();
    } else {
      console.info("Unregistering autostart...");
      await disable();
    }

    if ((await isEnabled()) !== enabled) {
      throw new AppError("Failed to toggle autostart");
    }
  },
};

export default settingsActions;
