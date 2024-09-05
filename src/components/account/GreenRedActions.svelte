<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  export let edit:
    | MouseEventHandler<HTMLDivElement>
    | [string, MouseEventHandler<HTMLDivElement>];
  export let remove:
    | MouseEventHandler<HTMLDivElement>
    | [string, MouseEventHandler<HTMLDivElement>];
</script>

<div class="actions">
  <div
    class="edit"
    on:click={(e) => {
      e.stopPropagation();
      Array.isArray(edit) ? edit[1](e) : edit(e);
    }}
  >
    {#if Array.isArray(edit)}{edit[0]}{:else}Edit{/if}
  </div>
  <div
    class="delete"
    on:click={(e) => {
      e.stopPropagation();
      Array.isArray(remove) ? remove[1](e) : remove(e);
    }}
  >
    {#if Array.isArray(remove)}{remove[0]}{:else}Delete{/if}
  </div>
</div>

<style lang="scss">
  .actions {
    display: flex;
    gap: 6px;

    .edit {
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
