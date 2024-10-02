<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import Icon from "./Icon.svelte";
  import { fade } from "svelte/transition";

  export let click: MouseEventHandler<HTMLDivElement>;
</script>

<div class="add-new" on:click={click} transition:fade={{ duration: 100 }}>
  <div class="icon"><Icon name="plus" color="white" /></div>
  <slot />
</div>

<style lang="scss">
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
      display: flex; // idk why but this actually centers the icon xd (inline-block doesn't)
    }

    &:hover {
      background-color: #323232;
    }
  }
</style>
