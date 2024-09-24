<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { accountActions, accountGroupActions } from "../../actions/accounts";
  import type { AccountGroupType } from "../../stores/persistent";
  import { editMode } from "../../stores/app";
  import DashedNewButton from "../util/DashedNewButton.svelte";
  import Account from "./Account.svelte";
  import { quintOut } from "svelte/easing";
  import EditRemoveActions from "./EditRemoveActions.svelte";
  import { onMount } from "svelte";
  import Sortable from "sortablejs";

  export let data: AccountGroupType;
  let accountsElement: HTMLElement;

  onMount(() => {
    const sortable = Sortable.create(accountsElement, {
      group: "accounts",
      forceFallback: true,
      animation: 150,
      disabled: true,
      swapThreshold: 6,
      onEnd(e) {
        const oldIndex = e.oldIndex,
          newIndex = e.newIndex,
          oldGroup = e.from.parentElement?.getAttribute("id"),
          newGroup = e.to.parentElement?.getAttribute("id");
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldGroup === null ||
          oldGroup === undefined ||
          newGroup === null ||
          newGroup === undefined
        )
          return; // should never happen

        accountActions.sort({
          old: {
            index: oldIndex,
            group: oldGroup,
          },
          new: {
            index: newIndex,
            group: newGroup,
          },
        });
      },
    });
    const editModeSub = editMode.subscribe((isInEditMode) =>
      sortable.option("disabled", !isInEditMode)
    );

    return () => {
      editModeSub();
      sortable.destroy();
    };
  });
</script>

<div
  class="group"
  id={data.uuid}
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
  <div class="accounts" data-edit={$editMode} bind:this={accountsElement}>
    {#each data.accounts as account (account.uuid)}
      <Account data={account}></Account>
    {/each}
  </div>
  {#if $editMode}
    <div style="margin-top: 15px">
      <DashedNewButton click={() => accountActions.add(data.uuid)}
        >Add account</DashedNewButton
      >
    </div>
  {/if}
</div>

<style lang="scss">
  .group {
    background-color: rgba(24, 24, 24, 0.8);
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
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      &[data-edit="true"] :global(.account) {
        cursor: move;
        cursor: -webkit-grabbing;
      }
    }
  }
</style>
