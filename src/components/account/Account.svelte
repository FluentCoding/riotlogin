<script lang="ts">
  import Icon from "../util/Icon.svelte";
  import { activeDropdown, editMode } from "../../store/app";
  import toast from "svelte-french-toast";
  import type { AccountType } from "../../store/persistent";
  import EditRemoveActions from "./EditRemoveActions.svelte";
  import { accountActions } from "../../actions/accounts";
  import persistent from "../../store/persistent";
  import Loader from "../util/Loader.svelte";
  import pullAction, { fetchRankViewURLs } from "../../actions/ranks";

  export let data: AccountType;

  const login = async () => {
    toast.promise(accountActions.login(data.uuid), {
      loading: "Logging in...",
      success: (e) => e,
      error: (e) => e,
    });
  };

  const ranksCache = persistent.ranksCache;
  const currentlyPulledAccounts = pullAction.store.currentlyPulledAccounts;
  $: isPulled = $currentlyPulledAccounts.includes(data.uuid);
  $: rank = $ranksCache.entries[data.uuid]?.rank;
</script>

<div
  class="account"
  on:click={() => !$editMode && login()}
  class:disable-interactions={$editMode}
>
  {#if rank}
    <img
      alt="{rank.tier.charAt(0).toUpperCase()}{rank.tier.slice(1)}"
      src="ranks/{rank.tier}.png"
      class="rank-icon"
      style={isPulled ? "opacity: 0.5" : undefined}
    />
  {:else if isPulled}
    <div
      class="rank-icon"
      style="display: flex; align-items: center; justify-content: center"
    >
      <Loader size={36} color="gray" width={3} fullRotationInSeconds={2.5} />
    </div>
  {/if}
  <div class="info">
    <span class="name">{data.alias || data.name}</span>
    {#if rank}
      <span class="rank">
        {rank.tier.charAt(0).toUpperCase()}{rank.tier.slice(1)}
        {rank.division ?? ""}
        {rank.lp !== undefined ? `${rank.lp} LP` : ""}
      </span>
    {/if}
  </div>
  <div class="end">
    {#if $editMode}
      <EditRemoveActions
        disabled={isPulled}
        edit={[{ icon: "edit" }, () => accountActions.edit(data.uuid)]}
        remove={[{ icon: "trash" }, () => accountActions.delete(data.uuid)]}
      />
    {:else if data.riotId}
      <div
        class="dropdown"
        on:click={(e) => {
          e.stopPropagation();
          if (!data.riotId || !data.region) return; // shouldn't happen
          activeDropdown.set({
            target: e.currentTarget,
            items: Object.values(fetchRankViewURLs(data.riotId, data.region)),
          });
        }}
      >
        <div class="icon">
          <Icon name="three_dots" color="white" height="100%" width="100%" />
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .account {
    position: relative;
    display: flex;
    align-items: center;
    gap: 20px;

    background-color: #2a2a2a;
    border-radius: 10px;
    padding: 0 10px;
    height: 60px;

    .rank-icon {
      width: 60px;
      height: 60px;

      transition: 0.2s opacity;
    }

    .info {
      display: flex;
      justify-content: center;
      flex-direction: column;
      color: #bdbdbd;
      overflow: hidden;

      .name {
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .rank {
        font-size: 12px;
        font-weight: 500;
        width: 100%;
      }
    }

    .end {
      margin-left: auto;
    }

    .dropdown {
      padding: 12px;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      cursor: pointer;

      .icon {
        height: 100%;
        opacity: 0.8;
      }

      &:hover {
        background-color: #242424;
      }
    }

    &:hover:not(:has(.dropdown:hover)):not(:has(.modal:hover)):not(
        .disable-interactions
      ) {
      outline: 2px solid #0088ff;
      background-color: #242424;
      cursor: pointer;
    }
  }
</style>
