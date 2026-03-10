import { ref, computed } from 'vue'
import * as api from '../api/todo'

export function useTodos() {
  // ───── 状态 ─────
  const todos = ref([])
  const selectedDate = ref('')
  const weekOffset = ref(0)
  const currentFilter = ref('all')
  const showModal = ref(false)
  const isEditing = ref(false)
  const deleteTarget = ref(null)
  const toast = ref({ show: false, msg: '', type: 'success' })
  const form = ref({ title: '', description: '', date: '', priority: 'medium', completed: false })
  let editingId = null

  // ───── 常量 ─────
  const filters = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待完成' },
    { key: 'completed', label: '已完成' }
  ]
  const priorities = [
    { key: 'low', label: '⬇ 低' },
    { key: 'medium', label: '➡ 中' },
    { key: 'high', label: '⬆ 高' }
  ]
  const priorityMap = { low: '低', medium: '中', high: '高' }

  // ───── 工具函数 ─────
  function toIso(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function formatFullDate(iso) {
    if (!iso) return ''
    const [y, m, day] = iso.split('-')
    const weekMap = ['日', '一', '二', '三', '四', '五', '六']
    const d = new Date(iso)
    return `${y}年${parseInt(m)}月${parseInt(day)}日 周${weekMap[d.getDay()]}`
  }

  function hasTodos(iso) {
    return todos.value.some(t => t.date === iso)
  }

  function shiftWeek(n) {
    weekOffset.value += n
  }

  // ───── 计算属性 ─────
  const todayIso = computed(() => toIso(new Date()))

  const weekDates = computed(() => {
    const dates = []
    const base = new Date()
    base.setDate(base.getDate() + weekOffset.value * 7)
    const day = base.getDay() === 0 ? 6 : base.getDay() - 1
    base.setDate(base.getDate() - day)
    const weeks = ['一', '二', '三', '四', '五', '六', '日']
    for (let i = 0; i < 7; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      dates.push({ iso: toIso(d), day: d.getDate(), week: weeks[i] })
    }
    return dates
  })

  const selectedTodos = computed(() =>
    todos.value.filter(t => t.date === selectedDate.value)
  )

  const filteredTodos = computed(() => {
    if (currentFilter.value === 'completed') return selectedTodos.value.filter(t => t.completed)
    if (currentFilter.value === 'pending') return selectedTodos.value.filter(t => !t.completed)
    return selectedTodos.value
  })

  const totalCount = computed(() => todos.value.length)
  const completedCount = computed(() => todos.value.filter(t => t.completed).length)
  const pendingCount = computed(() => todos.value.filter(t => !t.completed).length)

  const emptyText = computed(() => {
    if (currentFilter.value === 'completed') return '还没有完成的任务'
    if (currentFilter.value === 'pending') return '所有任务都完成了！'
    return '这天暂无任务'
  })

  // ───── 数据操作 ─────
  async function fetchTodos() {
    const res = await api.getTodos()
    todos.value = res.data
  }

  async function handleToggle(todo) {
    await api.toggleTodo(todo.id)
    await fetchTodos()
    showToast(todo.completed ? '任务已标为未完成' : '任务完成！🎉', 'success')
  }

  async function submitForm() {
    if (!form.value.title.trim()) return
    if (isEditing.value) {
      await api.updateTodo(editingId, {
        title: form.value.title,
        description: form.value.description,
        priority: form.value.priority,
        completed: form.value.completed
      })
      showToast('任务已更新', 'success')
    } else {
      await api.createTodo(form.value)
      showToast('任务创建成功', 'success')
    }
    await fetchTodos()
    closeModal()
  }

  async function doDelete() {
    await api.deleteTodo(deleteTarget.value.id)
    showToast('任务已删除', 'danger')
    deleteTarget.value = null
    await fetchTodos()
  }

  // ───── 弹窗控制 ─────
  function openAddModal(date) {
    isEditing.value = false
    editingId = null
    form.value = { title: '', description: '', date: date || selectedDate.value, priority: 'medium', completed: false }
    showModal.value = true
  }

  function openEditModal(todo) {
    isEditing.value = true
    editingId = todo.id
    form.value = { title: todo.title, description: todo.description || '', date: todo.date, priority: todo.priority, completed: todo.completed }
    showModal.value = true
  }

  function closeModal() { showModal.value = false }

  function confirmDelete(todo) { deleteTarget.value = todo }

  // ───── Toast ─────
  function showToast(msg, type = 'success') {
    toast.value = { show: true, msg, type }
    setTimeout(() => { toast.value.show = false }, 2500)
  }

  return {
    // 状态
    todos, selectedDate, weekOffset, currentFilter,
    showModal, isEditing, deleteTarget, toast, form,
    // 常量
    filters, priorities, priorityMap,
    // 计算属性
    todayIso, weekDates, selectedTodos, filteredTodos,
    totalCount, completedCount, pendingCount, emptyText,
    // 方法
    toIso, formatFullDate, hasTodos, shiftWeek,
    fetchTodos, handleToggle, submitForm, doDelete,
    openAddModal, openEditModal, closeModal, confirmDelete, showToast
  }
}
