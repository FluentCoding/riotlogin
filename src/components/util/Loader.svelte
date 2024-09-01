<script lang="ts">
  export let size: number;
  export let color: string;
  export let width: number;
  export let fullRotationInSeconds: number;
</script>

<span
  class="loader"
  style="width: {size}px;height: {size}px;border: {width}px solid {color};border-bottom-color: transparent;animation-duration: {fullRotationInSeconds}s;"
></span>

<style>
  .loader {
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
