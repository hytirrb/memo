<template>
  <transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? '编辑任务' : '新建任务' }}</h3>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📅</span> 日期
              <span v-if="isEditing" class="label-tip">（编辑时日期保持不变）</span>
            </label>
            <div v-if="isEditing" class="date-readonly">{{ formatFullDate(form.date) }}</div>
            <input v-else type="date" v-model="form.date" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label"><span class="label-icon">📝</span> 任务标题</label>
            <input
              type="text"
              v-model="form.title"
              class="form-input"
              placeholder="请输入任务标题…"
              @keydown.enter="$emit('submit')"
            />
          </div>

          <div class="form-group">
            <div class="desc-label-row">
              <label class="form-label"><span class="label-icon">💬</span> 备注说明（支持 Markdown）</label>
              <div class="preview-toggle">
                <button :class="{ active: descTab === 'edit' }" @click="descTab = 'edit'">编辑</button>
                <button :class="{ active: descTab === 'preview' }" @click="descTab = 'preview'">预览</button>
              </div>
            </div>
            <textarea
              v-if="descTab === 'edit'"
              v-model="form.description"
              class="form-input form-textarea"
              placeholder="支持 Markdown：**加粗** _斜体_ `代码` - 列表 ..."
              rows="4"
            ></textarea>
            <div
              v-else
              class="md-preview"
              v-html="previewHtml"
            ></div>
          </div>

          <!-- 完成状态勾选 -->
          <div class="form-group">
            <label class="completed-toggle" :class="{ checked: form.completed }" @click="form.completed = !form.completed">
              <span class="toggle-box">
                <span v-if="form.completed" class="toggle-check">✓</span>
              </span>
              <span class="toggle-label">标记为已完成</span>
            </label>
          </div>

          <div class="form-group">
            <label class="form-label"><span class="label-icon">🔥</span> 优先级</label>
            <div class="priority-selector">
              <button
                v-for="p in priorities"
                :key="p.key"
                class="priority-btn"
                :class="[`pb-${p.key}`, { active: form.priority === p.key }]"
                @click="form.priority = p.key"
              >{{ p.label }}</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn-submit" @click="$emit('submit')" :disabled="!form.title.trim()">
            {{ isEditing ? '保存修改' : '创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

marked.setOptions({ breaks: true })

const props = defineProps({
  show: Boolean,
  isEditing: Boolean,
  form: Object,
  priorities: Array,
  formatFullDate: Function
})
defineEmits(['close', 'submit'])

const descTab = ref('edit')

const previewHtml = computed(() =>
  props.form?.description ? marked.parse(props.form.description) : '<p style="color:#94a3b8">暂无内容</p>'
)
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.modal-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%; max-width: 480px;
  animation: slideDown 0.3s ease;
}
.modal-header {
  padding: 20px 24px 0;
  display: flex; align-items: center; justify-content: space-between;
}
.modal-title { font-size: 18px; font-weight: 700; }
.modal-close {
  width: 30px; height: 30px;
  border: none; background: var(--secondary);
  border-radius: 50%; cursor: pointer; font-size: 13px; color: var(--text-secondary);
  transition: all 0.2s;
}
.modal-close:hover { background: #fee2e2; color: var(--danger); }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { padding: 0 24px 24px; display: flex; gap: 10px; justify-content: flex-end; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label {
  font-size: 13px; font-weight: 600; color: var(--text-secondary);
  display: flex; align-items: center; gap: 6px;
}
.label-icon { font-size: 14px; }
.label-tip { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.form-input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px; color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none; width: 100%; background: white; font-family: inherit;
}
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-textarea { resize: vertical; min-height: 100px; font-family: 'Courier New', monospace; font-size: 13px; }

.desc-label-row { display: flex; align-items: center; justify-content: space-between; }
.preview-toggle {
  display: flex; gap: 2px;
  background: var(--secondary); padding: 3px; border-radius: 7px;
}
.preview-toggle button {
  padding: 3px 10px; border: none; border-radius: 5px;
  font-size: 12px; font-weight: 500; cursor: pointer;
  background: transparent; color: var(--text-muted); transition: all 0.2s;
}
.preview-toggle button.active {
  background: white; color: var(--primary);
  box-shadow: var(--shadow-sm); font-weight: 600;
}

.md-preview {
  min-height: 100px; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: 14px; line-height: 1.7; color: var(--text-primary);
  background: #fafafa;
}
.md-preview :deep(p) { margin: 0 0 6px; }
.md-preview :deep(p:last-child) { margin-bottom: 0; }
.md-preview :deep(strong) { font-weight: 700; }
.md-preview :deep(em) { font-style: italic; }
.md-preview :deep(code) {
  background: #f1f5f9; padding: 1px 6px;
  border-radius: 4px; font-size: 13px; font-family: monospace; color: #6366f1;
}
.md-preview :deep(pre) {
  background: #1e293b; color: #e2e8f0;
  padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0;
}
.md-preview :deep(pre code) { background: none; color: inherit; padding: 0; }
.md-preview :deep(ul), .md-preview :deep(ol) { padding-left: 20px; margin: 4px 0; }
.md-preview :deep(li) { margin: 3px 0; }
.md-preview :deep(blockquote) {
  border-left: 3px solid var(--primary-light); padding-left: 12px;
  margin: 6px 0; color: var(--text-secondary); font-style: italic;
}
.md-preview :deep(h1) { font-size: 18px; font-weight: 800; margin: 6px 0; }
.md-preview :deep(h2) { font-size: 16px; font-weight: 700; margin: 5px 0; }
.md-preview :deep(h3) { font-size: 14px; font-weight: 700; margin: 4px 0; }
.md-preview :deep(a) { color: var(--primary); text-decoration: underline; }
.md-preview :deep(hr) { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
.date-readonly {
  padding: 10px 14px;
  background: var(--secondary);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px; color: var(--text-secondary); font-weight: 600;
}
.priority-selector { display: flex; gap: 8px; }
.priority-btn {
  flex: 1; padding: 8px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 600;
  cursor: pointer; background: white;
  transition: all 0.2s; color: var(--text-secondary);
}
.priority-btn.pb-high.active { border-color: var(--danger); background: #fee2e2; color: var(--danger); }
.priority-btn.pb-medium.active { border-color: var(--warning); background: #fef9c3; color: #b45309; }
.priority-btn.pb-low.active { border-color: var(--success); background: #dcfce7; color: #16a34a; }
.priority-btn:hover { border-color: var(--primary); }

.completed-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.completed-toggle:hover { border-color: var(--success); background: #f0fdf4; }
.completed-toggle.checked { border-color: var(--success); background: #f0fdf4; }
.toggle-box {
  width: 20px; height: 20px; flex-shrink: 0;
  border-radius: 6px;
  border: 2px solid var(--border);
  background: white;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  font-size: 12px; font-weight: 700; color: white;
}
.completed-toggle.checked .toggle-box { background: var(--success); border-color: var(--success); }
.toggle-label { font-size: 14px; font-weight: 500; color: var(--text-secondary); }
.completed-toggle.checked .toggle-label { color: var(--success); font-weight: 600; }

.btn-cancel {
  padding: 9px 20px;
  border: 1.5px solid var(--border); border-radius: 20px;
  background: white; color: var(--text-secondary);
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: var(--secondary); }
.btn-submit {
  padding: 9px 24px; border: none; border-radius: 20px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
