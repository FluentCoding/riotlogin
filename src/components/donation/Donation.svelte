<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";
</script>

<div class="container">
  <div>
    Every donation helps me continue maintaining this project and keep it free
    for everyone to use, which I would greatly appreciate:
  </div>
  <div
    class="kofi"
    on:click={() => open("https://github.com/tauri-apps/tauri")}
  >
    <img
      alt="kofi"
      src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/64f1a9ddd0246590df69ea06_kofi_short_button_white%402x.png"
    />
  </div>
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
    color: #d5d5d5;
    font-size: 13px;
    font-weight: 500;
    font-style: italic;

    display: flex;
    flex-direction: row;

    div {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .kofi {
      margin-top: 10px;
      img {
        height: 50px;
        opacity: 0.8;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
</style>
