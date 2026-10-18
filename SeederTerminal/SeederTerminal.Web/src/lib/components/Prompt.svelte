<script lang="ts">
  import { _ } from 'svelte-i18n'

  export type PromptOption = {
    value: string
    label: string
    sublabel?: string
  }

  export type PromptProps = {
    title: string
    message?: string
    mode?: 'input' | 'select' | 'select-and-input' | 'two-numbers' | 'confirm' | 'coverage-prompt'
    inputValue?: string
    inputLabel?: string
    inputPlaceholder?: string
    num1Value?: number | string
    num1Label?: string
    num2Value?: number | string
    num2Label?: string
    options?: PromptOption[]
    selectedOption?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm?: (data: {
      inputValue: string
      selectedOption: string
      num1: number
      num2: number
      action?: string
    }) => void
    onCancel?: () => void
  }

  let {
    title,
    message,
    mode = 'input',
    inputValue = $bindable(''),
    inputLabel = '',
    inputPlaceholder = '',
    num1Value = $bindable(0),
    num1Label = 'Easting (m)',
    num2Value = $bindable(0),
    num2Label = 'Northing (m)',
    options = [],
    selectedOption = $bindable(''),
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }: PromptProps = $props()

  // Initialize selectedOption if empty
  $effect(() => {
    if (!selectedOption && options.length > 0) {
      selectedOption = options[0].value
    }
  })

  function handleOk() {
    onConfirm?.({
      inputValue,
      selectedOption,
      num1: Number(num1Value) || 0,
      num2: Number(num2Value) || 0,
    })
  }

  function handleAction(action: string) {
    onConfirm?.({
      inputValue,
      selectedOption,
      num1: Number(num1Value) || 0,
      num2: Number(num2Value) || 0,
      action,
    })
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}>
  <div class="dialog" role="dialog" aria-modal="true" tabindex="-1">
    <div class="header">
      <h3>{title}</h3>
      <button class="close-btn" onclick={onCancel} aria-label="Close">✕</button>
    </div>

    <div class="body">
      {#if message}
        <p class="msg">{message}</p>
      {/if}

      {#if mode === 'coverage-prompt'}
        <p class="msg">{$_('field.unsavedCoverageDesc')}</p>
        <div class="btn-group-vertical">
          <button class="action-btn primary" onclick={() => handleAction('save')}>
            {$_('field.saveCoverageJob')}
          </button>
          <button class="action-btn danger" onclick={() => handleAction('discard')}>
            {$_('field.discardCoverage')}
          </button>
          <button class="action-btn secondary" onclick={() => handleAction('cancel')}>
            {$_('cancel')}
          </button>
        </div>
      {:else if mode === 'select' || mode === 'select-and-input'}
        {#if options.length > 0}
          <div class="field-group">
            {#if inputLabel && mode === 'select'}<span class="field-label">{inputLabel}</span>{/if}
            <div class="options-list">
              {#each options as opt (opt.value)}
                <button
                  type="button"
                  class="option-item"
                  class:selected={selectedOption === opt.value}
                  onclick={() => { selectedOption = opt.value }}
                >
                  <div class="opt-label">{opt.label}</div>
                  {#if opt.sublabel}<div class="opt-sub">{opt.sublabel}</div>{/if}
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <p class="empty-hint">{$_('noItemsFound')}</p>
        {/if}

        {#if mode === 'select-and-input'}
          <div class="field-group mt">
            {#if inputLabel}<label class="field-label" for="prompt-select-input">{inputLabel}</label>{/if}
            <input
              id="prompt-select-input"
              type="text"
              class="text-input"
              bind:value={inputValue}
              placeholder={inputPlaceholder}
            />
          </div>
        {/if}
      {:else if mode === 'input'}
        <div class="field-group">
          {#if inputLabel}<label class="field-label" for="prompt-text-input">{inputLabel}</label>{/if}
          <input
            id="prompt-text-input"
            type="text"
            class="text-input"
            bind:value={inputValue}
            placeholder={inputPlaceholder}
            onkeydown={(e) => { if (e.key === 'Enter') handleOk() }}
          />
        </div>
      {:else if mode === 'two-numbers'}
        <div class="numbers-grid">
          <div class="field-group">
            <label class="field-label" for="prompt-num-1">{num1Label}</label>
            <input
              id="prompt-num-1"
              type="number"
              step="any"
              class="text-input"
              bind:value={num1Value}
            />
          </div>
          <div class="field-group">
            <label class="field-label" for="prompt-num-2">{num2Label}</label>
            <input
              id="prompt-num-2"
              type="number"
              step="any"
              class="text-input"
              bind:value={num2Value}
            />
          </div>
        </div>
      {/if}
    </div>

    {#if mode !== 'coverage-prompt'}
      <div class="footer">
        <button class="btn secondary" onclick={onCancel}>
          {cancelLabel ?? $_('cancel')}
        </button>
        {#if mode !== 'select' || options.length > 0}
          <button class="btn primary" onclick={handleOk}>
            {confirmLabel ?? $_('ok')}
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .dialog {
    background: #111a28;
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    width: min(480px, 94vw);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .header h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
  }
  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 6px;
    min-height: 36px;
  }
  .body {
    padding: 18px;
    overflow-y: auto;
    flex: 1;
  }
  .msg {
    margin: 0 0 14px 0;
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.4;
  }
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field-group.mt {
    margin-top: 14px;
  }
  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .text-input {
    min-height: 48px;
    background: #0b121e;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 15px;
    color: var(--text);
    outline: none;
    box-sizing: border-box;
  }
  .text-input:focus {
    border-color: var(--accent);
  }
  .options-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 240px;
    overflow-y: auto;
  }
  .option-item {
    min-height: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 10px 14px;
    background: #182436;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .option-item.selected {
    background: #1f3d63;
    border-color: var(--accent);
  }
  .opt-label {
    font-size: 14px;
    font-weight: 600;
  }
  .opt-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }
  .empty-hint {
    color: var(--text-muted);
    font-style: italic;
    font-size: 14px;
    margin: 8px 0;
  }
  .numbers-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .btn {
    min-height: 48px;
    min-width: 90px;
    padding: 0 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  .btn.secondary {
    background: #1e2c3e;
    color: var(--text);
    border: 1px solid var(--panel-border);
  }
  .btn.primary {
    background: #2a6aad;
    color: #ffffff;
  }
  .btn-group-vertical {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }
  .action-btn {
    min-height: 48px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
  }
  .action-btn.primary {
    background: #2a6aad;
    color: #fff;
  }
  .action-btn.danger {
    background: rgba(224, 85, 85, 0.25);
    border-color: rgba(224, 85, 85, 0.5);
    color: #ff9494;
  }
  .action-btn.secondary {
    background: #1e2c3e;
    border-color: var(--panel-border);
    color: var(--text);
  }
</style>
