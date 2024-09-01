<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  export let rename: MouseEventHandler<HTMLDivElement>;
  export let remove: MouseEventHandler<HTMLDivElement>;
</script>

<div class="actions">
  <div
    class="rename"
    on:click={(e) => {
      e.stopPropagation();
      rename(e);
    }}
  >
    Rename
  </div>
  <div
    class="delete"
    on:click={(e) => {
      e.stopPropagation();
      remove(e);
    }}
  >
    Delete
  </div>
</div>

<style lang="scss">
  .actions {
    display: flex;
    gap: 6px;

    .rename {
      color: lightgreen;
      cursor: pointer;
      pointer-events: auto;
    }
    .delete {
      color: lightcoral;
      cursor: pointer;
      pointer-events: auto;
    }
  }
</style>
