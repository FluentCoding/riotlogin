<script lang="ts">
  import Icon from "../util/Icon.svelte";
  import { activeDropdown, editMode } from "../../store/app";
  import toast from "svelte-french-toast";
  import type { PullPersistentValueType } from "../../store/persistent";
  import GreenRedActions from "./GreenRedActions.svelte";
  import { accountActions } from "../../actions/accounts/edit";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import persistent from "../../store/persistent";
  import Loader from "../util/Loader.svelte";

  export let data: PullPersistentValueType<"accounts">["groups"][0]["accounts"][0];

  const login = async () => {
    toast.promise(accountActions.login(data.uuid), {
      loading: "Logging in...",
      success: (e) => e,
      error: (e) => e,
    });
  };

  const ranksCache = persistent.ranksCache;
  $: rank = $ranksCache.entries[data.uuid];
</script>

<div
  class="container"
  on:click={(e) => !$editMode && login()}
  class:disable-interactions={$editMode}
  transition:fly={{
    duration: 200,
    x: -100,
    opacity: 0.5,
    easing: quintOut,
  }}
>
  {#if rank}
    {#if rank === "pulling"}
      <div
        class="rank-icon"
        style="display: flex; align-items: center; justify-content: center"
      >
        <Loader size={36} color="gray" width={3} fullRotationInSeconds={2.5} />
      </div>
    {:else if rank !== "invalid"}
      <img
        alt={`${rank.rank.charAt(0).toUpperCase()}${rank.rank.slice(1)}`}
        src={`ranks/${rank.rank}.png`}
        class="rank-icon"
      />
    {/if}
  {/if}
  <div class="info">
    <span class="name">{data.alias || data.name}</span>
    {#if typeof rank === "object"}
      <span class="rank">
        {rank.rank.charAt(0).toUpperCase()}{rank.rank.slice(1)}
        {rank.division ?? ""}
        {rank.lp}LP
      </span>
    {/if}
  </div>
  <div class="end">
    {#if $editMode}
      <GreenRedActions
        edit={() => accountActions.edit(data.uuid)}
        remove={() => accountActions.delete(data.uuid)}
      />
    {:else if data.riotId}
      <div
        class="dropdown"
        on:click={(e) => {
          e.stopPropagation();
          if (!data.riotId) return; // shouldn't happen
          const tag = data.riotId.replace("#", "-");
          // TODO change region
          activeDropdown.set({
            target: e.currentTarget,
            items: [
              {
                icon: "thirdparty/opgg.png",
                label: "OP.GG",
                link: `https://www.op.gg/summoners/euw/${tag}`,
              },
              {
                icon: "thirdparty/ugg.jpeg",
                label: "U.GG",
                link: `https://u.gg/lol/profile/euw1/${tag}`,
              },
              {
                icon: "thirdparty/deeplol.png",
                label: "DEEPLOL",
                link: `https://deeplol.gg/summoner/EUW/${tag}`,
              },
              {
                icon: "thirdparty/log.jpg",
                label: "LeagueOfGraphs",
                link: `https://www.leagueofgraphs.com/summoner/euw/${tag}`,
              },
              {
                icon: "thirdparty/poro.png",
                label: "Porofessor Live",
                link: `https://porofessor.gg/live/euw/${tag}`,
              },
            ],
          });
        }}
      >
        <div class="icon">
          <Icon name="three_dots" height="100%" width="100%" />
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
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
        filter: invert(100%);
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
