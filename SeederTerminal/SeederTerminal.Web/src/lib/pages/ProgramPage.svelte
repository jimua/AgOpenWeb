<script lang="ts">
  import { _, locale } from 'svelte-i18n'
  import { setLanguage } from '../i18n'
  import PageHeader from '../components/PageHeader.svelte'

  let currentLocale = $derived($locale)
</script>

<div class="page">
  <PageHeader title={$_('nav.program')} />

  <main class="page-content">
    <section class="card">
      <h3 class="card-title">{$_('language')}</h3>
      <p class="card-desc">{$_('program.languageDesc')}</p>

      <div class="lang-grid">
        <button
          class="lang-btn"
          class:active={currentLocale?.startsWith('en')}
          onclick={() => setLanguage('en')}
        >
          <span class="lang-flag">🇬🇧</span>
          <span class="lang-name">English</span>
          <span class="lang-code">EN</span>
        </button>

        <button
          class="lang-btn"
          class:active={currentLocale?.startsWith('uk')}
          onclick={() => setLanguage('uk')}
        >
          <span class="lang-flag">🇺🇦</span>
          <span class="lang-name">Українська</span>
          <span class="lang-code">UK</span>
        </button>
      </div>
    </section>
  </main>
</div>

<style>
  .page {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--bg);
    color: var(--text);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .page-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
  .card {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .card-title {
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 700;
  }
  .card-desc {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--text-muted);
  }
  .lang-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
  .lang-btn {
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: #142234;
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .lang-btn:hover {
    background: #1c3048;
  }
  .lang-btn.active {
    background: #1f3d63;
    border-color: var(--accent);
    box-shadow: 0 0 12px rgba(61, 143, 212, 0.3);
  }
  .lang-flag {
    font-size: 24px;
  }
  .lang-name {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
    text-align: left;
  }
  .lang-code {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
  }
</style>
