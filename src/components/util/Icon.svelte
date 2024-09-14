<script lang="ts">
  import { icons, type Icons } from "./icon";

  export let name: Icons;
  export let color = "black";
  export let width = "1rem";
  export let height = "1rem";
  export let focusable: string | number | null | undefined = undefined;
  let displayIcon = icons[name];
</script>

<svg
  class={$$props.class}
  style="color: {color};"
  {focusable}
  {width}
  {height}
  viewBox="0 0 {displayIcon.box} {displayIcon.box}">{@html displayIcon.svg}</svg
>
