<template>
  <header class="header">
    <div class="header-inner">
      <div class="logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">每日待办</span>
      </div>

      <!-- 页面切换 tab -->
      <div class="page-tabs">
        <button
          class="page-tab"
          :class="{ active: currentPage === 'daily' }"
          @click="$emit('switchPage', 'daily')"
        >📅 今日</button>
        <button
          class="page-tab"
          :class="{ active: currentPage === 'overview' }"
          @click="$emit('switchPage', 'overview')"
        >📊 总览</button>
        <button
          class="page-tab"
          :class="{ active: currentPage === 'settings' }"
          @click="$emit('switchPage', 'settings')"
        >⚙️ 设置</button>
      </div>

      <div class="header-stats">
        <div class="stat-chip">
          <span class="stat-num">{{ totalCount }}</span>
          <span class="stat-label">总计</span>
        </div>
        <div class="stat-chip success">
          <span class="stat-num">{{ completedCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-chip warn">
          <span class="stat-num">{{ pendingCount }}</span>
          <span class="stat-label">待完成</span>
        </div>
      </div>

      <!-- 日历抽屉触发按钮（仅今日视图显示） -->
      <button
        v-if="currentPage === 'daily'"
        class="btn-calendar"
        @click="$emit('toggleCalendar')"
        title="打开月历"
      >🗓️</button>

      <button class="btn-add-main" @click="$emit('add')">
        <span>＋</span> 新建任务
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  totalCount: Number,
  completedCount: Number,
  pendingCount: Number,
  currentPage: String
})
defineEmits(['add', 'switchPage', 'toggleCalendar'])
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.logo-icon { font-size: 26px; color: var(--primary); animation: pulse 3s infinite; }
.logo-text {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.header-stats { display: flex; gap: 8px; margin-left: auto; }
.stat-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 14px;
  background: var(--secondary);
  border-radius: 20px;
  font-size: 15px;
  color: var(--text-secondary);
}
.stat-chip.success { background: #dcfce7; color: #16a34a; }
.stat-chip.warn { background: #fef9c3; color: #ca8a04; }
.stat-num { font-weight: 700; font-size: 17px; }

.btn-calendar {
  width: 42px; height: 42px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: white;
  font-size: 20px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-calendar:hover { background: var(--secondary); border-color: var(--primary); }

.btn-add-main {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 22px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
  flex-shrink: 0;
}
.btn-add-main:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }

.page-tabs {
  display: flex;
  gap: 4px;
  background: var(--secondary);
  padding: 5px;
  border-radius: 12px;
}
.page-tab {
  padding: 7px 18px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.page-tab.active {
  background: white;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}

@media (max-width: 640px) {
  .header-inner { padding: 0 16px; gap: 8px; }
  .stat-chip { padding: 3px 8px; font-size: 12px; }
  .stat-num { font-size: 14px; }
  .header-stats { display: none; }
}
</style>
