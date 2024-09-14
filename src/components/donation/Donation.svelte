<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";
</script>

<div class="container">
  Every donation helps me continue maintaining this project and keep it free for
  everyone to use, which I would greatly appreciate:
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
    background-color: #2a2a2a;
    border-radius: 10px;
    padding: 10px;
    color: #d5d5d5;
    font-size: 13px;
    font-weight: 500;
    font-style: italic;

    display: flex;
    flex-direction: column;
    align-items: center;

    .kofi {
      margin-top: 10px;
      img {
        height: 50px;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
</style>
