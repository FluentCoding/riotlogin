<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { accountActions, accountGroupActions } from "../../actions/accounts";
  import type { AccountGroupType } from "../../store/persistent";
  import { editMode } from "../../store/app";
  import DashedNewButton from "../util/DashedNewButton.svelte";
  import Account from "./Account.svelte";
  import { quintOut } from "svelte/easing";
  import EditRemoveActions from "./EditRemoveActions.svelte";

  export let data: AccountGroupType;
</script>

<div
  class="group"
  transition:fly={{
    duration: 200,
    x: -100,
    opacity: 0.5,
    easing: quintOut,
  }}
>
  <div class="header">
    <div class="title">{data.name}</div>
    {#if $editMode}
      <div transition:fade={{ duration: 150 }}>
        <EditRemoveActions
          edit={[
            { label: "Rename" },
            () => accountGroupActions.rename(data.uuid),
          ]}
          remove={() => accountGroupActions.delete(data.uuid)}
        />
      </div>
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
