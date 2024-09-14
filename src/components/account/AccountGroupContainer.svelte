<script lang="ts">
  import { onMount } from "svelte";
  import { accountGroupActions } from "../../actions/accounts";
  import persistent from "../../store/persistent";
  import { editMode } from "../../store/app";
  import AccountGroup from "./AccountGroup.svelte";
  import DashedNewButton from "../util/DashedNewButton.svelte";

  const accounts = persistent.accounts;

  onMount(() => {
    return accounts.subscribe(() => {
      setTimeout(() => {
        const container = document.getElementById("account-groups");
        container?.scrollTo(0, container.scrollHeight);
      }, 0);
    });
  });
</script>

<div class="account-groups" id="account-groups">
  {#each $accounts.groups as group (group.uuid)}
    <AccountGroup data={group} />
  {/each}
  {#if $editMode}
    <DashedNewButton click={accountGroupActions.create}
      >Create account group</DashedNewButton
    >
  {/if}
</div>

<style lang="scss">
  .account-groups {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }
</style>
