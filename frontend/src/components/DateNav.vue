<template>
  <div class="date-nav-bar">
    <button class="nav-arrow" @click="$emit('shift', -1)">‹</button>
    <div class="date-tabs">
      <button
        v-for="d in weekDates"
        :key="d.iso"
        class="date-tab"
        :class="{
          active: d.iso === selectedDate,
          today: d.iso === todayIso,
          'has-todos': hasTodos(d.iso)
        }"
        @click="$emit('select', d.iso)"
      >
        <span class="date-tab-week">{{ d.week }}</span>
        <span class="date-tab-day">{{ d.day }}</span>
        <span v-if="hasTodos(d.iso)" class="date-dot"></span>
      </button>
    </div>
    <button class="nav-arrow" @click="$emit('shift', 1)">›</button>
  </div>
</template>

<script setup>
defineProps({
  weekDates: Array,
  selectedDate: String,
  todayIso: String,
  hasTodos: Function
})
defineEmits(['shift', 'select'])
</script>

<style scoped>
.date-nav-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.8);
  border-radius: var(--radius-lg);
  padding: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}
.nav-arrow {
  width: 36px; height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 20px;
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.nav-arrow:hover { background: var(--secondary); color: var(--primary); }
.date-tabs { display: flex; flex: 1; gap: 4px; overflow-x: auto; }
.date-tab {
  flex: 1; min-width: 48px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 6px 4px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  color: var(--text-secondary);
}
.date-tab:hover { background: var(--secondary); }
.date-tab.today .date-tab-week { color: var(--primary); }
.date-tab.active {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white !important;
}
.date-tab.active .date-tab-week { color: rgba(255,255,255,0.8) !important; }
.date-tab-week { font-size: 11px; }
.date-tab-day { font-size: 17px; font-weight: 700; }
.date-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}
.date-tab.active .date-dot { background: white; opacity: 1; }
</style>
