import persistent from "../../store/persistent";
import { showModal } from "../../store/ui";
import { v4 } from "uuid";

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
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.filter((group) => group.uuid !== uuid),
    });
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
    group?.accounts.push({ uuid: v4(), name: result.fields.name });
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
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.map((group) => ({
        ...group,
        accounts: group.accounts.filter((account) => account.uuid !== uuid),
      })),
    });
  },
};
