<template>
  <div class="settings-page">
    <h2 class="settings-title">⚙️ 设置</h2>

    <div class="settings-grid">
      <!-- 导出卡片 -->
      <div class="settings-card">
        <div class="card-icon">📤</div>
        <div class="card-body">
          <h3 class="card-title">导出备份</h3>
          <p class="card-desc">将所有待办数据导出为 JSON 文件，保存到本地作为备份。</p>
          <button class="btn-export" @click="handleExport" :disabled="exporting">
            {{ exporting ? '导出中...' : '导出 JSON' }}
          </button>
        </div>
      </div>

      <!-- 导入卡片 -->
      <div class="settings-card">
        <div class="card-icon">📥</div>
        <div class="card-body">
          <h3 class="card-title">导入恢复</h3>
          <p class="card-desc">从本地 JSON 备份文件恢复待办数据。导入时会与现有数据合并（不重复）。</p>
          <label class="btn-import">
            {{ importing ? '导入中...' : '选择文件' }}
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              style="display:none"
              @change="handleImport"
              :disabled="importing"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- 按时间段查询 -->
    <div class="settings-card">
      <div class="card-icon">🔍</div>
      <div class="card-body">
        <h3 class="card-title">按时间段查询任务</h3>
        <p class="card-desc">查询指定日期范围内的所有任务，结果按日期排列显示。</p>
        <div class="date-range-row">
          <div class="date-field">
            <label class="date-label">开始日期</label>
            <input type="date" v-model="queryStart" class="date-input" />
          </div>
          <span class="range-sep">—</span>
          <div class="date-field">
            <label class="date-label">结束日期</label>
            <input type="date" v-model="queryEnd" class="date-input" />
          </div>
          <button
            class="btn-query"
            @click="handleQuery"
            :disabled="!queryStart || !queryEnd"
          >查询</button>
        </div>
        <span v-if="queryStart && queryEnd && queryStart > queryEnd" class="range-warn">开始日期不能晚于结束日期</span>
      </div>
    </div>

    <!-- 查询结果 -->
    <div v-if="queryResult !== null" class="query-result-section">
      <div class="query-result-header">
        <span class="query-result-title">查询结果：{{ queryStart }} 至 {{ queryEnd }}</span>
        <span class="query-result-count">共 {{ queryResult.length }} 条</span>
        <button class="btn-close-query" @click="queryResult = null">✕</button>
      </div>
      <div v-if="queryResult.length === 0" class="query-empty">该时间段内没有任何任务</div>
      <div v-else class="query-list">
        <div
          v-for="group in queryGroups"
          :key="group.date"
          class="query-group"
        >
          <div class="query-group-date">{{ group.date }}</div>
          <div
            v-for="item in group.todos"
            :key="item.id"
            class="query-item"
            :class="[`priority-${item.priority}`, { completed: item.completed }]"
          >
            <span class="query-check">{{ item.completed ? '✓' : '○' }}</span>
            <span class="query-title">{{ item.title }}</span>
            <span class="query-badge" :class="`p-${item.priority}`">{{ priorityLabel[item.priority] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 按标题搜索 -->
    <div class="settings-card">
      <div class="card-icon">✨</div>
      <div class="card-body">
        <h3 class="card-title">按标题搜索任务</h3>
        <p class="card-desc">输入关键词搜索任务标题，查看该任务所在的日期。</p>
        <div class="search-row">
          <input
            type="text"
            v-model="searchKeyword"
            class="search-input"
            placeholder="输入任务标题关键词..."
            @keyup.enter="handleSearch"
          />
          <button
            class="btn-query"
            @click="handleSearch"
            :disabled="!searchKeyword.trim()"
          >搜索</button>
          <button
            v-if="searchResult !== null"
            class="btn-close-query"
            @click="searchResult = null; searchKeyword = ''"
            title="清除搜索"
          >✕</button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResult !== null" class="query-result-section">
      <div class="query-result-header">
        <span class="query-result-title">搜索「{{ searchKeyword }}」的结果</span>
        <span class="query-result-count">共 {{ searchResult.length }} 条</span>
        <button class="btn-close-query" @click="searchResult = null">✕</button>
      </div>
      <div v-if="searchResult.length === 0" class="query-empty">未找到匹配的任务</div>
      <div v-else class="query-list">
        <div
          v-for="item in searchResult"
          :key="item.id"
          class="query-item search-item"
          :class="[`priority-${item.priority}`, { completed: item.completed }]"
        >
          <span class="query-check">{{ item.completed ? '✓' : '○' }}</span>
          <span class="search-item-title">{{ item.title }}</span>
          <span class="search-item-date">📅 {{ item.date }}</span>
          <span class="query-badge" :class="`p-${item.priority}`">{{ priorityLabel[item.priority] }}</span>
        </div>
      </div>
    </div>

    <!-- 按时间段删除 -->
    <div class="settings-card danger-card">
      <div class="card-icon">🗑️</div>
      <div class="card-body">
        <h3 class="card-title">按时间段删除任务</h3>
        <p class="card-desc">删除指定日期范围内的所有任务，此操作不可恢复，请谨慎操作。</p>
        <div class="date-range-row">
          <div class="date-field">
            <label class="date-label">开始日期</label>
            <input type="date" v-model="rangeStart" class="date-input" />
          </div>
          <span class="range-sep">—</span>
          <div class="date-field">
            <label class="date-label">结束日期</label>
            <input type="date" v-model="rangeEnd" class="date-input" />
          </div>
        </div>
        <div class="delete-range-actions">
          <button
            class="btn-delete-range"
            @click="handleDeleteRange"
            :disabled="deleting || !rangeStart || !rangeEnd"
          >
            {{ deleting ? '删除中...' : '删除该时间段任务' }}
          </button>
          <span v-if="rangeStart && rangeEnd && rangeStart > rangeEnd" class="range-warn">开始日期不能晚于结束日期</span>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="confirm-mask" @click.self="showDeleteConfirm = false">
      <div class="confirm-box">
        <div class="confirm-icon">⚠️</div>
        <h3 class="confirm-title">确认删除</h3>
        <p class="confirm-desc">
          将删除 <strong>{{ rangeStart }}</strong> 至 <strong>{{ rangeEnd }}</strong> 期间的所有任务，操作不可恢复。
        </p>
        <div class="confirm-actions">
          <button class="btn-confirm-delete" @click="doDeleteRange" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
          <button class="btn-cancel" @click="showDeleteConfirm = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 操作结果提示 -->
    <transition name="fade">
      <div v-if="msg.text" class="result-msg" :class="msg.type">
        {{ msg.text }}
      </div>
    </transition>

    <!-- 数据预览 -->
    <div v-if="previewItems.length > 0" class="preview-section">
      <h3 class="preview-title">导入预览（{{ previewItems.length }} 条）</h3>
      <div class="preview-list">
        <div v-for="item in previewItems" :key="item.id" class="preview-item">
          <span class="preview-date">{{ item.date }}</span>
          <span class="preview-text">{{ item.title }}</span>
          <span class="preview-badge" :class="`p-${item.priority}`">{{ priorityLabel[item.priority] }}</span>
          <span v-if="item.completed" class="preview-done">✓</span>
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn-confirm-import" @click="confirmImport" :disabled="importing">
          {{ importing ? '导入中...' : `确认导入 ${previewItems.length} 条` }}
        </button>
        <button class="btn-cancel" @click="previewItems = []">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const emit = defineEmits(['imported'])

const exporting = ref(false)
const importing = ref(false)
const deleting = ref(false)
const previewItems = ref([])
const fileInput = ref(null)
const msg = ref({ text: '', type: '' })
const rangeStart = ref('')
const rangeEnd = ref('')
const showDeleteConfirm = ref(false)
const queryStart = ref('')
const queryEnd = ref('')
const queryResult = ref(null)
const searchKeyword = ref('')
const searchResult = ref(null)

const queryGroups = computed(() => {
  if (!queryResult.value) return []
  const map = {}
  for (const t of queryResult.value) {
    if (!map[t.date]) map[t.date] = []
    map[t.date].push(t)
  }
  return Object.keys(map).sort().map(date => ({ date, todos: map[date] }))
})

const priorityLabel = { high: '高', medium: '中', low: '低' }

function showMsg(text, type = 'success') {
  msg.value = { text, type }
  setTimeout(() => { msg.value = { text: '', type: '' } }, 4000)
}

async function handleExport() {
  exporting.value = true
  try {
    const res = await axios.get('/todos')
    const json = JSON.stringify(res.data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showMsg(`导出成功！共 ${res.data.length} 条待办数据。`)
  } catch {
    showMsg('导出失败，请检查后端是否正常运行。', 'error')
  } finally {
    exporting.value = false
  }
}

function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  // 重置 input，以便再次选同一文件时触发 change
  e.target.value = ''

  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!Array.isArray(data)) {
        showMsg('文件格式错误：根节点应为数组。', 'error')
        return
      }
      previewItems.value = data
    } catch {
      showMsg('文件解析失败，请确认是有效的 JSON 文件。', 'error')
    }
  }
  reader.readAsText(file)
}

async function confirmImport() {
  importing.value = true
  try {
    const res = await axios.post('/todos/import', previewItems.value)
    previewItems.value = []
    showMsg(`导入成功！新增 ${res.data.imported} 条，跳过 ${res.data.skipped} 条（已存在）。`)
    emit('imported')
  } catch {
    showMsg('导入失败，请检查后端是否正常运行。', 'error')
  } finally {
    importing.value = false
  }
}

async function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (!kw) return
  const res = await axios.get('/todos')
  searchResult.value = res.data.filter(t =>
    t.title.toLowerCase().includes(kw.toLowerCase())
  )
}

async function handleQuery() {
  if (!queryStart.value || !queryEnd.value) return
  if (queryStart.value > queryEnd.value) return
  const res = await axios.get('/todos')
  queryResult.value = res.data.filter(t => t.date >= queryStart.value && t.date <= queryEnd.value)
}

function handleDeleteRange() {
  if (!rangeStart.value || !rangeEnd.value) return
  if (rangeStart.value > rangeEnd.value) return
  showDeleteConfirm.value = true
}

async function doDeleteRange() {
  deleting.value = true
  try {
    const res = await axios.delete('/todos/range', {
      params: { start: rangeStart.value, end: rangeEnd.value }
    })
    showDeleteConfirm.value = false
    showMsg(`已删除 ${res.data.deleted} 条任务（${rangeStart.value} 至 ${rangeEnd.value}）。`)
    rangeStart.value = ''
    rangeEnd.value = ''
    emit('imported')
  } catch {
    showMsg('删除失败，请检查后端是否正常运行。', 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.settings-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-icon {
  font-size: 36px;
  line-height: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.btn-export, .btn-import {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: fit-content;
}

.btn-export {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}
.btn-export:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
.btn-export:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-import {
  background: #f0fdf4;
  color: #16a34a;
  border: 1.5px solid #bbf7d0;
  cursor: pointer;
}
.btn-import:hover { background: #dcfce7; border-color: #86efac; }

/* 提示 */
.result-msg {
  padding: 12px 18px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
}
.result-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.result-msg.error { background: #fff1f2; color: #dc2626; border: 1px solid #fecaca; }

/* 预览区 */
.preview-section {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--secondary);
  font-size: 13px;
}

.preview-date {
  color: var(--text-muted);
  font-size: 12px;
  flex-shrink: 0;
  width: 90px;
}
.preview-text {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview-badge {
  padding: 1px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.preview-badge.p-high { background: #fee2e2; color: #dc2626; }
.preview-badge.p-medium { background: #fef9c3; color: #b45309; }
.preview-badge.p-low { background: #dcfce7; color: #16a34a; }
.preview-done { color: #16a34a; font-weight: 700; flex-shrink: 0; }

.preview-actions {
  display: flex;
  gap: 10px;
}

.btn-confirm-import {
  padding: 9px 20px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(22,163,74,0.3);
}
.btn-confirm-import:hover:not(:disabled) { transform: translateY(-1px); }
.btn-confirm-import:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancel {
  padding: 9px 20px;
  background: white;
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { background: var(--secondary); }

/* 标题搜索 */
.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 180px;
  padding: 7px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  background: white;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--primary); }
.search-item { flex-wrap: wrap; }
.search-item-title { flex: 1; color: var(--text-primary); font-weight: 500; }
.search-item-date {
  font-size: 12px;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

/* 查询按钮 */
.btn-query {
  padding: 7px 18px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-end;
  white-space: nowrap;
}
.btn-query:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
.btn-query:disabled { opacity: 0.45; cursor: not-allowed; }

/* 查询结果区 */
.query-result-section {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.query-result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
}
.query-result-title { font-size: 14px; font-weight: 600; color: var(--text-primary); flex: 1; }
.query-result-count {
  font-size: 12px; font-weight: 600;
  padding: 2px 10px; border-radius: 12px;
  background: #e0e7ff; color: var(--primary);
}
.btn-close-query {
  width: 24px; height: 24px; border-radius: 6px; border: none;
  background: var(--secondary); color: var(--text-muted);
  cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.btn-close-query:hover { background: #fee2e2; color: var(--danger); }

.query-empty {
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
.query-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.query-group { display: flex; flex-direction: column; gap: 4px; }
.query-group-date {
  font-size: 12px; font-weight: 700;
  color: var(--text-muted);
  padding: 6px 4px 2px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2px;
}
.query-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border-left: 3px solid transparent;
  background: var(--secondary);
  font-size: 14px;
}
.query-item.priority-high   { border-left-color: var(--danger); }
.query-item.priority-medium { border-left-color: var(--warning); }
.query-item.priority-low    { border-left-color: var(--success); }
.query-item.completed { opacity: 0.5; }
.query-check { color: var(--success); font-weight: 700; flex-shrink: 0; width: 16px; }
.query-title { flex: 1; color: var(--text-primary); font-weight: 500; }
.query-badge {
  font-size: 11px; font-weight: 600;
  padding: 1px 7px; border-radius: 6px; flex-shrink: 0;
}
.query-badge.p-high   { background: #fee2e2; color: #dc2626; }
.query-badge.p-medium { background: #fef9c3; color: #b45309; }
.query-badge.p-low    { background: #dcfce7; color: #16a34a; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 时间段删除卡片 */
.danger-card {
  border-color: #fecaca;
  background: #fffafa;
}
.danger-card .card-title { color: #dc2626; }

.date-range-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.date-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.date-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.date-input {
  padding: 7px 10px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
  background: white;
  cursor: pointer;
}
.date-input:focus { border-color: var(--danger); }
.range-sep {
  font-size: 16px;
  color: var(--text-muted);
  padding-bottom: 7px;
}

.delete-range-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-delete-range {
  padding: 9px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete-range:hover:not(:disabled) { background: #b91c1c; }
.btn-delete-range:disabled { opacity: 0.5; cursor: not-allowed; }
.range-warn { font-size: 12px; color: #dc2626; }

/* 确认弹窗 */
.confirm-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-box {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.confirm-icon { font-size: 40px; }
.confirm-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0; }
.confirm-desc { font-size: 14px; color: var(--text-secondary); text-align: center; margin: 0; line-height: 1.6; }
.confirm-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-confirm-delete {
  padding: 9px 24px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-confirm-delete:hover:not(:disabled) { background: #b91c1c; }
.btn-confirm-delete:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
  .settings-grid { grid-template-columns: 1fr; }
  .date-range-row { flex-direction: column; align-items: stretch; }
  .range-sep { display: none; }
}
</style>
