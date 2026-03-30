<template>
  <div class="todo-card" :class="[`priority-${todo.priority}`, { completed: todo.completed }]">
    <button class="check-btn" @click="$emit('toggle', todo)">
      <span v-if="todo.completed" class="check-icon">✓</span>
    </button>

    <div class="todo-body">
      <span class="todo-title md-inline" v-html="renderInline(todo.title)"></span>
      <span v-if="todo.description" class="todo-desc md-inline" v-html="renderInline(todo.description)"></span>
      <div v-if="todo.attachment" class="todo-attachment">
        <span class="attachment-name">附件: {{ getAttachmentName(todo.attachment) }}</span>
        <a :href="todo.attachment" target="_blank" download class="attachment-link">下载附件</a>
      </div>
    </div>

    <span class="priority-badge" :class="`p-${todo.priority}`">{{ priorityMap[todo.priority] }}</span>

    <div class="todo-actions">
      <button class="icon-btn edit" @click="$emit('edit', todo)" title="编辑">✎</button>
      <button class="icon-btn delete" @click="$emit('delete', todo)" title="删除">✕</button>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked'

marked.setOptions({ breaks: true })

defineProps({ todo: Object, priorityMap: Object })
defineEmits(['toggle', 'edit', 'delete'])

function renderInline(text) {
  if (!text) return ''
  return marked.parseInline(text)
}

function getAttachmentName(path) {
  if (!path) return ''
  return path.split('/').pop()
}
</script>

<style scoped>
.todo-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border);
  border-left: 4px solid transparent;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.2s;
  animation: fadeIn 0.25s ease;
}
.todo-card:hover { box-shadow: var(--shadow-md); transform: translateX(2px); }
.todo-card.priority-high   { border-left-color: var(--danger); }
.todo-card.priority-medium { border-left-color: var(--warning); }
.todo-card.priority-low    { border-left-color: var(--success); }
.todo-card.completed { opacity: 0.5; }

.check-btn {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: white;
  transition: all 0.2s;
  align-self: flex-start;
  margin-top: 2px;
}
.todo-card.completed .check-btn { background: var(--success); border-color: var(--success); }
.check-btn:hover { border-color: var(--primary); transform: scale(1.15); }

.todo-body {
  flex: 1; min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-title {
  font-size: 19px; font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.todo-desc {
  font-size: 16px; color: var(--text-muted);
  line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.todo-attachment {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
  font-size: 14px;
  line-height: 1.4;
  flex-wrap: wrap;
}
.attachment-name {
  color: var(--text-secondary);
}
.attachment-link {
  color: var(--primary);
  text-decoration: underline;
}

/* Markdown inline */
.md-inline :deep(strong) { font-weight: 800; }
.md-inline :deep(em) { font-style: italic; }
.md-inline :deep(code) {
  background: #f1f5f9; padding: 1px 4px;
  border-radius: 3px; font-size: 13px; font-family: monospace; color: #6366f1;
}

.priority-badge {
  font-size: 13px; font-weight: 600;
  padding: 3px 10px; border-radius: 6px; flex-shrink: 0;
  align-self: flex-start;
}
.priority-badge.p-high   { background: #fee2e2; color: #dc2626; }
.priority-badge.p-medium { background: #fef9c3; color: #b45309; }
.priority-badge.p-low    { background: #dcfce7; color: #16a34a; }

.todo-actions { display: flex; gap: 6px; opacity: 0; transition: opacity 0.15s; flex-shrink: 0; align-self: flex-start; }
.todo-card:hover .todo-actions { opacity: 1; }
.icon-btn {
  width: 30px; height: 30px; border-radius: 6px; border: none;
  cursor: pointer; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn.edit   { background: #e0e7ff; color: var(--primary); }
.icon-btn.edit:hover   { background: var(--primary); color: white; }
.icon-btn.delete { background: #fee2e2; color: var(--danger); }
.icon-btn.delete:hover { background: var(--danger); color: white; }
</style>
