<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },   // 弹窗是否可见
  title: { type: String, default: '' },         // 弹窗标题
  content: { type: String, default: '' },       // 弹窗内容（HTML 字符串）
  properties: { type: Object, default: () => ({}) }, // 要素属性键值对
  position: { type: String, default: '' },      // 坐标文本（如 "116.40, 39.90"）
})

const emit = defineEmits(['close'])

// 将属性对象格式化为可读的表格行
const formattedProperties = computed(() => {
  if (!props.properties || Object.keys(props.properties).length === 0) return []
  return Object.entries(props.properties)
    .filter(([key]) => !key.startsWith('_')) // 过滤内部属性
    .map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-'),
    }))
})
</script>

<template>
  <Transition name="popup-fade">
    <div v-if="visible" class="map-popup">
      <!-- 关闭按钮 -->
      <button class="popup-close" @click="emit('close')" title="关闭">×</button>

      <!-- 标题 -->
      <div v-if="title" class="popup-title">{{ title }}</div>

      <!-- 坐标信息 -->
      <div v-if="position" class="popup-position">
        <span class="label">坐标:</span>
        <span class="value">{{ position }}</span>
      </div>

      <!-- 内容 -->
      <div v-if="content" class="popup-content" v-html="content" />

      <!-- 属性表格 -->
      <table v-if="formattedProperties.length" class="popup-table">
        <tbody>
          <tr v-for="prop in formattedProperties" :key="prop.label">
            <td class="prop-label">{{ prop.label }}</td>
            <td class="prop-value">{{ prop.value }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 底部箭头 -->
      <div class="popup-arrow" />
    </div>
  </Transition>
</template>

<style scoped>
.map-popup {
  position: relative;
  min-width: 200px;
  max-width: 320px;
  padding: 12px 16px;
  background: var(--bg, #fff);
  border: 1px solid var(--border, #d9dee7);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  font-size: 13px;
  color: var(--text-h, #12161c);
}

.popup-close {
  position: absolute;
  top: 4px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  color: var(--text, #5b6472);
  border-radius: 4px;
}

.popup-close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.popup-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-right: 16px;
  color: var(--text-h, #12161c);
}

.popup-position {
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: var(--text, #5b6472);
  margin-bottom: 6px;
}

.popup-position .label {
  opacity: 0.7;
}

.popup-content {
  margin-bottom: 8px;
  line-height: 1.5;
}

.popup-table {
  width: 100%;
  border-collapse: collapse;
}

.popup-table td {
  padding: 3px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.popup-table .prop-label {
  width: 80px;
  color: var(--text, #5b6472);
  font-weight: 500;
}

.popup-table .prop-value {
  color: var(--text-h, #12161c);
  word-break: break-all;
}

.popup-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid var(--bg, #fff);
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.08));
}

/* 过渡动画 */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
