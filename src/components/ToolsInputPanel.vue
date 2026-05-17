<script setup lang="ts">
import { Wrench, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
import type { ToolDefinition } from '../types/domain'

const localeStore = useLocaleStore()

const tools = defineModel<ToolDefinition[]>({ required: true })

const showAddForm = ref(false)
const newName = ref('')
const newDescription = ref('')
const newParameters = ref('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}')
const editingIndex = ref<number | null>(null)

function resetForm() {
  newName.value = ''
  newDescription.value = ''
  newParameters.value = '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}'
  editingIndex.value = null
}

function startAdd() {
  resetForm()
  showAddForm.value = true
}

function startEdit(index: number) {
  const tool = tools.value[index]
  newName.value = tool.name
  newDescription.value = tool.description
  newParameters.value = JSON.stringify(tool.parameters, null, 2)
  editingIndex.value = index
  showAddForm.value = true
}

function saveTool() {
  if (!newName.value.trim()) {
    ElMessage.warning(localeStore.t('error.toolNameEmpty'))
    return
  }

  let parameters: Record<string, unknown>
  try {
    parameters = JSON.parse(newParameters.value)
  } catch {
    ElMessage.error(localeStore.t('error.invalidJson'))
    return
  }

  const tool: ToolDefinition = {
    name: newName.value.trim(),
    description: newDescription.value.trim(),
    parameters,
  }

  if (editingIndex.value !== null) {
    const next = [...tools.value]
    next[editingIndex.value] = tool
    tools.value = next
  } else {
    tools.value = [...tools.value, tool]
  }

  showAddForm.value = false
  resetForm()
}

function removeTool(index: number) {
  tools.value = tools.value.filter((_, i) => i !== index)
}

function cancelForm() {
  showAddForm.value = false
  resetForm()
}
</script>

<template>
  <section class="panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">{{ localeStore.t('tools.eyebrow') }}</p>
        <h2>{{ localeStore.t('tools.title') }}</h2>
      </div>
      <button class="icon-button" :title="localeStore.t('tools.add')" :aria-label="localeStore.t('tools.add')" @click="startAdd">
        <Wrench :size="18" />
      </button>
    </div>

    <div v-if="tools.length === 0 && !showAddForm" class="empty-zone">
      {{ localeStore.t('tools.empty') }}
    </div>

    <div v-if="tools.length > 0" class="tool-list">
      <div v-for="(tool, index) in tools" :key="index" class="tool-row">
        <div class="tool-info">
          <strong>{{ tool.name }}</strong>
          <span>{{ tool.description || localeStore.t('tools.noDescription') }}</span>
        </div>
        <div class="tool-actions">
          <button class="icon-button" :title="localeStore.t('tools.edit')" :aria-label="`${localeStore.t('tools.edit')} ${tool.name}`" @click="startEdit(index)">
            <Wrench :size="14" />
          </button>
          <button class="icon-button" :title="localeStore.t('tools.delete')" :aria-label="`${localeStore.t('tools.delete')} ${tool.name}`" @click="removeTool(index)">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddForm" class="tool-form">
      <input
        v-model="newName"
        type="text"
        :placeholder="localeStore.t('tools.namePlaceholder')"
        class="tool-input"
      />
      <input
        v-model="newDescription"
        type="text"
        :placeholder="localeStore.t('tools.descPlaceholder')"
        class="tool-input"
      />
      <textarea
        v-model="newParameters"
        :placeholder="localeStore.t('tools.paramsPlaceholder')"
        class="tool-textarea"
        rows="6"
      />
      <div class="form-actions">
        <button class="ghost-button" @click="saveTool">
          {{ editingIndex !== null ? localeStore.t('tools.update') : localeStore.t('tools.add') }}
        </button>
        <button class="ghost-button" @click="cancelForm">{{ localeStore.t('tools.cancel') }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tool-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  gap: 10px;
}

.tool-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.tool-info strong {
  font-size: 13px;
  font-family: monospace;
}

.tool-info span {
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tool-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.tool-input {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  color: var(--text);
  font-size: 13px;
  font-family: monospace;
}

.tool-textarea {
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  color: var(--text);
  font-size: 12px;
  font-family: monospace;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 8px;
}
</style>
