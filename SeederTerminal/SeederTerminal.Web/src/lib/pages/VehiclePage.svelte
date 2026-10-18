<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { config, profiles, sendCommand } from '../remote/session'
  import PageHeader from '../components/PageHeader.svelte'
  import Prompt, { type PromptOption } from '../components/Prompt.svelte'

  // Local draft store for focused text/numeric inputs to prevent config echoes clobbering input
  let focusedKey = $state<string | null>(null)
  let draftValues = $state<Record<string, string>>({})

  // Modal dialog state
  let showPrompt = $state(false)
  let promptTitle = $state('')
  let promptMessage = $state('')
  let promptMode = $state<'input' | 'confirm'>('input')
  let promptInput = $state('')
  let promptTarget = $state<string>('')

  // Derive current values from config
  let veh = $derived($config?.vehicle)
  let tool = $derived($config?.tool)
  let activeVehicleName = $derived($profiles?.activeVehicle ?? 'Default')
  let vehicleProfiles = $derived($profiles?.vehicles ?? [])

  function getDisplayVal(key: string, liveVal: number | undefined, defaultVal = 0): string {
    if (focusedKey === key) {
      return draftValues[key] ?? String(liveVal ?? defaultVal)
    }
    return liveVal != null ? String(liveVal) : String(defaultVal)
  }

  function handleFocus(key: string, currentVal: number | undefined, defaultVal = 0) {
    focusedKey = key
    draftValues[key] = currentVal != null ? String(currentVal) : String(defaultVal)
  }

  function handleInput(key: string, e: Event) {
    const target = e.target as HTMLInputElement
    draftValues[key] = target.value
  }

  function handleBlur(key: string) {
    focusedKey = null
    const val = draftValues[key]
    if (val != null) {
      const num = parseFloat(val)
      if (!isNaN(num)) {
        if (key === 'tool.totalWidth') {
          setTotalToolWidth(num)
        } else {
          setKey(key, num)
        }
      }
    }
  }

  function setKey(key: string, val: string | number | boolean) {
    const strVal = typeof val === 'boolean' ? (val ? '1' : '0') : String(val)
    sendCommand(`config.set|${key}:${strVal}`)
    sendCommand('profile.save')
  }

  function setTotalToolWidth(widthM: number) {
    const numSections = tool?.numSections || 1
    const totalCm = widthM * 100
    const secCm = totalCm / numSections
    for (let i = 0; i < numSections; i++) {
      sendCommand(`config.set|tool.sectionWidth:${i},${secCm.toFixed(1)}`)
    }
    sendCommand('profile.save')
  }

  // Profile operations
  function selectProfile(name: string) {
    sendCommand(`profile.configureVehicle|${name}`)
  }

  function openNewProfileDialog() {
    promptTitle = $_('vehicle.newProfile')
    promptMessage = $_('vehicle.enterProfileName')
    promptMode = 'input'
    promptInput = 'New Profile'
    promptTarget = 'new'
    showPrompt = true
  }

  function duplicateProfile(name: string) {
    sendCommand(`profile.new|vehicle\t${name} Copy`)
    sendCommand('profile.save')
  }

  function openRenameDialog(name: string) {
    promptTitle = $_('vehicle.renameProfile')
    promptMessage = $_('vehicle.enterNewName')
    promptMode = 'input'
    promptInput = name
    promptTarget = `rename:${name}`
    showPrompt = true
  }

  function openDeleteDialog(name: string) {
    promptTitle = $_('vehicle.deleteProfile')
    promptMessage = `${$_('vehicle.confirmDelete')} "${name}"?`
    promptMode = 'confirm'
    promptTarget = `delete:${name}`
    showPrompt = true
  }

  function handlePromptConfirm(data: { inputValue: string }) {
    showPrompt = false
    if (promptTarget === 'new') {
      const name = data.inputValue.trim()
      if (!name) return
      // Send Avalonia defaults first
      sendCommand('config.set|vehicle.type:0')
      sendCommand('config.set|vehicle.wheelbase:2.5')
      sendCommand('config.set|vehicle.trackWidth:1.8')
      sendCommand('config.set|vehicle.antennaHeight:3')
      sendCommand('config.set|vehicle.antennaPivot:0')
      sendCommand('config.set|vehicle.antennaOffset:0')
      sendCommand('config.set|tool.type:rear')
      sendCommand('config.set|tool.hitchLength:1.8')
      sendCommand('config.set|tool.offset:0')
      sendCommand('config.set|tool.numSections:12')
      sendCommand(`profile.new|vehicle\t${name}`)
      sendCommand('profile.save')
    } else if (promptTarget.startsWith('rename:')) {
      const oldName = promptTarget.substring('rename:'.length)
      const newName = data.inputValue.trim()
      if (newName && newName !== oldName) {
        sendCommand(`profile.rename|vehicle\t${oldName}\t${newName}`)
      }
    } else if (promptTarget.startsWith('delete:')) {
      const name = promptTarget.substring('delete:'.length)
      sendCommand(`profile.delete|vehicle\t${name}`)
    }
  }

  let toolTypeStr = $derived.by(() => {
    const t = tool?.type ?? 1
    if (t === 0) return 'front'
    if (t === 1) return 'rear'
    if (t === 2) return 'tbt'
    if (t === 3) return 'trailing'
    return 'rear'
  })
</script>

<div class="page">
  <PageHeader title={$_('nav.vehicle')} />

  <main class="page-content">
    <!-- 1. Profiles Card -->
    <section class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">{$_('vehicle.profiles')}</h3>
          <p class="card-desc">{$_('vehicle.activeProfile')}: <strong>{activeVehicleName}</strong></p>
        </div>
        <button class="btn primary" onclick={openNewProfileDialog}>
          + {$_('vehicle.new')}
        </button>
      </div>

      <div class="profiles-list">
        {#each vehicleProfiles as p (p.name)}
          <div class="profile-row" class:active={p.name === activeVehicleName}>
            <button
              type="button"
              class="profile-info"
              onclick={() => selectProfile(p.name)}
            >
              <span class="profile-name">{p.name}</span>
              {#if p.name === activeVehicleName}
                <span class="active-badge">{$_('active')}</span>
              {/if}
            </button>
            <div class="profile-actions">
              <button
                class="btn sm"
                title={$_('duplicate')}
                onclick={() => duplicateProfile(p.name)}
              >
                {$_('duplicate')}
              </button>
              <button
                class="btn sm"
                title={$_('rename')}
                onclick={() => openRenameDialog(p.name)}
              >
                {$_('rename')}
              </button>
              {#if vehicleProfiles.length > 1}
                <button
                  class="btn sm danger"
                  title={$_('delete')}
                  onclick={() => openDeleteDialog(p.name)}
                >
                  {$_('delete')}
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- 2. Vehicle Type & Geometry -->
    <section class="card">
      <h3 class="card-title">{$_('vehicle.typeAndGeometry')}</h3>

      <div class="type-selector">
        <button
          class="type-card"
          class:active={(veh?.type ?? 0) === 0}
          onclick={() => setKey('vehicle.type', 0)}
        >
          <span class="type-icon">🚜</span>
          <span class="type-label">{$_('vehicle.tractor')}</span>
        </button>
        <button
          class="type-card"
          class:active={(veh?.type ?? 0) === 1}
          onclick={() => setKey('vehicle.type', 1)}
        >
          <span class="type-icon">🌾</span>
          <span class="type-label">{$_('vehicle.harvester')}</span>
        </button>
        <button
          class="type-card"
          class:active={(veh?.type ?? 0) === 2}
          onclick={() => setKey('vehicle.type', 2)}
        >
          <span class="type-icon">🚛</span>
          <span class="type-label">{$_('vehicle.fourWD')}</span>
        </button>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="veh-wheelbase">{$_('vehicle.wheelbase')} (m)</label>
          <input
            id="veh-wheelbase"
            type="number"
            step="0.01"
            value={getDisplayVal('vehicle.wheelbase', veh?.wheelbase, 2.5)}
            onfocus={() => handleFocus('vehicle.wheelbase', veh?.wheelbase, 2.5)}
            oninput={(e) => handleInput('vehicle.wheelbase', e)}
            onblur={() => handleBlur('vehicle.wheelbase')}
          />
        </div>

        <div class="form-field">
          <label for="veh-track">{$_('vehicle.trackWidth')} (m)</label>
          <input
            id="veh-track"
            type="number"
            step="0.01"
            value={getDisplayVal('vehicle.trackWidth', veh?.trackWidth, 1.8)}
            onfocus={() => handleFocus('vehicle.trackWidth', veh?.trackWidth, 1.8)}
            oninput={(e) => handleInput('vehicle.trackWidth', e)}
            onblur={() => handleBlur('vehicle.trackWidth')}
          />
        </div>
      </div>
    </section>

    <!-- 3. Antenna Setup -->
    <section class="card">
      <h3 class="card-title">{$_('vehicle.antennaSetup')}</h3>

      <div class="form-grid">
        <div class="form-field">
          <label for="veh-ant-height">{$_('vehicle.antennaHeight')} (m)</label>
          <input
            id="veh-ant-height"
            type="number"
            step="0.01"
            value={getDisplayVal('vehicle.antennaHeight', veh?.antennaHeight, 3.0)}
            onfocus={() => handleFocus('vehicle.antennaHeight', veh?.antennaHeight, 3.0)}
            oninput={(e) => handleInput('vehicle.antennaHeight', e)}
            onblur={() => handleBlur('vehicle.antennaHeight')}
          />
        </div>

        <div class="form-field">
          <label for="veh-ant-pivot">{$_('vehicle.antennaPivot')} (m)</label>
          <input
            id="veh-ant-pivot"
            type="number"
            step="0.01"
            value={getDisplayVal('vehicle.antennaPivot', veh?.antennaPivot, 0.0)}
            onfocus={() => handleFocus('vehicle.antennaPivot', veh?.antennaPivot, 0.0)}
            oninput={(e) => handleInput('vehicle.antennaPivot', e)}
            onblur={() => handleBlur('vehicle.antennaPivot')}
          />
        </div>

        <div class="form-field">
          <label for="veh-ant-offset">{$_('vehicle.antennaOffset')} (m)</label>
          <input
            id="veh-ant-offset"
            type="number"
            step="0.01"
            value={getDisplayVal('vehicle.antennaOffset', veh?.antennaOffset, 0.0)}
            onfocus={() => handleFocus('vehicle.antennaOffset', veh?.antennaOffset, 0.0)}
            oninput={(e) => handleInput('vehicle.antennaOffset', e)}
            onblur={() => handleBlur('vehicle.antennaOffset')}
          />
        </div>

        <div class="form-field">
          <span class="field-label-text">{$_('vehicle.antennaSide')}</span>
          <div class="btn-group">
            <button
              type="button"
              class="group-btn"
              class:active={(veh?.antennaOffset ?? 0) < -0.01}
              onclick={() => setKey('vehicle.antennaSide', 'left')}
            >
              {$_('left')}
            </button>
            <button
              type="button"
              class="group-btn"
              class:active={Math.abs(veh?.antennaOffset ?? 0) <= 0.01}
              onclick={() => setKey('vehicle.antennaSide', 'center')}
            >
              {$_('center')}
            </button>
            <button
              type="button"
              class="group-btn"
              class:active={(veh?.antennaOffset ?? 0) > 0.01}
              onclick={() => setKey('vehicle.antennaSide', 'right')}
            >
              {$_('right')}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Tool Type & Dimensions -->
    <section class="card">
      <h3 class="card-title">{$_('vehicle.toolSetup')}</h3>

      <div class="type-selector">
        <button
          class="type-card"
          class:active={toolTypeStr === 'rear'}
          onclick={() => setKey('tool.type', 'rear')}
        >
          <span class="type-icon">🔙</span>
          <span class="type-label">{$_('tool.rear')}</span>
        </button>
        <button
          class="type-card"
          class:active={toolTypeStr === 'front'}
          onclick={() => setKey('tool.type', 'front')}
        >
          <span class="type-icon">🔜</span>
          <span class="type-label">{$_('tool.front')}</span>
        </button>
        <button
          class="type-card"
          class:active={toolTypeStr === 'trailing'}
          onclick={() => setKey('tool.type', 'trailing')}
        >
          <span class="type-icon">🛞</span>
          <span class="type-label">{$_('tool.trailing')}</span>
        </button>
        <button
          class="type-card"
          class:active={toolTypeStr === 'tbt'}
          onclick={() => setKey('tool.type', 'tbt')}
        >
          <span class="type-icon">⛽</span>
          <span class="type-label">{$_('tool.tbt')}</span>
        </button>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="tool-width">{$_('tool.totalWidth')} (m)</label>
          <input
            id="tool-width"
            type="number"
            step="0.1"
            value={getDisplayVal('tool.totalWidth', tool?.totalWidth, 6.0)}
            onfocus={() => handleFocus('tool.totalWidth', tool?.totalWidth, 6.0)}
            oninput={(e) => handleInput('tool.totalWidth', e)}
            onblur={() => handleBlur('tool.totalWidth')}
          />
          <span class="field-hint">{$_('tool.equalizeSectionsHint')}</span>
        </div>

        <div class="form-field">
          <label for="tool-hitch">{$_('tool.hitchLength')} (m)</label>
          <input
            id="tool-hitch"
            type="number"
            step="0.01"
            value={getDisplayVal('tool.hitchLength', tool?.hitchLength, 1.8)}
            onfocus={() => handleFocus('tool.hitchLength', tool?.hitchLength, 1.8)}
            oninput={(e) => handleInput('tool.hitchLength', e)}
            onblur={() => handleBlur('tool.hitchLength')}
          />
        </div>

        {#if toolTypeStr === 'trailing'}
          <div class="form-field">
            <label for="tool-tr-hitch">{$_('tool.trailingHitch')} (m)</label>
            <input
              id="tool-tr-hitch"
              type="number"
              step="0.01"
              value={getDisplayVal('tool.trailingHitchLength', tool?.trailingHitchLength, 2.0)}
              onfocus={() => handleFocus('tool.trailingHitchLength', tool?.trailingHitchLength, 2.0)}
              oninput={(e) => handleInput('tool.trailingHitchLength', e)}
              onblur={() => handleBlur('tool.trailingHitchLength')}
            />
          </div>

          <div class="form-field">
            <label for="tool-tr-pivot">{$_('tool.trailingPivot')} (m)</label>
            <input
              id="tool-tr-pivot"
              type="number"
              step="0.01"
              value={getDisplayVal('tool.trailingToolToPivotLength', tool?.trailingToolToPivotLength, 0.0)}
              onfocus={() => handleFocus('tool.trailingToolToPivotLength', tool?.trailingToolToPivotLength, 0.0)}
              oninput={(e) => handleInput('tool.trailingToolToPivotLength', e)}
              onblur={() => handleBlur('tool.trailingToolToPivotLength')}
            />
          </div>
        {/if}

        {#if toolTypeStr === 'tbt'}
          <div class="form-field">
            <label for="tool-tbt-hitch">{$_('tool.tankHitch')} (m)</label>
            <input
              id="tool-tbt-hitch"
              type="number"
              step="0.01"
              value={getDisplayVal('tool.tankTrailingHitchLength', tool?.tankTrailingHitchLength, 2.0)}
              onfocus={() => handleFocus('tool.tankTrailingHitchLength', tool?.tankTrailingHitchLength, 2.0)}
              oninput={(e) => handleInput('tool.tankTrailingHitchLength', e)}
              onblur={() => handleBlur('tool.tankTrailingHitchLength')}
            />
          </div>
        {/if}

        <div class="form-field">
          <label for="tool-offset">{$_('tool.offset')} (m)</label>
          <input
            id="tool-offset"
            type="number"
            step="0.01"
            value={getDisplayVal('tool.offset', tool?.offset, 0.0)}
            onfocus={() => handleFocus('tool.offset', tool?.offset, 0.0)}
            oninput={(e) => handleInput('tool.offset', e)}
            onblur={() => handleBlur('tool.offset')}
          />
        </div>

        <div class="form-field">
          <label for="tool-overlap">{$_('tool.overlap')} (m)</label>
          <input
            id="tool-overlap"
            type="number"
            step="0.01"
            value={getDisplayVal('tool.overlap', tool?.overlap, 0.0)}
            onfocus={() => handleFocus('tool.overlap', tool?.overlap, 0.0)}
            oninput={(e) => handleInput('tool.overlap', e)}
            onblur={() => handleBlur('tool.overlap')}
          />
        </div>
      </div>
    </section>

    <!-- 5. Section Control & Timing -->
    <section class="card">
      <h3 class="card-title">{$_('vehicle.sectionControl')}</h3>

      <div class="form-grid">
        <div class="form-field">
          <label for="tool-num-sec">{$_('tool.numSections')}</label>
          <input
            id="tool-num-sec"
            type="number"
            min="1"
            max="64"
            value={getDisplayVal('tool.numSections', tool?.numSections, 12)}
            onfocus={() => handleFocus('tool.numSections', tool?.numSections, 12)}
            oninput={(e) => handleInput('tool.numSections', e)}
            onblur={() => handleBlur('tool.numSections')}
          />
        </div>

        <div class="form-field">
          <label for="tool-la-on">{$_('tool.lookAheadOn')} (s)</label>
          <input
            id="tool-la-on"
            type="number"
            step="0.1"
            value={getDisplayVal('tool.lookAheadOn', tool?.lookAheadOn, 1.0)}
            onfocus={() => handleFocus('tool.lookAheadOn', tool?.lookAheadOn, 1.0)}
            oninput={(e) => handleInput('tool.lookAheadOn', e)}
            onblur={() => handleBlur('tool.lookAheadOn')}
          />
        </div>

        <div class="form-field">
          <label for="tool-la-off">{$_('tool.lookAheadOff')} (s)</label>
          <input
            id="tool-la-off"
            type="number"
            step="0.1"
            value={getDisplayVal('tool.lookAheadOff', tool?.lookAheadOff, 0.5)}
            onfocus={() => handleFocus('tool.lookAheadOff', tool?.lookAheadOff, 0.5)}
            oninput={(e) => handleInput('tool.lookAheadOff', e)}
            onblur={() => handleBlur('tool.lookAheadOff')}
          />
        </div>

        <div class="form-field">
          <label for="tool-delay-off">{$_('tool.turnOffDelay')} (s)</label>
          <input
            id="tool-delay-off"
            type="number"
            step="0.1"
            value={getDisplayVal('tool.turnOffDelay', tool?.turnOffDelay, 0.0)}
            onfocus={() => handleFocus('tool.turnOffDelay', tool?.turnOffDelay, 0.0)}
            oninput={(e) => handleInput('tool.turnOffDelay', e)}
            onblur={() => handleBlur('tool.turnOffDelay')}
          />
        </div>

        <div class="form-field">
          <label for="tool-min-cov">{$_('tool.minCoverage')} (%)</label>
          <input
            id="tool-min-cov"
            type="number"
            min="0"
            max="100"
            value={getDisplayVal('tool.minCoverage', tool?.minCoverage, 100)}
            onfocus={() => handleFocus('tool.minCoverage', tool?.minCoverage, 100)}
            oninput={(e) => handleInput('tool.minCoverage', e)}
            onblur={() => handleBlur('tool.minCoverage')}
          />
        </div>
      </div>

      <div class="toggle-list">
        <label class="toggle-row">
          <input
            type="checkbox"
            checked={tool?.isSectionsNotZones ?? true}
            onchange={(e) => setKey('tool.isSectionsNotZones', (e.target as HTMLInputElement).checked)}
          />
          <span>{$_('tool.sectionsNotZones')}</span>
        </label>

        <label class="toggle-row">
          <input
            type="checkbox"
            checked={tool?.isMultiColoredSections ?? false}
            onchange={(e) => setKey('tool.isMultiColoredSections', (e.target as HTMLInputElement).checked)}
          />
          <span>{$_('tool.multiColoredSections')}</span>
        </label>

        <label class="toggle-row">
          <input
            type="checkbox"
            checked={tool?.isSectionOffWhenOut ?? false}
            onchange={(e) => setKey('tool.isSectionOffWhenOut', (e.target as HTMLInputElement).checked)}
          />
          <span>{$_('tool.offWhenOutOfBoundary')}</span>
        </label>
      </div>
    </section>

    <!-- 6. Work and Steer Switches -->
    <section class="card">
      <h3 class="card-title">{$_('vehicle.switches')}</h3>

      <div class="toggle-list">
        <label class="toggle-row">
          <input
            type="checkbox"
            checked={tool?.isWorkSwitchEnabled ?? false}
            onchange={(e) => setKey('tool.isWorkSwitchEnabled', (e.target as HTMLInputElement).checked)}
          />
          <span>{$_('switches.workSwitchEnabled')}</span>
        </label>

        {#if tool?.isWorkSwitchEnabled}
          <label class="toggle-row nested">
            <input
              type="checkbox"
              checked={tool?.isWorkSwitchActiveLow ?? false}
              onchange={(e) => setKey('tool.isWorkSwitchActiveLow', (e.target as HTMLInputElement).checked)}
            />
            <span>{$_('switches.workSwitchActiveLow')}</span>
          </label>

          <label class="toggle-row nested">
            <input
              type="checkbox"
              checked={tool?.isWorkSwitchManualSections ?? false}
              onchange={(e) => setKey('tool.isWorkSwitchManualSections', (e.target as HTMLInputElement).checked)}
            />
            <span>{$_('switches.workSwitchManualSections')}</span>
          </label>
        {/if}

        <label class="toggle-row">
          <input
            type="checkbox"
            checked={tool?.isSteerSwitchEnabled ?? false}
            onchange={(e) => setKey('tool.isSteerSwitchEnabled', (e.target as HTMLInputElement).checked)}
          />
          <span>{$_('switches.steerSwitchEnabled')}</span>
        </label>

        {#if tool?.isSteerSwitchEnabled}
          <label class="toggle-row nested">
            <input
              type="checkbox"
              checked={tool?.isSteerSwitchManualSections ?? false}
              onchange={(e) => setKey('tool.isSteerSwitchManualSections', (e.target as HTMLInputElement).checked)}
            />
            <span>{$_('switches.steerSwitchManualSections')}</span>
          </label>
        {/if}
      </div>
    </section>
  </main>
</div>

{#if showPrompt}
  <Prompt
    title={promptTitle}
    message={promptMessage}
    mode={promptMode}
    bind:inputValue={promptInput}
    onConfirm={handlePromptConfirm}
    onCancel={() => { showPrompt = false }}
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
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .card-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 700;
  }
  .card-desc {
    margin: 0;
    font-size: 14px;
    color: var(--text-muted);
  }
  .profiles-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .profile-row {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: #142234;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
  }
  .profile-row.active {
    border-color: var(--accent);
    background: #182e4a;
  }
  .profile-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex: 1;
    padding: 6px 0;
    background: transparent;
    border: none;
    color: var(--text);
    text-align: left;
  }
  .profile-name {
    font-size: 15px;
    font-weight: 600;
  }
  .active-badge {
    background: var(--accent);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .profile-actions {
    display: flex;
    gap: 6px;
  }
  .field-label-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .btn {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--panel-border);
    background: #1e2c3e;
    color: var(--text);
  }
  .btn.sm {
    min-height: 38px;
    padding: 0 10px;
    font-size: 13px;
  }
  .btn.primary {
    background: #2a6aad;
    border-color: transparent;
    color: #fff;
  }
  .btn.danger {
    background: rgba(224, 85, 85, 0.2);
    border-color: rgba(224, 85, 85, 0.4);
    color: #ff9494;
  }
  .type-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    margin-bottom: 18px;
  }
  .type-card {
    min-height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #142234;
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .type-card.active {
    background: #1f3d63;
    border-color: var(--accent);
    box-shadow: 0 0 10px rgba(61, 143, 212, 0.25);
  }
  .type-icon {
    font-size: 24px;
  }
  .type-label {
    font-size: 14px;
    font-weight: 600;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-field label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .form-field input[type="number"] {
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
  .form-field input[type="number"]:focus {
    border-color: var(--accent);
  }
  .field-hint {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
  }
  .btn-group {
    display: flex;
    min-height: 48px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--panel-border);
  }
  .group-btn {
    flex: 1;
    min-height: 48px;
    background: #0b121e;
    border: none;
    border-right: 1px solid var(--panel-border);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .group-btn:last-child {
    border-right: none;
  }
  .group-btn.active {
    background: #2a6aad;
    color: #fff;
  }
  .toggle-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 14px;
  }
  .toggle-row {
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    background: #142234;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  .toggle-row input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .toggle-row.nested {
    margin-left: 20px;
    background: #101c2c;
  }
</style>
