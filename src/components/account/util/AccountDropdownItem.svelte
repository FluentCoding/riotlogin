<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";

  export let img: string;
  export let link: string;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<div
  class="item"
  on:click={(e) => {
    e.stopPropagation();
    open(link);
  }}
>
  <img alt="" src={img} width="16" height="16" />
  <slot />
</div>

<style lang="scss">
  .item {
    padding: 10px;
    pointer-events: auto;
    cursor: pointer;

    &:hover {
      background-color: gray;
    }
  }
</style>
