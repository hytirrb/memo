<template>
  <div class="todo-card" :class="[`priority-${todo.priority}`, { completed: todo.completed }]">
    <div class="todo-card-inner">
      <button class="check-btn" @click="$emit('toggle', todo)">
        <span class="check-icon">{{ todo.completed ? '✓' : '' }}</span>
      </button>
      <div class="todo-body">
        <div class="todo-top">
          <span class="todo-title">{{ todo.title }}</span>
          <span class="priority-badge" :class="`p-${todo.priority}`">
            {{ priorityMap[todo.priority] }}
          </span>
        </div>
        <p v-if="todo.description" class="todo-desc">{{ todo.description }}</p>
      </div>
      <div class="todo-actions">
        <button class="icon-btn edit" @click="$emit('edit', todo)" title="编辑">✎</button>
        <button class="icon-btn delete" @click="$emit('delete', todo)" title="删除">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  todo: Object,
  priorityMap: Object
})
defineEmits(['toggle', 'edit', 'delete'])
</script>

<style scoped>
.todo-card {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s;
  border-left: 4px solid transparent;
  animation: fadeIn 0.3s ease;
}
.todo-card:hover { box-shadow: var(--shadow-md); transform: translateX(2px); }
.todo-card.priority-high { border-left-color: var(--danger); }
.todo-card.priority-medium { border-left-color: var(--warning); }
.todo-card.priority-low { border-left-color: var(--success); }
.todo-card.completed { opacity: 0.6; }
.todo-card.completed .todo-title { text-decoration: line-through; color: var(--text-muted); }

.todo-card-inner {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
}
.check-btn {
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: white;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  font-size: 13px; font-weight: 700; color: white;
}
.todo-card.completed .check-btn { background: var(--success); border-color: var(--success); }
.check-btn:hover { border-color: var(--primary); transform: scale(1.1); }

.todo-body { flex: 1; min-width: 0; }
.todo-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.todo-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.todo-desc { font-size: 13px; color: var(--text-muted); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.priority-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 8px; }
.priority-badge.p-high { background: #fee2e2; color: #dc2626; }
.priority-badge.p-medium { background: #fef9c3; color: #b45309; }
.priority-badge.p-low { background: #dcfce7; color: #16a34a; }

.todo-actions { display: flex; gap: 6px; flex-shrink: 0; }
.icon-btn {
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  border: none; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}
.todo-card:hover .icon-btn { opacity: 1; }
.icon-btn.edit { background: #e0e7ff; color: var(--primary); }
.icon-btn.edit:hover { background: var(--primary); color: white; }
.icon-btn.delete { background: #fee2e2; color: var(--danger); }
.icon-btn.delete:hover { background: var(--danger); color: white; }
</style>
