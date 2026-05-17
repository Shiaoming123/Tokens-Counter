<script setup lang="ts">
import { computed } from 'vue'
import { ElAlert, ElInput, ElOption, ElSegmented, ElSelect } from 'element-plus'
import type { Message } from '../types/domain'

const MAX_TEXT_LENGTH = 1_000_000

const text = defineModel<string>({ required: true })

const props = defineProps<{
  inputMode: 'text' | 'messages'
  messages: Message[]
}>()

const emit = defineEmits<{
  'update:inputMode': [value: 'text' | 'messages']
  'update:messages': [value: Message[]]
  addMessage: []
  removeMessage: [index: number]
}>()

const stats = computed(() => {
  if (props.inputMode === 'messages') {
    const allText = props.messages.map((m) => m.content).join('\n')
    const cjk = allText.match(/[㐀-鿿]/g)?.length ?? 0
    const words = allText.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length ?? 0
    return { chars: allText.length, cjk, words }
  }
  const value = text.value
  const cjk = value.match(/[㐀-鿿]/g)?.length ?? 0
  const words = value.match(/[A-Za-z0-9_]+(?:[-'][A-Za-z0-9_]+)*/g)?.length ?? 0
  return { chars: value.length, cjk, words }
})

const lengthWarning = computed(() => {
  if (stats.value.chars > MAX_TEXT_LENGTH) {
    return `Text exceeds the ${MAX_TEXT_LENGTH.toLocaleString()} character limit (currently ${stats.value.chars.toLocaleString()}), counting may time out`
  }
  return null
})

const emptyWarning = computed(() => {
  if (props.inputMode === 'text' && !text.value.trim()) {
    return 'Please enter some text before counting'
  }
  if (props.inputMode === 'messages' && !props.messages.some((m) => m.content.trim())) {
    return 'Please enter at least one message before counting'
  }
  return null
})

const roleOptions = [
  { label: 'System', value: 'system' },
  { label: 'User', value: 'user' },
  { label: 'Assistant', value: 'assistant' },
]

function updateMessageRole(index: number, role: string) {
  const next = [...props.messages]
  next[index] = { ...next[index], role: role as Message['role'] }
  emit('update:messages', next)
}

function updateMessageContent(index: number, content: string) {
  const next = [...props.messages]
  next[index] = { ...next[index], content }
  emit('update:messages', next)
}
</script>

<template>
  <section class="panel input-panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Text</p>
        <h2>Text Input</h2>
      </div>
      <div class="mode-toggle">
        <ElSegmented
          :model-value="inputMode"
          :options="[
            { label: 'Plain Text', value: 'text' },
            { label: 'Multi-turn', value: 'messages' },
          ]"
          aria-label="Input mode toggle"
          @update:model-value="emit('update:inputMode', $event as 'text' | 'messages')"
        />
      </div>
      <div class="micro-stats">
        <span>{{ stats.chars }} chars</span>
        <span>{{ stats.cjk }} CJK</span>
        <span>{{ stats.words }} words</span>
      </div>
    </div>

    <ElAlert
      v-if="lengthWarning"
      :title="lengthWarning"
      type="warning"
      show-icon
      :closable="false"
      class="inline-alert"
    />
    <ElAlert
      v-if="emptyWarning"
      :title="emptyWarning"
      type="info"
      show-icon
      :closable="false"
      class="inline-alert"
    />

    <div v-if="inputMode === 'text'">
      <ElInput
        v-model="text"
        type="textarea"
        :autosize="{ minRows: 12, maxRows: 18 }"
        resize="none"
        placeholder="Paste prompt, article, code, or multi-turn conversation..."
      />
    </div>

    <div v-else class="messages-editor">
      <div v-for="(msg, index) in messages" :key="index" class="message-row">
        <ElSelect
          :model-value="msg.role"
          class="role-select"
          @update:model-value="updateMessageRole(index, $event as string)"
        >
          <ElOption
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElInput
          :model-value="msg.content"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          resize="none"
          :placeholder="msg.role === 'system' ? 'System instruction (optional)...' : 'Enter message content...'"
          class="message-input"
          @update:model-value="updateMessageContent(index, $event as string)"
        />
        <button
          v-if="messages.length > 1"
          class="icon-button remove-msg"
          title="Remove message"
          :aria-label="`Remove message ${index + 1}`"
          @click="emit('removeMessage', index)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <button class="ghost-button add-msg" @click="emit('addMessage')">+ Add Message</button>
    </div>
  </section>
</template>

<style scoped>
.mode-toggle {
  display: flex;
  align-items: center;
}

.messages-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.role-select {
  width: 110px;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
}

.remove-msg {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-top: 4px;
}

.add-msg {
  align-self: flex-start;
  margin-top: 4px;
}

.inline-alert {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .mode-toggle {
    width: 100%;
  }

  .micro-stats {
    flex-wrap: wrap;
  }

  .message-row {
    flex-wrap: wrap;
  }

  .role-select {
    width: 100%;
  }

  .message-input {
    width: 100%;
  }
}
</style>
