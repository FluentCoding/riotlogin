<script lang="ts">
  export let title: string;
</script>

<div class="group">
  <div class="header">{title}</div>
  <div class="settings"><slot /></div>
</div>

<style lang="scss">
  .group {
    background-color: rgba(24, 24, 24, 0.8);
    padding: 10px 12px;
    border-radius: 16px;

    .header {
      display: flex;
      justify-content: space-between;
      gap: 4px;

      margin-left: 4px;
      font-size: 14px;
      font-weight: 500;

      color: #d5d5d5;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .settings {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
