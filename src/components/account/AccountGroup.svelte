<script lang="ts">
  import {
    accountActions,
    accountGroupActions,
  } from "../../actions/accounts/edit";
  import type { PullPersistentValueType } from "../../store/persistent";
  import { editMode } from "../../store/ui";
  import DashedNewButton from "../util/DashedNewButton.svelte";
  import Account from "./Account.svelte";
  import RemoveDeleteActions from "./RemoveDeleteActions.svelte";

  export let data: PullPersistentValueType<"accounts">["groups"][0];
</script>

<div class="group">
  <div class="header">
    <div class="title">{data.name}</div>
    {#if $editMode}
      <RemoveDeleteActions
        rename={() => accountGroupActions.rename(data.uuid)}
        remove={() => accountGroupActions.delete(data.uuid)}
      />
    {/if}
  </div>
  <div class="accounts">
    {#each data.accounts as account (account.uuid)}
      <Account data={account}></Account>
    {/each}
    {#if $editMode}
      <div style="margin-top: 5px">
        <DashedNewButton click={() => accountActions.add(data.uuid)}
          >Add account</DashedNewButton
        >
      </div>
    {/if}
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
    }

    .accounts {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
