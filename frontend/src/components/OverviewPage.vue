<template>
  <div class="overview-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-row">
      <div class="stat-card total">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <span class="stat-num">{{ totalCount }}</span>
          <span class="stat-label">全部任务</span>
        </div>
      </div>
      <div class="stat-card done">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <span class="stat-num">{{ completedCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <span class="stat-num">{{ pendingCount }}</span>
          <span class="stat-label">待完成</span>
        </div>
      </div>
      <div class="stat-card rate">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <span class="stat-num">{{ completionRate }}%</span>
          <span class="stat-label">完成率</span>
        </div>
        <div class="rate-bar">
          <div class="rate-fill" :style="{ width: completionRate + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="overview-toolbar">
      <div class="filter-tabs">
        <button
          v-for="f in filters"
          :key="f.key"
          class="filter-tab"
          :class="{ active: currentFilter === f.key }"
          @click="currentFilter = f.key"
        >{{ f.label }}</button>
      </div>
      <div class="sort-select-wrap">
        <select v-model="sortOrder" class="sort-select">
          <option value="asc">日期从早到晚</option>
          <option value="desc">日期从晚到早</option>
        </select>
      </div>
    </div>

    <!-- 按日期分组的任务列表 -->
    <div v-if="groupedDates.length > 0" class="date-groups">
      <div
        v-for="group in groupedDates"
        :key="group.date"
        class="date-group"
      >
        <!-- 日期分组标题 -->
        <div class="group-header" @click="toggleGroup(group.date)">
          <div class="group-header-left">
            <span class="group-collapse-icon">{{ collapsedGroups.has(group.date) ? '▶' : '▼' }}</span>
            <span class="group-date-tag" :class="getDateClass(group.date)">
              {{ getDateLabel(group.date) }}
            </span>
            <span class="group-full-date">{{ formatFullDate(group.date) }}</span>
          </div>
          <div class="group-header-right">
            <span class="group-badge done-badge">{{ group.completed }}/{{ group.total }} 完成</span>
            <div class="mini-bar">
              <div
                class="mini-fill"
                :style="{ width: (group.total ? group.completed / group.total * 100 : 0) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 展开的任务列表 -->
        <transition name="collapse">
          <div v-if="!collapsedGroups.has(group.date)" class="group-todos">
            <div
              v-for="todo in group.todos"
              :key="todo.id"
              class="ov-todo-item"
              :class="[`priority-${todo.priority}`, { completed: todo.completed }]"
            >
              <button class="ov-check-btn" @click="$emit('toggle', todo)">
                <span>{{ todo.completed ? '✓' : '' }}</span>
              </button>
              <div class="ov-todo-body">
                <span class="ov-todo-title md-inline" v-html="renderInline(todo.title)"></span>
                <span v-if="todo.description" class="ov-todo-desc md-body" v-html="renderMd(todo.description)"></span>
              </div>
              <span class="ov-priority-badge" :class="`p-${todo.priority}`">
                {{ priorityMap[todo.priority] }}
              </span>
              <div class="ov-actions">
                <button class="ov-icon-btn edit" @click="$emit('edit', todo)">✎</button>
                <button class="ov-icon-btn delete" @click="$emit('delete', todo)">✕</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🗓️</div>
      <p class="empty-title">暂无任务记录</p>
      <p class="empty-sub">点击右上角「新建任务」开始添加</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

marked.setOptions({ breaks: true })

function renderInline(text) {
  if (!text) return ''
  return marked.parseInline(text)
}

function renderMd(text) {
  if (!text) return ''
  return marked.parse(text)
}

const props = defineProps({
  todos: Array,
  priorityMap: Object,
  formatFullDate: Function,
  todayIso: String
})

defineEmits(['toggle', 'edit', 'delete'])

const currentFilter = ref('all')
const sortOrder = ref('asc')
const collapsedGroups = ref(new Set())

const filters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待完成' },
  { key: 'completed', label: '已完成' }
]

// 统计数
const totalCount = computed(() => props.todos.length)
const completedCount = computed(() => props.todos.filter(t => t.completed).length)
const pendingCount = computed(() => props.todos.filter(t => !t.completed).length)
const completionRate = computed(() =>
  totalCount.value === 0 ? 0 : Math.round(completedCount.value / totalCount.value * 100)
)

// 按日期分组
const groupedDates = computed(() => {
  const filtered = props.todos.filter(t => {
    if (currentFilter.value === 'completed') return t.completed
    if (currentFilter.value === 'pending') return !t.completed
    return true
  })

  const map = {}
  for (const t of filtered) {
    if (!map[t.date]) map[t.date] = []
    map[t.date].push(t)
  }

  const dates = Object.keys(map).sort((a, b) =>
    sortOrder.value === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  )

  return dates.map(date => ({
    date,
    todos: map[date],
    total: map[date].length,
    completed: map[date].filter(t => t.completed).length
  }))
})

function toggleGroup(date) {
  const s = new Set(collapsedGroups.value)
  s.has(date) ? s.delete(date) : s.add(date)
  collapsedGroups.value = s
}

function getDateLabel(iso) {
  const today = props.todayIso
  const tomorrow = offsetDate(today, 1)
  const yesterday = offsetDate(today, -1)
  if (iso === today) return '今天'
  if (iso === tomorrow) return '明天'
  if (iso === yesterday) return '昨天'
  if (iso < today) return '已过期'
  return '即将到来'
}

function getDateClass(iso) {
  const today = props.todayIso
  if (iso === today) return 'tag-today'
  if (iso < today) return 'tag-past'
  return 'tag-future'
}

function offsetDate(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
</script>

<style scoped>
.overview-page { display: flex; flex-direction: column; gap: 20px; }

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-card {
  background: white;
  border-radius: var(--radius);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}
.stat-card.total::before { background: var(--primary); }
.stat-card.done::before { background: var(--success); }
.stat-card.pending::before { background: var(--warning); }
.stat-card.rate::before { background: #8b5cf6; }
.stat-icon { font-size: 28px; flex-shrink: 0; }
.stat-info { display: flex; flex-direction: column; }
.stat-num { font-size: 24px; font-weight: 800; color: var(--text-primary); line-height: 1; }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.rate-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: #ede9fe;
}
.rate-fill {
  height: 100%;
  background: #8b5cf6;
  border-radius: 0 2px 2px 0;
  transition: width 0.6s ease;
}

/* 工具栏 */
.overview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.filter-tabs {
  display: flex; gap: 4px;
  background: var(--secondary);
  padding: 4px; border-radius: 10px;
}
.filter-tab {
  padding: 7px 18px; border: none; border-radius: 8px;
  font-size: 15px; font-weight: 500; cursor: pointer;
  background: transparent; color: var(--text-secondary); transition: all 0.2s;
}
.filter-tab.active {
  background: white; color: var(--primary);
  box-shadow: var(--shadow-sm); font-weight: 600;
}
.sort-select {
  padding: 7px 32px 7px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: var(--text-secondary);
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E") no-repeat right 10px center;
  appearance: none;
  cursor: pointer;
  outline: none;
}
.sort-select:focus { border-color: var(--primary); }

/* 日期分组 */
.date-groups { display: flex; flex-direction: column; gap: 12px; }
.date-group {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
  background: #fafafa;
  border-bottom: 1px solid var(--border);
}
.group-header:hover { background: #f1f5f9; }
.group-header-left { display: flex; align-items: center; gap: 8px; }
.group-collapse-icon { font-size: 10px; color: var(--text-muted); width: 12px; }
.group-date-tag {
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 8px;
}
.tag-today { background: #e0e7ff; color: var(--primary); }
.tag-past { background: #f1f5f9; color: var(--text-muted); }
.tag-future { background: #dcfce7; color: #16a34a; }
.group-full-date { font-size: 16px; font-weight: 600; color: var(--text-primary); }

.group-header-right { display: flex; align-items: center; gap: 10px; }
.group-badge { font-size: 13px; color: var(--text-muted); }
.mini-bar {
  width: 60px; height: 5px;
  background: var(--secondary);
  border-radius: 3px; overflow: hidden;
}
.mini-fill {
  height: 100%; background: var(--success);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* 任务条目 */
.group-todos { padding: 6px 8px 8px; display: flex; flex-direction: column; gap: 5px; }
.ov-todo-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border-left: 3px solid transparent;
  transition: background 0.15s;
}
.ov-todo-item:hover { background: var(--secondary); }
.ov-todo-item.priority-high { border-left-color: var(--danger); }
.ov-todo-item.priority-medium { border-left-color: var(--warning); }
.ov-todo-item.priority-low { border-left-color: var(--success); }
.ov-todo-item.completed { opacity: 0.55; }

.ov-check-btn {
  width: 24px; height: 24px; flex-shrink: 0;
  border-radius: 50%; border: 2px solid var(--border);
  background: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: white;
  transition: all 0.2s;
}
.ov-todo-item.completed .ov-check-btn { background: var(--success); border-color: var(--success); }
.ov-check-btn:hover { border-color: var(--primary); transform: scale(1.1); }

.ov-todo-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ov-todo-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.ov-todo-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

/* 总览页备注 Markdown 样式 */
.md-inline :deep(strong) { font-weight: 800; }
.md-inline :deep(em) { font-style: italic; }
.md-inline :deep(code) { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 11px; font-family: monospace; color: #6366f1; }

.md-body :deep(p) { margin: 0 0 3px; }
.md-body :deep(p:last-child) { margin-bottom: 0; }
.md-body :deep(strong) { font-weight: 700; color: var(--text-secondary); }
.md-body :deep(em) { font-style: italic; }
.md-body :deep(code) { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 11px; font-family: monospace; color: #6366f1; }
.md-body :deep(ul), .md-body :deep(ol) { padding-left: 16px; margin: 2px 0; }
.md-body :deep(li) { margin: 1px 0; }
.md-body :deep(pre) { background: #1e293b; color: #e2e8f0; padding: 8px; border-radius: 6px; font-size: 11px; overflow-x: auto; margin: 4px 0; }

.ov-priority-badge { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 6px; flex-shrink: 0; }
.ov-priority-badge.p-high { background: #fee2e2; color: #dc2626; }
.ov-priority-badge.p-medium { background: #fef9c3; color: #b45309; }
.ov-priority-badge.p-low { background: #dcfce7; color: #16a34a; }

.ov-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.ov-todo-item:hover .ov-actions { opacity: 1; }
.ov-icon-btn {
  width: 26px; height: 26px; border-radius: 6px; border: none;
  cursor: pointer; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.ov-icon-btn.edit { background: #e0e7ff; color: var(--primary); }
.ov-icon-btn.edit:hover { background: var(--primary); color: white; }
.ov-icon-btn.delete { background: #fee2e2; color: var(--danger); }
.ov-icon-btn.delete:hover { background: var(--danger); color: white; }

/* 空状态 */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 24px; gap: 10px; }
.empty-icon { font-size: 56px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--text-secondary); }
.empty-sub { font-size: 14px; color: var(--text-muted); }

/* 折叠动画 */
.collapse-enter-active, .collapse-leave-active { transition: all 0.25s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 1000px; }

/* 响应式 */
@media (max-width: 640px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .group-header { flex-wrap: wrap; gap: 8px; }
}
</style>
