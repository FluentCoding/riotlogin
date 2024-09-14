import persistent from "../../store/persistent";
import { passwordStore, showModal, type ModalType } from "../../store/app";
import { v4 } from "uuid";
import toast from "svelte-french-toast";
import { invoke } from "@tauri-apps/api/core";

const accountModal = {
  fields: [
    {
      type: "text",
      label: "Username",
      id: "name",
      required: true,
    },
    { type: "password", label: "Password", id: "password", required: true },
    { type: "space" },
    {
      type: "text",
      label: "Display Name",
      id: "alias",
      placeholder: "name",
      tooltip: "Name that is being displayed on the front page",
      trim: true,
    },
    {
      type: "text",
      label: "Riot ID",
      id: "riotId",
      placeholder: "NAME#REGION",
      tooltip: "Riot ID to see your in-game rank",
    },
  ],
} as const satisfies Omit<ModalType, "title" | "actions">;

export const accountGroupActions = {
  create: async () => {
    const result = await showModal({
      title: "Create account group",
      fields: [
        { type: "text", label: "Group name", id: "name", required: true },
      ],
      actions: [{ label: "Create", id: "create" }],
    });
    if (!result) return;

    const currentAccounts = persistent.accounts.get();
    currentAccounts.groups.push({
      uuid: v4(),
      name: result.fields.name,
      accounts: [],
    });
    persistent.accounts.set(currentAccounts);
  },
  rename: async (uuid: string) => {
    const currentAccounts = persistent.accounts.get();
    const result = await showModal({
      title: "Rename account group",
      fields: [
        {
          type: "text",
          label: "Group name",
          id: "name",
          default: currentAccounts.groups.find((group) => group.uuid === uuid)
            ?.name,
          required: true,
        },
      ],
      actions: [{ label: "Rename", id: "rename" }],
    });
    if (!result) return;
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.map((group) =>
        group.uuid === uuid ? { ...group, name: result.fields.name } : group
      ),
    });
  },
  delete: async (uuid: string) => {
    const result = await showModal({
      title: "Are you sure?",
      fields: [],
      actions: [
        { label: "Delete", id: "delete" },
        { label: "Cancel", id: "cancel" },
      ],
    });
    if (!result || result.action === "cancel") return;

    const currentAccounts = persistent.accounts.get();
    const removedGroup = currentAccounts.groups.find(
      (group) => group.uuid === uuid
    );
    if (removedGroup) {
      await Promise.all(
        removedGroup.accounts.map((account) =>
          passwordStore.removePassword(account.uuid)
        )
      );
      persistent.accounts.set({
        ...currentAccounts,
        groups: currentAccounts.groups.filter(
          (group) => group !== removedGroup
        ),
      });
    }
  },
};

export const accountActions = {
  add: async (groupUuid: string) => {
    const result = await showModal({
      ...accountModal,
      title: "Add account",
      actions: [{ label: "Add", id: "add" }],
    });
    if (!result) return;

    const currentAccounts = persistent.accounts.get();
    const group = currentAccounts.groups.find(
      (group) => group.uuid === groupUuid
    );

    const userUuid = v4();
    if (!(await passwordStore.addPassword(userUuid, result.fields.password))) {
      toast.error("Couldn't store password :(");
      return;
    }
    group?.accounts.push({
      uuid: userUuid,
      name: result.fields.name,
      alias: result.fields.alias,
      riotId: result.fields.riotId,
    });
    persistent.accounts.set(currentAccounts);
  },
  edit: async (uuid: string) => {
    const currentAccounts = persistent.accounts.get();
    const existingAccount = currentAccounts.groups
      .map((group) => group.accounts)
      .flat()
      .find((account) => account.uuid === uuid);
    if (!existingAccount) return; // something would have to be fucking wrong for this to happen

    const result = await showModal({
      ...accountModal,
      fields: accountModal.fields
        .filter((field) => field.type !== "password")
        .map((field) => {
          if (field.type !== "space") {
            return {
              ...field,
              default: {
                name: existingAccount.name,
                alias: existingAccount.alias,
                riotId: existingAccount.riotId,
              }[field.id],
            };
          }
          return field;
        }),
      actions: [{ label: "Edit", id: "edit" }],
      title: "Edit account",
    });

    if (!result) return;
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.map((group) => ({
        ...group,
        accounts: group.accounts.map((account) =>
          account.uuid === uuid
            ? {
                ...account,
                name: result.fields.name,
                alias: result.fields.alias,
                riotId: result.fields.riotId,
              }
            : account
        ),
      })),
    });
  },
  delete: async (uuid: string) => {
    const result = await showModal({
      title: "Are you sure?",
      fields: [],
      actions: [
        { label: "Delete", id: "delete" },
        { label: "Cancel", id: "cancel" },
      ],
    });
    if (!result || result.action === "cancel") return;

    const currentAccounts = persistent.accounts.get();
    if (!(await passwordStore.removePassword(uuid))) {
      toast.error("Couldn't remove password :(");
    }
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.map((group) => ({
        ...group,
        accounts: group.accounts.filter((account) => account.uuid !== uuid),
      })),
    });
  },
  login: async (uuid: string) => {
    const username = persistent.accounts
      .get()
      .groups.map((group) => group.accounts)
      .flat()
      .find((account) => account.uuid === uuid)?.name;
    const password = await passwordStore.getPassword(uuid);
    return invoke<string>("login", { username, password });
  },
};
