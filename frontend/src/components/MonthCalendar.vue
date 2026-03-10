<template>
  <div class="month-calendar">
    <!-- 月份导航 -->
    <div class="cal-header">
      <button class="cal-arrow" @click="shiftMonth(-1)">‹</button>
      <span class="cal-title">{{ year }}年{{ month + 1 }}月</span>
      <button class="cal-arrow" @click="shiftMonth(1)">›</button>
    </div>

    <!-- 星期头 -->
    <div class="cal-weekdays">
      <span v-for="w in weekLabels" :key="w" class="cal-wd">{{ w }}</span>
    </div>

    <!-- 日期格子 -->
    <div class="cal-grid">
      <button
        v-for="cell in calCells"
        :key="cell.iso"
        class="cal-cell"
        :class="{
          'other-month': !cell.current,
          'is-today': cell.iso === todayIso,
          'is-selected': cell.iso === selectedDate,
          'has-todos': hasTodos(cell.iso)
        }"
        @click="$emit('select', cell.iso)"
      >
        <span class="cell-day">{{ cell.day }}</span>
        <span v-if="hasTodos(cell.iso)" class="cell-dot"></span>
      </button>
    </div>

    <!-- 快捷跳转今天 -->
    <button
      v-if="selectedDate !== todayIso"
      class="btn-goto-today"
      @click="$emit('select', todayIso)"
    >回到今天</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedDate: String,
  todayIso: String,
  hasTodos: Function
})
defineEmits(['select'])

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth())

function shiftMonth(n) {
  let m = month.value + n
  let y = year.value
  if (m > 11) { m = 0; y++ }
  if (m < 0)  { m = 11; y-- }
  month.value = m
  year.value = y
}

function toIso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const calCells = computed(() => {
  const y = year.value
  const m = month.value
  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)

  let startWd = firstDay.getDay()
  startWd = startWd === 0 ? 6 : startWd - 1

  const cells = []

  for (let i = startWd - 1; i >= 0; i--) {
    const d = new Date(y, m, -i)
    cells.push({ iso: toIso(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), current: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ iso: toIso(y, m, d), day: d, current: true })
  }

  const remain = 42 - cells.length
  for (let d = 1; d <= remain; d++) {
    const dt = new Date(y, m + 1, d)
    cells.push({ iso: toIso(dt.getFullYear(), dt.getMonth(), dt.getDate()), day: d, current: false })
  }

  return cells
})
</script>

<style scoped>
.month-calendar {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  padding: 16px;
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
  height: fit-content;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cal-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
.cal-arrow {
  width: 28px; height: 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  transition: all 0.15s;
  line-height: 1;
}
.cal-arrow:hover { background: var(--secondary); color: var(--primary); }

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.cal-wd {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 4px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
  gap: 2px;
}
.cal-cell:hover { background: var(--secondary); }

.cell-day {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
}

.cal-cell.other-month .cell-day {
  color: var(--text-muted);
  font-weight: 400;
}

.cal-cell.is-today {
  background: #ede9fe;
}
.cal-cell.is-today .cell-day {
  color: var(--primary);
  font-weight: 700;
}
.cal-cell.is-today:hover { background: #ddd6fe; }

.cal-cell.is-selected {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
}
.cal-cell.is-selected .cell-day {
  color: white;
  font-weight: 700;
}
.cal-cell.is-selected:hover {
  background: linear-gradient(135deg, var(--primary-dark), #7c3aed);
}

.cal-cell.is-today.is-selected {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
}
.cal-cell.is-today.is-selected .cell-day { color: white; }

.cell-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0.7;
}
.cal-cell.is-selected .cell-dot { background: white; opacity: 0.9; }
.cal-cell.other-month .cell-dot { background: var(--text-muted); }

.btn-goto-today {
  width: 100%;
  margin-top: 10px;
  padding: 6px;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-goto-today:hover {
  background: #ede9fe;
  border-color: var(--primary-light);
}
</style>
