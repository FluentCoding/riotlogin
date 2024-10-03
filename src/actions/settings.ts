import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";

const settingsActions = {
  autostart: async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      console.info("Registering autostart...");
      await enable();
    } else {
      console.info("Unregistering autostart...");
      await disable();
    }

    return (await isEnabled()) === enabled;
  },
};

export default settingsActions;
