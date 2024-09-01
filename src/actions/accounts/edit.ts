import persistent from "../../store/persistent";
import { passwordStore, showModal } from "../../store/app";
import { v4 } from "uuid";
import toast from "svelte-french-toast";
import { invoke } from "@tauri-apps/api/core";

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
    const currentAccounts = persistent.accounts.get();
    const removedGroup = currentAccounts.groups.find(
      (group) => group.uuid !== uuid
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
      title: "Add account",
      fields: [
        { type: "text", label: "Username", id: "name", required: true },
        { type: "password", label: "Password", id: "password", required: true },
      ],
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
    group?.accounts.push({ uuid: userUuid, name: result.fields.name });
    persistent.accounts.set(currentAccounts);
  },
  rename: async (uuid: string) => {
    const currentAccounts = persistent.accounts.get();
    const result = await showModal({
      title: "Rename account",
      fields: [
        {
          type: "text",
          label: "Name",
          id: "name",
          default: currentAccounts.groups
            .map((group) => group.accounts)
            .flat()
            .find((account) => account.uuid === uuid)?.name,
          required: true,
        },
      ],
      actions: [{ label: "Rename", id: "rename" }],
    });
    if (!result) return;
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.map((group) => ({
        ...group,
        accounts: group.accounts.map((account) =>
          account.uuid === uuid
            ? { ...account, name: result.fields.name }
            : account
        ),
      })),
    });
  },
  delete: async (uuid: string) => {
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
