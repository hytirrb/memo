<template>
  <transition name="fade">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span>{{ toast.msg }}</span>
    </div>
  </transition>
</template>

<script setup>
defineProps({ toast: Object })
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 32px; left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 14px; font-weight: 600;
  background: #1e293b; color: white;
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
}
.toast.success { background: #16a34a; }
.toast.danger { background: var(--danger); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
