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
  const stronghold = await Stronghold.load(
    `${await appDataDir()}/vault.hold`,
    master
  );
  let client: Client;
  const clientName = "riotaccountmanager";
  try {
    client = await stronghold.loadClient(clientName);
  } catch {
    client = await stronghold.createClient(clientName);
  }
  const store = client.getStore();

  return {
    async addPassword(userUuid, password) {
      await store.insert(
        userUuid,
        Array.from(new TextEncoder().encode(password))
      );
      await stronghold.save();
      return true;
    },
    async removePassword(userUuid) {
      await store.remove(userUuid);
      await stronghold.save();
      return true;
    },
    async getPassword(userUuid) {
      const data = await store.get(userUuid);
      if (!data) return undefined;
      return new TextDecoder().decode(new Uint8Array(data));
    },
    async reset() {
      await stronghold.unload();
      await remove(vaultPath);
      return true;
    },
  };
};
