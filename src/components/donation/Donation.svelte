<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";
</script>

<div class="container">
  <div>
    Every donation helps me continue maintaining this project and keep it free
    for everyone to use, which I would greatly appreciate:
  </div>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <img
    alt="kofi"
    on:click={() => open("https://ko-fi.com/fluentcoding")}
    src="thirdparty/kofi.png"
  />
</div>

<style lang="scss">
  .container {
    background: rgb(42, 42, 42);
    background: linear-gradient(
      63deg,
      rgba(42, 42, 42, 1) 0%,
      rgba(27, 27, 27, 1) 100%
    );
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 8px;
    color: #d5d5d5;
    font-size: 13px;
    font-weight: 500;
    font-style: italic;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 20px;

    div {
      flex: 1;
    }
    img {
      height: 50px;
      opacity: 0.8;
      &:hover {
        cursor: pointer;
      }
    }
  }
</style>
