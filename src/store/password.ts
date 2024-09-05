import { appDataDir } from "@tauri-apps/api/path";
import persistent from "./persistent";
import { Client, Stronghold } from "@tauri-apps/plugin-stronghold";
import { remove } from "@tauri-apps/plugin-fs";

interface PasswordStore {
  addPassword(userUuid: string, password: string): Promise<boolean>;
  removePassword(userUuid: string): Promise<boolean>;
  getPassword(userUuid: string): Promise<string | undefined>;
  reset(): Promise<boolean>;
}

export const rawPasswordStore: PasswordStore = {
  async addPassword(userUuid, password) {
    const current = persistent.rawPasswords.get();
    current.entries[userUuid] = password;
    persistent.rawPasswords.set(current);
    return true;
  },
  async removePassword(userUuid) {
    const current = persistent.rawPasswords.get();
    delete current.entries[userUuid];
    persistent.rawPasswords.set(current);
    return true;
  },
  async getPassword(userUuid) {
    return persistent.rawPasswords.get().entries[userUuid];
  },
  async reset() {
    persistent.rawPasswords.set({
      ...persistent.rawPasswords.get(),
      entries: {},
    });
    return true;
  },
};

export const securedPasswordStore = async (
  master: string
): Promise<PasswordStore> => {
  const vaultPath = `${await appDataDir()}/vault.hold`;
  let _instance: [Stronghold, Client] | undefined;

  const instance = async () => {
    if (!_instance) {
      const stronghold = await Stronghold.load(vaultPath, master);
      const clientName = "riotaccountmanager";
      try {
        return (_instance = [
          stronghold,
          await stronghold.loadClient(clientName),
        ]);
      } catch {
        return (_instance = [
          stronghold,
          await stronghold.createClient(clientName),
        ]);
      }
    }
    return _instance;
  };

  return {
    async addPassword(userUuid, password) {
      const [stronghold, client] = await instance();
      await client
        .getStore()
        .insert(userUuid, Array.from(new TextEncoder().encode(password)));
      await stronghold.save();
      return true;
    },
    async removePassword(userUuid) {
      const [stronghold, client] = await instance();
      await client.getStore().remove(userUuid);
      await stronghold.save();
      return true;
    },
    async getPassword(userUuid) {
      const [_, client] = await instance();
      const data = await client.getStore().get(userUuid);
      if (!data) return undefined;
      return new TextDecoder().decode(new Uint8Array(data));
    },
    async reset() {
      const [stronghold] = await instance();
      await stronghold.unload();
      await remove(vaultPath);
      _instance = undefined;
      return true;
    },
  };
};
