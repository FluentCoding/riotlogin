import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";

export class SettingActionError extends Error {}

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
      throw new SettingActionError("Failed to toggle autostart");
    }
  },
};

export default settingsActions;
