import * as openpgp from "openpgp";
import persistent from "../stores/persistent";
import { ModalCollection } from "../components/overlay/modal";
import { lruMasterPassword } from "../stores/app";
import { AppError } from "../types/app";
import { invoke } from "@tauri-apps/api/core";
import toast from "svelte-french-toast";

type PhantomString<T> = string & { _type: T };
export type EncryptedAccountPassword = PhantomString<"encrypted_account">;
export type EncryptedMasterPassword = PhantomString<"encrypted_master">;
export type MasterPassword = PhantomString<"master">;

namespace PasswordEncryption {
  export namespace Account {
    export async function encrypt(
      rawAccountPassword: string,
      masterPassword: MasterPassword
    ): Promise<EncryptedAccountPassword> {
      const message = await openpgp.createMessage({
        binary: new TextEncoder().encode(rawAccountPassword),
      });
      const encrypted = await openpgp.encrypt({
        message,
        passwords: [masterPassword],
        format: "binary",
      });
      return btoa(
        String.fromCharCode(...(encrypted as Uint8Array))
      ) as EncryptedAccountPassword;
    }
    export async function decrypt(
      accountPassword: EncryptedAccountPassword,
      masterPassword: MasterPassword
    ): Promise<string> {
      const encryptedMessage = await openpgp.readMessage({
        binaryMessage: Uint8Array.from(atob(accountPassword), (c) =>
          c.charCodeAt(0)
        ),
      });
      const { data: decrypted } = await openpgp.decrypt({
        message: encryptedMessage,
        passwords: [masterPassword],
      });
      return decrypted as string;
    }
  }
  export namespace Master {
    export async function encrypt(
      masterPassword: MasterPassword
    ): Promise<EncryptedMasterPassword> {
      return await invoke("argon_hash", {
        password: masterPassword,
      });
    }
    export async function verify(
      masterPassword: MasterPassword
    ): Promise<void> {
      const currentState = persistent.passwords.get();
      if (!("masterPassword" in currentState))
        throw new AppError("No master password exists");

      try {
        await invoke("argon_verify", {
          password: masterPassword,
          hash: currentState.masterPassword,
        });
      } catch {
        throw new AppError("Incorrect master password");
      }
    }
  }
}

export const passwordModalCollection = ModalCollection.of({
  askMasterPassword: {
    title: "Input your master password",
    fields: [
      {
        type: "password",
        label: "Master password",
        id: "master",
        required: true,
      },
    ],
    actions: [{ label: "Submit", id: "submit" }],
  },
});

const passwordActions = {
  entry: (accountId: string) => {
    const pullCurrentState = persistent.passwords.get;
    return {
      get: async () => {
        const currentState = pullCurrentState();

        if ("masterPassword" in currentState) {
          if (!currentState.entries[accountId]) return undefined;

          const master = await passwordActions.establishMasterPassword();
          return await PasswordEncryption.Account.decrypt(
            currentState.entries[accountId],
            master
          );
        } else {
          return currentState.entries[accountId];
        }
      },
      set: async (newPassword: string) => {
        const currentState = pullCurrentState();

        if ("masterPassword" in currentState) {
          const master = await passwordActions.establishMasterPassword();
          const encrypted = await PasswordEncryption.Account.encrypt(
            newPassword,
            master
          );
          currentState.entries[accountId] = encrypted;
          return persistent.passwords.set(currentState);
        } else {
          currentState.entries[accountId] = newPassword;
          return persistent.passwords.set(currentState);
        }
      },
      delete: () => {
        const currentState = pullCurrentState();

        delete currentState.entries[accountId];
        return persistent.passwords.set(currentState);
      },
    };
  },
  migrate: async () => {
    const currentState = persistent.passwords.get();
    if ("masterPassword" in currentState) {
      const rawMasterPassword = await passwordActions.establishMasterPassword();
      // decrypt all passwords and migrate back to raw entries
      persistent.passwords.set({
        version: currentState.version,
        entries: Object.fromEntries(
          await Promise.all(
            Object.entries(currentState.entries).map(async ([k, v]) => {
              return [
                k,
                await PasswordEncryption.Account.decrypt(v, rawMasterPassword),
              ];
            })
          )
        ),
      });

      lruMasterPassword.value = undefined;
    } else {
      // encrypt all passwords
      const rawMasterPassword = await passwordActions.establishMasterPassword(
        true
      );
      persistent.passwords.set({
        ...currentState,
        masterPassword: await PasswordEncryption.Master.encrypt(
          rawMasterPassword
        ),
        entries: Object.fromEntries(
          await Promise.all(
            Object.entries(currentState.entries).map(async ([k, v]) => {
              return [
                k,
                await PasswordEncryption.Account.encrypt(v, rawMasterPassword),
              ];
            })
          )
        ),
      });
    }
  },
  establishMasterPassword: async (create = false) => {
    if (!lruMasterPassword.value) {
      const result = await passwordModalCollection.show("askMasterPassword");

      if (result?.action !== "submit")
        throw new AppError("Master password is required for this operation");

      const inputMasterPassword = result.fields.master as MasterPassword;
      if (!create) {
        // if verify throws error, forward error to establishMasterPassword caller and prevent lruMasterPassword replacement
        await PasswordEncryption.Master.verify(inputMasterPassword);
      }
      lruMasterPassword.value = inputMasterPassword;
    }
    return lruMasterPassword.value!;
  },
  reset: async () => {
    await persistent.passwords.set({ version: 1, entries: {} });
    lruMasterPassword.value = undefined;
    toast.success("Passwords have successfully been reset!");
  },
};

export default passwordActions;
