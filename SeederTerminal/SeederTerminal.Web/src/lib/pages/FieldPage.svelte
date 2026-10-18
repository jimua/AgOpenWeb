<script lang="ts">
  import { _ } from 'svelte-i18n'
  import {
    fieldOps,
    agShare,
    statusBar,
    scene,
    sendCommand,
  } from '../remote/session'
  import PageHeader from '../components/PageHeader.svelte'
  import Prompt, { type PromptOption } from '../components/Prompt.svelte'

  // Modal dialog state
  let showPrompt = $state(false)
  let promptTitle = $state('')
  let promptMessage = $state('')
  let promptMode = $state<
    'input' | 'select' | 'select-and-input' | 'two-numbers' | 'confirm' | 'coverage-prompt'
  >('input')
  let promptInput = $state('')
  let promptInputLabel = $state('')
  let promptPlaceholder = $state('')
  let promptNum1 = $state<number | string>(0)
  let promptNum2 = $state<number | string>(0)
  let promptOptions = $state<PromptOption[]>([])
  let promptSelectedOpt = $state('')
  let promptTargetAction = $state<string>('')

  let activeFieldName = $derived(
    $fieldOps?.activeField || ($scene?.hasField ? $scene.fieldName : '') || '',
  )
  let activeJobName = $derived($statusBar?.jobName || '')

  // Unsaved coverage prompt auto-open
  $effect(() => {
    if ($statusBar?.unsavedCoveragePrompt) {
      promptTitle = $_('field.unsavedCoverageTitle')
      promptMessage = $_('field.unsavedCoverageDesc')
      promptMode = 'coverage-prompt'
      promptTargetAction = 'unsaved-coverage'
      showPrompt = true
    }
  })

  // 1. ISO XML
  function openIsoXmlDialog() {
    const files = $fieldOps?.isoFiles ?? []
    promptTitle = $_('field.btnIsoXml')
    promptMessage = $_('field.selectIsoXmlFile')
    promptMode = 'select-and-input'
    promptInputLabel = $_('field.newFieldName')
    promptPlaceholder = 'Field Name'
    promptInput = ''
    promptOptions = files.map((f) => ({ value: f, label: f }))
    promptSelectedOpt = files[0] ?? ''
    promptTargetAction = 'fromIsoXml'
    showPrompt = true
  }

  // 2. Close Field
  function handleCloseField() {
    sendCommand('field.close')
  }

  // 3. From KML
  function openKmlDialog() {
    const files = $fieldOps?.kmlFiles ?? []
    promptTitle = $_('field.btnFromKml')
    promptMessage = $_('field.selectKmlFile')
    promptMode = 'select-and-input'
    promptInputLabel = $_('field.newFieldName')
    promptPlaceholder = 'Field Name'
    promptInput = ''
    promptOptions = files.map((f) => ({ value: f, label: f }))
    promptSelectedOpt = files[0] ?? ''
    promptTargetAction = 'fromKml'
    showPrompt = true
  }

  // 4. Drive In
  function handleDriveIn() {
    promptTitle = $_('field.btnDriveIn')
    promptMessage = $_('field.confirmDriveIn')
    promptMode = 'confirm'
    promptTargetAction = 'driveIn'
    showPrompt = true
  }

  // 5. From Existing
  function openFromExistingDialog() {
    const fields = $fieldOps?.fields ?? []
    promptTitle = $_('field.btnFromExisting')
    promptMessage = $_('field.selectSourceField')
    promptMode = 'select-and-input'
    promptInputLabel = $_('field.newFieldName')
    promptPlaceholder = 'New Field Name'
    promptInput = ''
    promptOptions = fields.map((f) => ({
      value: f.name,
      label: f.name,
      sublabel: `${f.areaHa.toFixed(1)} ha`,
    }))
    promptSelectedOpt = fields[0]?.name ?? ''
    promptTargetAction = 'fromExisting'
    showPrompt = true
  }

  // 6. Open Field
  function openFieldDialog() {
    const fields = $fieldOps?.fields ?? []
    promptTitle = $_('field.btnOpen')
    promptMessage = $_('field.selectFieldToOpen')
    promptMode = 'select'
    promptOptions = fields.map((f) => ({
      value: f.name,
      label: f.name,
      sublabel: `${f.areaHa.toFixed(1)} ha`,
    }))
    promptSelectedOpt = fields[0]?.name ?? ''
    promptTargetAction = 'openOnly'
    showPrompt = true
  }

  // 7. New Field
  function openNewFieldDialog() {
    promptTitle = $_('field.btnNew')
    promptMessage = $_('field.enterFieldName')
    promptMode = 'input'
    promptInputLabel = $_('field.fieldName')
    promptPlaceholder = 'New Field'
    promptInput = ''
    promptTargetAction = 'newField'
    showPrompt = true
  }

  // 8. Resume Last
  function handleResumeLast() {
    sendCommand('field.resumeLast')
  }

  // 9. AgShare Download
  function openAgShareDownloadDialog() {
    sendCommand('agshare.fetch')
    const clouds = $agShare?.cloudFields ?? []
    promptTitle = $_('field.btnAgShareDownload')
    promptMessage = $agShare?.apiKey
      ? $agShare?.status || $_('field.selectCloudField')
      : $_('field.agShareNoApiKey')
    promptMode = 'select'
    promptOptions = clouds.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: `${c.areaHa.toFixed(1)} ha`,
    }))
    promptSelectedOpt = clouds[0]?.id ?? ''
    promptTargetAction = 'agshareDownload'
    showPrompt = true
  }

  // 10. AgShare Upload
  function openAgShareUploadDialog() {
    const locals = $agShare?.localFields ?? []
    const fields = $fieldOps?.fields ?? []
    const list =
      locals.length > 0
        ? locals.map((l) => ({ value: l.name, label: l.name }))
        : fields.map((f) => ({ value: f.name, label: f.name }))
    promptTitle = $_('field.btnAgShareUpload')
    promptMessage = $_('field.selectLocalFieldToUpload')
    promptMode = 'select'
    promptOptions = list
    promptSelectedOpt = list[0]?.value ?? ''
    promptTargetAction = 'agshareUpload'
    showPrompt = true
  }

  // 11. Offset Fix
  function openOffsetFixDialog() {
    promptTitle = $_('field.btnOffsetFix')
    promptMessage = $_('field.enterOffsetFixCoordinates')
    promptMode = 'two-numbers'
    promptNum1 = 0
    promptNum2 = 0
    promptTargetAction = 'offsetFix'
    showPrompt = true
  }

  function handlePromptConfirm(data: {
    inputValue: string
    selectedOption: string
    num1: number
    num2: number
    action?: string
  }) {
    showPrompt = false
    const { inputValue, selectedOption, num1, num2, action } = data

    switch (promptTargetAction) {
      case 'unsaved-coverage':
        if (action === 'save') {
          sendCommand('coverage.saveJob')
        } else if (action === 'discard') {
          sendCommand('coverage.discardClose')
        } else if (action === 'cancel') {
          sendCommand('coverage.cancelClose')
        }
        break

      case 'fromIsoXml':
        if (selectedOption && inputValue.trim()) {
          sendCommand(`field.fromIsoXml|${selectedOption}\t${inputValue.trim()}`)
        }
        break

      case 'fromKml':
        if (selectedOption && inputValue.trim()) {
          sendCommand(`field.fromKml|${selectedOption}\t${inputValue.trim()}`)
        }
        break

      case 'driveIn':
        sendCommand('field.driveIn')
        break

      case 'fromExisting':
        if (selectedOption && inputValue.trim()) {
          sendCommand(`field.fromExisting|${selectedOption}\t${inputValue.trim()}\t1\t1\t1\t1`)
        }
        break

      case 'openOnly':
        if (selectedOption) {
          sendCommand(`field.openOnly|${selectedOption}`)
        }
        break

      case 'newField':
        if (inputValue.trim()) {
          sendCommand(`field.new|${inputValue.trim()}`)
        }
        break

      case 'agshareDownload':
        if (selectedOption) {
          sendCommand(`agshare.download|${selectedOption}`)
        }
        break

      case 'agshareUpload':
        if (selectedOption) {
          sendCommand(`agshare.upload|0\t${selectedOption}`)
        }
        break

      case 'offsetFix':
        sendCommand(`offset.set|${num1},${num2}`)
        break
    }
  }
</script>

<div class="page">
  <PageHeader title={$_('nav.field')} />

  <main class="page-content">
    <!-- Active Field Status -->
    <section class="card status-card">
      <div class="status-row">
        <div>
          <span class="status-label">{$_('field.activeField')}:</span>
          <span class="status-value">{activeFieldName || $_('none')}</span>
        </div>
        {#if activeJobName}
          <div>
            <span class="status-label">{$_('field.activeJob')}:</span>
            <span class="status-value">{activeJobName}</span>
          </div>
        {/if}
      </div>
    </section>

    <!-- 11 Action Buttons Grid -->
    <section class="card">
      <h3 class="card-title">{$_('field.operations')}</h3>

      <div class="field-btn-grid">
        <button class="field-op-btn" onclick={openIsoXmlDialog}>
          <span class="btn-icon">📄</span>
          <span class="btn-label">{$_('field.btnIsoXml')}</span>
        </button>

        <button class="field-op-btn" class:danger={!!activeFieldName} onclick={handleCloseField}>
          <span class="btn-icon">❌</span>
          <span class="btn-label">{$_('field.btnClose')}</span>
        </button>

        <button class="field-op-btn" onclick={openKmlDialog}>
          <span class="btn-icon">🗺️</span>
          <span class="btn-label">{$_('field.btnFromKml')}</span>
        </button>

        <button class="field-op-btn" onclick={handleDriveIn}>
          <span class="btn-icon">🚜</span>
          <span class="btn-label">{$_('field.btnDriveIn')}</span>
        </button>

        <button class="field-op-btn" onclick={openFromExistingDialog}>
          <span class="btn-icon">📋</span>
          <span class="btn-label">{$_('field.btnFromExisting')}</span>
        </button>

        <button class="field-op-btn primary" onclick={openFieldDialog}>
          <span class="btn-icon">📂</span>
          <span class="btn-label">{$_('field.btnOpen')}</span>
        </button>

        <button class="field-op-btn primary" onclick={openNewFieldDialog}>
          <span class="btn-icon">➕</span>
          <span class="btn-label">{$_('field.btnNew')}</span>
        </button>

        <button class="field-op-btn" onclick={handleResumeLast}>
          <span class="btn-icon">⏯️</span>
          <span class="btn-label">{$_('field.btnResume')}</span>
        </button>

        <button class="field-op-btn" onclick={openAgShareDownloadDialog}>
          <span class="btn-icon">☁️⬇️</span>
          <span class="btn-label">{$_('field.btnAgShareDownload')}</span>
        </button>

        <button class="field-op-btn" onclick={openAgShareUploadDialog}>
          <span class="btn-icon">☁️⬆️</span>
          <span class="btn-label">{$_('field.btnAgShareUpload')}</span>
        </button>

        <button class="field-op-btn" onclick={openOffsetFixDialog}>
          <span class="btn-icon">🎯</span>
          <span class="btn-label">{$_('field.btnOffsetFix')}</span>
        </button>
      </div>
    </section>
  </main>
</div>

{#if showPrompt}
  <Prompt
    title={promptTitle}
    message={promptMessage}
    mode={promptMode}
    inputLabel={promptInputLabel}
    inputPlaceholder={promptPlaceholder}
    bind:inputValue={promptInput}
    bind:num1Value={promptNum1}
    bind:num2Value={promptNum2}
    options={promptOptions}
    bind:selectedOption={promptSelectedOpt}
    onConfirm={handlePromptConfirm}
    onCancel={() => {
      showPrompt = false
      if (promptTargetAction === 'unsaved-coverage') {
        sendCommand('coverage.cancelClose')
      }
    }}
  />
{/if}

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
    max-width: 900px;
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
  .status-card {
    background: #142234;
  }
  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
  }
  .status-label {
    font-size: 14px;
    color: var(--text-muted);
    font-weight: 600;
    margin-right: 6px;
  }
  .status-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }
  .card-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 700;
  }
  .field-btn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  .field-op-btn {
    min-height: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 8px;
    background: #142234;
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    text-align: center;
  }
  .field-op-btn:hover {
    background: #1c3048;
    border-color: var(--accent);
  }
  .field-op-btn:active {
    transform: scale(0.98);
  }
  .field-op-btn.primary {
    background: #1a3c63;
    border-color: var(--accent);
  }
  .field-op-btn.danger {
    background: rgba(224, 85, 85, 0.18);
    border-color: rgba(224, 85, 85, 0.45);
  }
  .btn-icon {
    font-size: 20px;
  }
  .btn-label {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
  }
</style>
