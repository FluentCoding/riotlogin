import { createMessage, decrypt, encrypt, readMessage } from "openpgp";

type PhantomString<T> = string & { _type: T };
export type EncryptedAccountPassword = PhantomString<"account">;
export type MasterPassword = PhantomString<"master">;

const passwordActions = {
  encrypt: async (
    rawAccountPassword: string,
    masterPassword: MasterPassword
  ) => {
    const message = await createMessage({
      binary: new TextEncoder().encode(rawAccountPassword),
    });
    const encrypted = await encrypt({
      message,
      passwords: [masterPassword],
      format: "binary",
    });
    return btoa(
      String.fromCharCode(...(encrypted as Uint8Array))
    ) as EncryptedAccountPassword;
  },
  decrypt: async (
    accountPassword: EncryptedAccountPassword,
    masterPassword: MasterPassword
  ) => {
    const encryptedMessage = await readMessage({
      binaryMessage: Uint8Array.from(atob(accountPassword), (c) =>
        c.charCodeAt(0)
      ),
    });
    const { data: decrypted } = await decrypt({
      message: encryptedMessage,
      passwords: [masterPassword],
    });
    return decrypted as string;
  },
};

export default passwordActions;
