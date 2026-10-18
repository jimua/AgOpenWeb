<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { currentPage } from '../remote/session'

  let { title }: { title: string } = $props()

  function goBack() {
    currentPage.set('main')
  }
</script>

<header class="page-header">
  <button class="back-btn" onclick={goBack} aria-label={$_('back')}>
    <span class="back-arrow">‹</span>
    <span class="back-text">{$_('back')}</span>
  </button>
  <h2 class="page-title">{title}</h2>
  <div class="right-slot"></div>
</header>

<style>
  .page-header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: #0f1826;
    border-bottom: 1px solid var(--panel-border);
    flex-shrink: 0;
  }
  .back-btn {
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text);
    padding: 0 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  .back-arrow {
    font-size: 24px;
    line-height: 1;
    color: var(--accent);
  }
  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }
  .right-slot {
    width: 80px;
  }
</style>
