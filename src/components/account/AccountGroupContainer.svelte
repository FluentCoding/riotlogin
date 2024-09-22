<script lang="ts">
  import { accountGroupActions } from "../../actions/accounts";
  import persistent from "../../store/persistent";
  import { editMode } from "../../store/app";
  import AccountGroup from "./AccountGroup.svelte";
  import DashedNewButton from "../util/DashedNewButton.svelte";
  import { onMount } from "svelte";
  import Sortable from "sortablejs";

  const accounts = persistent.accounts;

  onMount(() => {
    const el = document.getElementById("account-groups-list");
    const sortable = Sortable.create(el!, {
      handle: ".header",
      forceFallback: true,
      animation: 150,
      disabled: true,
      onEnd(e) {
        console.info(e);
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
  <div id="account-groups-list">
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
    #account-groups-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
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
