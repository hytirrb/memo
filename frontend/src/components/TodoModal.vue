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
            <label class="form-label"><span class="label-icon">💬</span> 备注说明（选填）</label>
            <textarea
              v-model="form.description"
              class="form-input form-textarea"
              placeholder="添加更多描述…"
              rows="3"
            ></textarea>
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
defineProps({
  show: Boolean,
  isEditing: Boolean,
  form: Object,
  priorities: Array,
  formatFullDate: Function
})
defineEmits(['close', 'submit'])
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
.form-textarea { resize: vertical; min-height: 80px; }
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
