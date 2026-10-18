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
    <svg
      class="back-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
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
    height: 40px;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    color: var(--text);
    padding: 0 14px 0 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--accent);
    color: #ffffff;
  }
  .back-icon {
    display: block;
    flex-shrink: 0;
    color: var(--accent);
    transition: transform 0.15s ease;
  }
  .back-btn:hover .back-icon {
    transform: translateX(-2px);
  }
  .back-text {
    line-height: 1;
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
