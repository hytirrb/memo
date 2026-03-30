<template>
  <div class="todo-list-area">
    <transition-group name="list" tag="div" class="todo-list">
      <TodoCard
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
        :priorityMap="priorityMap"
        @toggle="$emit('toggle', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </transition-group>

    <div v-if="filteredTodos.length === 0" class="empty-state">
      <div class="empty-icon">{{ currentFilter === 'completed' ? '🎉' : '📋' }}</div>
      <p class="empty-title">{{ emptyText }}</p>
      <p class="empty-sub">{{ currentFilter === 'all' ? '点击右上角「新建任务」开始添加' : '' }}</p>
      <button v-if="currentFilter === 'all'" class="btn-empty-add" @click="$emit('add')">
        ＋ 添加任务
      </button>
    </div>
  </div>
</template>

<script setup>
import TodoCard from './TodoCard.vue'

defineProps({
  filteredTodos: Array,
  currentFilter: String,
  emptyText: String,
  priorityMap: Object
})
defineEmits(['toggle', 'edit', 'delete', 'add'])
</script>

<style scoped>
.todo-list { display: flex; flex-direction: column; gap: 10px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 64px 24px; gap: 10px;
}
.empty-icon { font-size: 56px; line-height: 1; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--text-secondary); }
.empty-sub { font-size: 14px; color: var(--text-muted); }
.btn-empty-add {
  margin-top: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; border: none; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}
.btn-empty-add:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }

.list-enter-active { animation: fadeIn 0.3s ease; }
.list-leave-active { animation: fadeIn 0.2s ease reverse; position: absolute; }
.list-move { transition: transform 0.3s; }
</style>
