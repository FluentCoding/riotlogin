<script lang="ts">
  import { accountGroupActions } from "../../actions/accounts/edit";
  import type { PullPersistentValueType } from "../../store/persistent";
  import { editMode } from "../../store/ui";
  import Account from "./Account.svelte";

  export let data: PullPersistentValueType<"accounts">["groups"][0];
</script>

<div class="group">
  <div class="header">
    <div class="title">{data.name}</div>
    {#if $editMode}
      <div class="edit-actions">
        <div
          class="rename"
          on:click={() => accountGroupActions.rename(data.uuid)}
        >
          Rename
        </div>
        <div
          class="delete"
          on:click={() => accountGroupActions.delete(data.uuid)}
        >
          Delete
        </div>
      </div>
    {/if}
  </div>
  <div class="accounts">
    {#each data.accounts as account (account.uuid)}
      <Account data={account}></Account>
    {/each}
    <Account
      data={{ name: "Test", rank: { lp: 1, rank: "diamond" }, uuid: "1" }}
    ></Account>
  </div>
</div>

<style lang="scss">
  .group {
    background-color: #181818;
    padding: 10px 12px;
    border-radius: 12px;

    .header {
      display: flex;
      justify-content: space-between;
      gap: 4px;

      margin-left: 8px;
      font-size: 14px;
      font-weight: 500;
      .title {
        color: #d5d5d5;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .edit-actions {
        display: flex;
        gap: 6px;

        .rename {
          color: lightgreen;
          cursor: pointer;
        }
        .delete {
          color: lightcoral;
          cursor: pointer;
        }
      }
    }

    .accounts {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
