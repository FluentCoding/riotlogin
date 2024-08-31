<script lang="ts">
  import type { AccountGroup } from "./account";
  import Account from "./Account.svelte";

  export let data: AccountGroup;
</script>

<div class="group">
  <div class="title">{data.name}</div>
  <div class="accounts">
    {#each data.accounts as account}
      <Account data={account}></Account>
    {/each}
  </div>
</div>

<style lang="scss">
  .group {
    background-color: #181818;
    padding: 10px 12px;
    border-radius: 12px;

    .title {
      margin-left: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #d5d5d5;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .accounts {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
