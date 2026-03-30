<template>
  <div class="app-wrapper">
    <AppHeader
      :totalCount="totalCount"
      :completedCount="completedCount"
      :pendingCount="pendingCount"
      :currentPage="currentPage"
      @add="openAddModal(selectedDate)"
      @switchPage="currentPage = $event"
      @toggleCalendar="showCalendar = !showCalendar"
    />

    <main class="main-content">
      <!-- 设置页面：全宽，不显示月历 -->
      <SettingsPage
        v-if="currentPage === 'settings'"
        @imported="fetchTodos"
      />

      <!-- 今日 / 总览：左侧月历 + 右侧内容 -->
      <div v-else class="page-layout">

        <!-- 左侧月历 -->
        <MonthCalendar
          v-if="showCalendar"
          :selectedDate="selectedDate"
          :todayIso="todayIso"
          :hasTodos="hasTodos"
          @select="selectedDate = $event"
        />

        <!-- 右侧内容区 -->
        <div class="page-right">

          <!-- 今日视图 -->
          <template v-if="currentPage === 'daily'">
            <DateNav
              :weekDates="weekDates"
              :selectedDate="selectedDate"
              :todayIso="todayIso"
              :hasTodos="hasTodos"
              @shift="shiftWeek"
              @select="selectedDate = $event"
            />

            <div class="date-section-header">
              <div class="date-title-wrap">
                <h2 class="date-title">{{ formatFullDate(selectedDate) }}</h2>
                <span v-if="selectedDate === todayIso" class="today-badge">今天</span>
              </div>
              <div class="filter-tabs">
                <button
                  v-for="f in filters"
                  :key="f.key"
                  class="filter-tab"
                  :class="{ active: currentFilter === f.key }"
                  @click="currentFilter = f.key"
                >{{ f.label }}</button>
              </div>
            </div>

            <TodoList
              :filteredTodos="filteredTodos"
              :currentFilter="currentFilter"
              :emptyText="emptyText"
              :priorityMap="priorityMap"
              @toggle="handleToggle"
              @edit="openEditModal"
              @delete="confirmDelete"
              @add="openAddModal(selectedDate)"
            />
          </template>

          <!-- 总览视图 -->
          <OverviewPage
            v-else-if="currentPage === 'overview'"
            :todos="todos"
            :priorityMap="priorityMap"
            :formatFullDate="formatFullDate"
            :todayIso="todayIso"
            @toggle="handleToggle"
            @edit="openEditModal"
            @delete="confirmDelete"
          />
        </div>
      </div>
    </main>

    <TodoModal
      :show="showModal"
      :isEditing="isEditing"
      :form="form"
      :priorities="priorities"
      :formatFullDate="formatFullDate"
      @close="closeModal"
      @submit="submitForm"
    />

    <ConfirmDialog
      :target="deleteTarget"
      @cancel="deleteTarget = null"
      @confirm="doDelete"
    />

    <ToastNotify :toast="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTodos } from './composables/useTodos'
import AppHeader from './components/AppHeader.vue'
import DateNav from './components/DateNav.vue'
import MonthCalendar from './components/MonthCalendar.vue'
import TodoList from './components/TodoList.vue'
import OverviewPage from './components/OverviewPage.vue'
import SettingsPage from './components/SettingsPage.vue'
import TodoModal from './components/TodoModal.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ToastNotify from './components/ToastNotify.vue'

const currentPage = ref('daily')
const showCalendar = ref(true)

const {
  todos, selectedDate, currentFilter, showModal, isEditing, deleteTarget, toast, form,
  filters, priorities, priorityMap,
  todayIso, weekDates, filteredTodos,
  totalCount, completedCount, pendingCount, emptyText,
  formatFullDate, hasTodos, shiftWeek,
  fetchTodos, handleToggle, submitForm, doDelete,
  openAddModal, openEditModal, closeModal, confirmDelete
} = useTodos()

onMounted(async () => {
  selectedDate.value = todayIso.value
  await fetchTodos()
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%);
}
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 24px 48px;
  flex: 1;
}

/* 双栏布局 */
.page-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.page-right {
  flex: 1;
  min-width: 0;
}

.date-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.date-title-wrap { display: flex; align-items: center; gap: 10px; }
.date-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.today-badge {
  padding: 2px 10px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; border-radius: 12px;
  font-size: 12px; font-weight: 600;
}
.filter-tabs {
  display: flex; gap: 4px;
  background: var(--secondary);
  padding: 4px; border-radius: 10px;
}
.filter-tab {
  padding: 5px 14px; border: none; border-radius: 7px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  background: transparent; color: var(--text-secondary); transition: all 0.2s;
}
.filter-tab.active {
  background: white; color: var(--primary);
  box-shadow: var(--shadow-sm); font-weight: 600;
}

@media (max-width: 768px) {
  .page-layout { flex-direction: column; }
  .main-content { padding: 16px 16px 48px; }
  .date-title { font-size: 15px; }
}
</style>
