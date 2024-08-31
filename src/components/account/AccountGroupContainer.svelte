<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { accountGroupActions } from "../../actions/accounts/edit";
  import persistent from "../../store/persistent";
  import { editMode } from "../../store/ui";
  import Icon from "../util/Icon.svelte";
  import AccountGroup from "./AccountGroup.svelte";

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
    <div class="add-new" on:click={accountGroupActions.create}>
      <div class="icon"><Icon name="plus" /></div>
      Create account group
    </div>
  {/if}
</div>

<style lang="scss">
  .account-groups {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;

    .add-new {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      min-height: 40px;
      outline: 2px solid white;
      outline-style: dashed;
      margin: 2px;
      opacity: 0.8;

      font-size: 13px;

      cursor: pointer;
      transition: background-color 0.2s;

      .icon {
        filter: invert(100%);
        display: flex; // idk why but this actually centers the icon xd (inline-block doesn't)
      }

      &:hover {
        background-color: #323232;
      }
    }
  }
</style>
