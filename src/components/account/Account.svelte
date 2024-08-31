<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import type { Account } from "./account";
  import Icon from "../util/Icon.svelte";
  import { activeDropdown } from "../../store/ui";

  export let data: Account;

  const login = async () => {
    await invoke("login", { username: "FluentCoding", password: "TEST" });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events svelte-ignore a11y-no-static-element-interactions -->
<div class="container" on:click={login}>
  <img alt="platinum" src={`ranks/${data.rank.rank}.png`} class="rank-icon" />
  <div class="info">
    <span class="name">{data.name}</span>
    {#if data.rank !== undefined}
      <span class="rank">
        {data.rank.rank.charAt(0).toUpperCase()}{data.rank.rank.slice(1)}
        {data.rank.division ?? ""}
        {data.rank.lp}LP
      </span>
    {/if}
  </div>
  <div
    class="dropdown"
    on:click={(e) => {
      e.stopPropagation();
      activeDropdown.set({
        target: e.currentTarget,
        items: [
          {
            icon: "thirdparty/opgg.png",
            label: "OP.GG",
            link: "https://www.op.gg/summoners/euw/FluentCoding-000",
          },
          {
            icon: "thirdparty/ugg.jpeg",
            label: "U.GG",
            link: "https://u.gg/lol/profile/euw1/FluentCoding-000",
          },
          {
            icon: "thirdparty/log.jpg",
            label: "LeagueOfGraphs",
            link: "https://www.leagueofgraphs.com/summoner/euw/FluentCoding-000",
          },
        ],
      });
    }}
  >
    <div class="icon">
      <Icon name="three_dots" height="100%" width="100%" />
    </div>
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

    cursor: pointer;

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

    .dropdown {
      margin-left: auto;
      padding: 12px;
      height: 18px;
      width: 18px;
      border-radius: 50%;

      .icon {
        height: 100%;
        filter: invert(100%);
        opacity: 0.8;
      }

      &:hover {
        background-color: #242424;
      }
    }

    &:hover:not(:has(.dropdown:hover)):not(:has(.modal:hover)) {
      outline: 2px solid #0088ff;
      background-color: #242424;
    }
  }
</style>
