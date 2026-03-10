<template>
  <header class="header">
    <div class="header-inner">
      <div class="logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">每日待办</span>
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
  pendingCount: Number
})
defineEmits(['add'])
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
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.logo-icon { font-size: 22px; color: var(--primary); animation: pulse 3s infinite; }
.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.header-stats { display: flex; gap: 8px; margin-left: auto; }
.stat-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 12px;
  background: var(--secondary);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}
.stat-chip.success { background: #dcfce7; color: #16a34a; }
.stat-chip.warn { background: #fef9c3; color: #ca8a04; }
.stat-num { font-weight: 700; font-size: 15px; }
.btn-add-main {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
  flex-shrink: 0;
}
.btn-add-main:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }

@media (max-width: 640px) {
  .header-inner { padding: 0 16px; gap: 10px; }
  .stat-chip { padding: 3px 8px; font-size: 12px; }
  .stat-num { font-size: 14px; }
}
</style>
