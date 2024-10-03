<script lang="ts">
  import { accountGroupActions } from "../../actions/accounts";
  import persistent from "../../stores/persistent";
  import { editMode } from "../../stores/app";
  import AccountGroup from "./AccountGroup.svelte";
  import DashedNewButton from "../util/DashedNewButton.svelte";
  import { onMount } from "svelte";
  import Sortable from "sortablejs";

  const accounts = persistent.accounts;
  let accountsGroupsListElement: HTMLElement;

  onMount(() => {
    const sortable = Sortable.create(accountsGroupsListElement!, {
      handle: ".header",
      forceFallback: true,
      animation: 150,
      disabled: true,
      onEnd(e) {
        const newIndex = e.newIndex,
          item = e.item.getAttribute("id");
        if (newIndex === undefined || item === null) return; // should never happen

        accountGroupActions.sort(item, newIndex);
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

<div id="account-groups" data-edit={$editMode}>
  <div id="account-groups-list" bind:this={accountsGroupsListElement}>
    {#each $accounts.groups as group (group.uuid)}
      <AccountGroup data={group} />
    {/each}
  </div>
  {#if $editMode}
    <div class="create-group-container">
      <DashedNewButton click={accountGroupActions.create}
        >Create account group</DashedNewButton
      >
    </div>
  {/if}
</div>

<style lang="scss">
  #account-groups {
    overflow-y: auto;
    padding-right: 8px;
    #account-groups-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .create-group-container {
      margin-top: 10px;
    }

    &[data-edit="true"] :global(.header) {
      cursor: move;
      cursor: -webkit-grabbing;
    }
  }
</style>
