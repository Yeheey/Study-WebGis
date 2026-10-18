<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  activeTool: { type: String, default: '' },     // 当前激活的交互工具
  activeLayers: { type: Object, default: () => ({}) }, // 图层可见性状态
  measureResult: { type: String, default: '' },  // 测量结果文本
})

const emit = defineEmits([
  'tool-change',      // 切换交互工具: (toolName) => void
  'layer-toggle',     // 切换图层: (layerName, visible) => void
  'clear-draw',       // 清除绘制
  'clear-measure',    // 清除测量
  'fit-extent',       // 缩放到范围
  'export-geojson',   // 导出 GeoJSON
])

// 交互工具列表
const tools = [
  { name: 'none',      label: '平移',   icon: '✋',  description: '拖拽平移地图' },
  { name: 'draw-point', label: '画点',  icon: '📍', description: '点击地图绘制点要素' },
  { name: 'draw-line',  label: '画线',  icon: '📏', description: '点击绘制线要素，双击结束' },
  { name: 'draw-polygon', label: '画面', icon: '⬡',  description: '点击绘制多边形，双击结束' },
  { name: 'draw-circle', label: '画圆', icon: '⭕',  description: '点击圆心并拖拽绘制圆形' },
  { name: 'modify',     label: '编辑',  icon: '✏️',  description: '拖拽节点修改已绘制要素' },
  { name: 'select',     label: '选择',  icon: '👆',  description: '点击选择要素查看属性' },
  { name: 'measure-line', label: '测距', icon: '📐', description: '点击测量线段距离，双击结束' },
  { name: 'measure-area', label: '测面', icon: '📐', description: '点击测量多边形面积，双击结束' },
]

// 图层列表
const layerList = computed(() => [
  { name: 'base',    label: 'OSM 底图',    visible: props.activeLayers.base ?? true },
  { name: 'cities',  label: '城市标记',    visible: props.activeLayers.cities ?? true },
  { name: 'routes',  label: '路线数据',    visible: props.activeLayers.routes ?? false },
  { name: 'regions', label: '区域数据',    visible: props.activeLayers.regions ?? false },
  { name: 'mixed',   label: '混合几何',    visible: props.activeLayers.mixed ?? false },
  { name: 'heatmap', label: '热力图',      visible: props.activeLayers.heatmap ?? false },
  { name: 'cluster', label: '聚类图层',    visible: props.activeLayers.cluster ?? false },
])

function selectTool(name) {
  emit('tool-change', name)
}

function toggleLayer(name, visible) {
  emit('layer-toggle', name, visible)
}
</script>

<template>
  <div class="map-toolbar">
    <!-- 交互工具区 -->
    <div class="toolbar-section">
      <div class="section-title">交互工具</div>
      <div class="tool-buttons">
        <button
          v-for="tool in tools"
          :key="tool.name"
          class="tool-btn"
          :class="{ active: activeTool === tool.name }"
          :title="tool.description"
          @click="selectTool(tool.name)"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <span class="tool-label">{{ tool.label }}</span>
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn" title="清除绘制要素" @click="emit('clear-draw')">清除绘制</button>
        <button class="action-btn" title="清除测量结果" @click="emit('clear-measure')">清除测量</button>
        <button class="action-btn" title="缩放到所有要素范围" @click="emit('fit-extent')">全图范围</button>
        <button class="action-btn" title="导出绘制要素为 GeoJSON" @click="emit('export-geojson')">导出JSON</button>
      </div>

      <!-- 测量结果 -->
      <div v-if="measureResult" class="measure-result">
        <span class="label">测量结果:</span>
        <span class="value">{{ measureResult }}</span>
      </div>
    </div>

    <!-- 图层控制区 -->
    <div class="toolbar-section">
      <div class="section-title">图层控制</div>
      <div class="layer-list">
        <label
          v-for="layer in layerList"
          :key="layer.name"
          class="layer-item"
        >
          <input
            type="checkbox"
            :checked="layer.visible"
            @change="toggleLayer(layer.name, $event.target.checked)"
          />
          <span class="layer-label">{{ layer.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-toolbar {
  width: 260px;
  height: 100%;
  background: var(--bg, #f7f8fa);
  border-right: 1px solid var(--border, #d9dee7);
  overflow-y: auto;
  flex-shrink: 0;
}

.toolbar-section {
  padding: 12px;
  border-bottom: 1px solid var(--border, #d9dee7);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text, #5b6472);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.tool-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border: 1px solid var(--border, #d9dee7);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  color: var(--text, #5b6472);
  transition: all 0.15s;
}

.tool-btn:hover {
  background: rgba(24, 144, 255, 0.06);
  border-color: #1890ff;
  color: #1890ff;
}

.tool-btn.active {
  background: rgba(24, 144, 255, 0.1);
  border-color: #1890ff;
  color: #1890ff;
  font-weight: 600;
}

.tool-icon {
  font-size: 16px;
  line-height: 1;
}

.tool-label {
  font-size: 11px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-btn {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 5px 8px;
  border: 1px solid var(--border, #d9dee7);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: var(--text, #5b6472);
  transition: all 0.15s;
}

.action-btn:hover {
  background: rgba(24, 144, 255, 0.06);
  border-color: #1890ff;
  color: #1890ff;
}

.measure-result {
  margin-top: 8px;
  padding: 6px 8px;
  background: rgba(24, 144, 255, 0.06);
  border-radius: 4px;
  font-size: 12px;
}

.measure-result .label {
  color: var(--text, #5b6472);
}

.measure-result .value {
  color: #1890ff;
  font-weight: 600;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-h, #12161c);
  transition: background 0.15s;
}

.layer-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.layer-item input[type="checkbox"] {
  margin: 0;
  accent-color: #1890ff;
}

.layer-label {
  user-select: none;
}
</style>
