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
