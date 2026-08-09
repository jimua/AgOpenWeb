<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { zoomIn, zoomOut, cycleCameraMode, northUp } from '../map/camera'
</script>

<div class="stack">
  <button title={$_('zoomIn')} onclick={zoomIn}>+</button>
  <button title={$_('zoomOut')} onclick={zoomOut}>−</button>
  <button class="cam" class:north={$northUp} title={$_('camera')} onclick={cycleCameraMode}>
    {$northUp ? 'N' : 'H'}
  </button>
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  button {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    border: 1px solid #4e739a;
    background: #20344d;
    color: #e6f1ff;
    font-size: 22px;
    font-weight: 700;
  }
  button.cam {
    border-radius: 999px;
    background: #4a90d9;
    font-size: 16px;
  }
  button.cam.north {
    background: #3ecf7a;
  }
</style>
