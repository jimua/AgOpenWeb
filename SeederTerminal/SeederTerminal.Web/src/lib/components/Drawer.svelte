<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { currentPage } from '../remote/session'
  import type { PageType } from '../remote/types'

  let isOpen = $state(false)

  function navigate(page: PageType) {
    currentPage.set(page)
    isOpen = false
  }

  function toggle() {
    isOpen = !isOpen
  }
</script>

{#if isOpen}
  <button type="button" class="backdrop" onclick={() => (isOpen = false)} aria-label="Close menu"></button>
{/if}

<aside class="drawer" class:open={isOpen}>
  <div class="panel">
    <div class="drawer-header">
      <div class="drawer-title">{$_('app.title')}</div>
    </div>

    <nav class="nav-list">
      <button
        class="nav-item"
        class:active={$currentPage === 'program'}
        onclick={() => navigate('program')}
      >
        <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>{$_('nav.program')}</span>
      </button>

      <button
        class="nav-item"
        class:active={$currentPage === 'vehicle'}
        onclick={() => navigate('vehicle')}
      >
        <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 17h10M7 7h10M12 7v10" />
        </svg>
        <span>{$_('nav.vehicle')}</span>
      </button>

      <button
        class="nav-item"
        class:active={$currentPage === 'field'}
        onclick={() => navigate('field')}
      >
        <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
        <span>{$_('nav.field')}</span>
      </button>
    </nav>
  </div>

  <button
    class="handle"
    onclick={toggle}
    aria-label="Toggle menu"
    title={isOpen ? 'Close menu' : 'Open menu'}
  >
    <div class="handle-bar"></div>
    <span class="handle-icon">{isOpen ? '‹' : '›'}</span>
  </button>
</aside>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 25;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
  }
  .drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    display: flex;
    pointer-events: none;
    transform: translateX(-250px);
    transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .drawer.open {
    transform: translateX(0);
  }
  .drawer > * {
    pointer-events: auto;
  }
  .panel {
    width: 250px;
    height: 100%;
    background: #0f1826;
    border-right: 1px solid var(--panel-border);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    padding-top: calc(10px + var(--safe-t));
    padding-bottom: calc(10px + var(--safe-b));
    box-sizing: border-box;
  }
  .drawer-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .drawer-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.02em;
  }
  .nav-list {
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    gap: 6px;
  }
  .nav-item {
    height: 56px;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: var(--text);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-color 0.15s;
  }
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  .nav-item.active {
    background: #1b324f;
    border-color: var(--accent);
    color: #ffffff;
  }
  .icon {
    flex-shrink: 0;
    color: var(--accent);
  }
  .handle {
    width: 30px;
    height: 90px;
    align-self: center;
    background: #142234;
    border: 1px solid var(--panel-border);
    border-left: none;
    border-radius: 0 12px 12px 0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.35);
    padding: 0;
  }
  .handle:hover {
    background: #1c3048;
  }
  .handle-bar {
    width: 4px;
    height: 24px;
    background: var(--panel-border);
    border-radius: 2px;
    margin-bottom: 2px;
  }
  .handle-icon {
    font-size: 20px;
    line-height: 1;
    font-weight: 700;
    color: var(--text-muted);
  }
</style>
