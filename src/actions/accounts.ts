import persistent from "../store/persistent";
import { passwordStore } from "../store/app";
import { v4 } from "uuid";
import toast from "svelte-french-toast";
import { invoke } from "@tauri-apps/api/core";
import {
  showCommonModal,
  showModal,
  type ModalType,
} from "../components/overlay/modal";
import pullAction from "./ranks";
import type { RiotRegion } from "../components/util/riot";

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
      placeholder: "Name#Region",
      tooltip: "Riot ID to see your in-game rank",
      trim: true,
    },
    {
      type: "select",
      label: "Region",
      id: "region",
      default: "na",
      values: [
        ["na", "[NA] North America"],
        ["me", "[ME] Middle East"],
        ["euw", "[EUW] Europe West"],
        ["eune", "[EUNE] Europe Nordic East"],
        ["oce", "[OCE] Oceania"],
        ["kr", "[KR] Korea"],
        ["jp", "[JP] Japan"],
        ["br", "[BR] Brazil"],
        ["las", "[LAS] Latin America South"],
        ["lan", "[LAN] Latin America North"],
        ["ru", "[RU] Russia"],
        ["tr", "[TR] Türkiye"],
        ["sg", "[SG] Singapore"],
        ["ph", "[PH] Philippines"],
        ["tw", "[TW] Taiwan"],
        ["vn", "[VN] Vietnam"],
        ["th", "[TH] Thailand"],
      ] satisfies [RiotRegion, string][],
    },
  ],
} as const satisfies Omit<ModalType, "title" | "actions">;

export const accountGroupActions = {
  sort: (uuid: string, newIndex: number) => {
    const currentAccounts = persistent.accounts.get();
    const group = currentAccounts.groups.find((group) => group.uuid === uuid);
    if (!group) return; // smth went wrong
    currentAccounts.groups = currentAccounts.groups.filter((e) => e !== group);
    currentAccounts.groups = [
      ...currentAccounts.groups.slice(0, newIndex),
      group,
      ...currentAccounts.groups.slice(newIndex),
    ];
    return persistent.accounts.set(currentAccounts);
  },
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
    if (!(await showCommonModal("confirmDelete"))) return;

    const currentAccounts = persistent.accounts.get();
    const removedGroup = currentAccounts.groups.find(
      (group) => group.uuid === uuid
    );
    if (!removedGroup) return;

    await Promise.all(
      removedGroup.accounts.map((account) =>
        passwordStore.removePassword(account.uuid)
      )
    );
    persistent.accounts.set({
      ...currentAccounts,
      groups: currentAccounts.groups.filter((group) => group !== removedGroup),
    });
  },
};

export const accountActions = {
  sort: (entries: {
    old: { index: number; group: string };
    new: { index: number; group: string };
  }) => {
    const currentAccounts = persistent.accounts.get();
    const oldGroup = currentAccounts.groups.find(
      (group) => group.uuid === entries.old.group
    );
    const newGroup = currentAccounts.groups.find(
      (group) => group.uuid === entries.new.group
    );
    if (!oldGroup || !newGroup) return; // smth went wrong
    const toMove = oldGroup.accounts[entries.old.index];
    if (!toMove) return;
    oldGroup.accounts = oldGroup.accounts.filter((acc) => acc !== toMove);
    newGroup.accounts = [
      ...newGroup.accounts.slice(0, entries.new.index),
      toMove,
      ...newGroup.accounts.slice(entries.new.index),
    ];
    return persistent.accounts.set(currentAccounts);
  },
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
      region: result.fields.region as RiotRegion,
    });
    persistent.accounts.set(currentAccounts);
    if (result.fields.riotId) {
      pullAction.action(); // schedule pull action
    }
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
                region: existingAccount.region,
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
                region: result.fields.region as RiotRegion,
              }
            : account
        ),
      })),
    });
    // remove from cache and trigger update when region or riot id changes
    if (
      result.fields.region !== existingAccount.region ||
      (result.fields.riotId && result.fields.riotId !== existingAccount.riotId)
    ) {
      pullAction.mutex
        .runExclusive(async () => {
          const oldCache = persistent.ranksCache.get();
          await persistent.ranksCache.set({
            ...oldCache,
            entries: Object.fromEntries(
              // remove deleted accounts
              Object.entries(oldCache.entries).filter(
                (entry) => entry[0] !== uuid
              )
            ),
          });
        })
        .then(() => pullAction.action()); // schedule pull action
    }
  },
  delete: async (uuid: string) => {
    if (!(await showCommonModal("confirmDelete"))) return;

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
