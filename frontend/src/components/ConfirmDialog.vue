<template>
  <transition name="fade">
    <div v-if="target" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="confirm-card">
        <div class="confirm-icon">🗑️</div>
        <h3 class="confirm-title">删除任务</h3>
        <p class="confirm-msg">确认删除「{{ target?.title }}」吗？此操作不可撤销。</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="$emit('cancel')">取消</button>
          <button class="btn-danger" @click="$emit('confirm')">确认删除</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({ target: Object })
defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.confirm-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 36px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  text-align: center;
  animation: slideDown 0.3s ease;
}
.confirm-icon { font-size: 48px; }
.confirm-title { font-size: 18px; font-weight: 700; }
.confirm-msg { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.confirm-actions { display: flex; gap: 10px; margin-top: 8px; }
.btn-cancel {
  padding: 9px 20px;
  border: 1.5px solid var(--border); border-radius: 20px;
  background: white; color: var(--text-secondary);
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: var(--secondary); }
.btn-danger {
  padding: 9px 24px; border: none; border-radius: 20px;
  background: var(--danger); color: white;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-danger:hover { background: #dc2626; transform: translateY(-1px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
