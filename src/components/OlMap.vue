<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'

// ==========================================
// OpenLayers 核心模块导入
// ==========================================
import Map from 'ol/Map'                          // 地图核心类
import View from 'ol/View'                        // 视图类 - 控制地图中心、缩放、旋转
import Overlay from 'ol/Overlay'                  // 覆盖物 - 在地图上叠加 HTML 元素

// 图层
import TileLayer from 'ol/layer/Tile'             // 瓦片图层
import VectorLayer from 'ol/layer/Vector'         // 矢量图层

// 数据源
import OSM from 'ol/source/OSM'                   // OpenStreetMap 数据源
import VectorSource from 'ol/source/Vector'       // 矢量数据源

// 控件
import ScaleLine from 'ol/control/ScaleLine'      // 比例尺控件
import MousePosition from 'ol/control/MousePosition' // 鼠标位置控件
import OverviewMap from 'ol/control/OverviewMap'  // 鹰眼图控件
import FullScreen from 'ol/control/FullScreen'    // 全屏控件
import ZoomSlider from 'ol/control/ZoomSlider'    // 缩放滑块控件
import { defaults as defaultControls } from 'ol/control/defaults' // 默认控件

// 交互
import Draw from 'ol/interaction/Draw'            // 绘制交互
import Modify from 'ol/interaction/Modify'        // 修改交互
import Select from 'ol/interaction/Select'        // 选择交互
import Snap from 'ol/interaction/Snap'            // 吸附交互

// 样式
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

// 格式
import GeoJSON from 'ol/format/GeoJSON'           // GeoJSON 格式解析器

// 投影
import { fromLonLat, toLonLat } from 'ol/proj'    // 坐标转换

// 工具函数
import { getLength, getArea } from 'ol/sphere'    // 球面长度/面积计算
import { createStringXY } from 'ol/coordinate'    // 坐标格式化
import { defaults as defaultInteractions } from 'ol/interaction/defaults' // 默认交互

// 自定义工具
import { getAllDemoLayers } from '../utils/layers'
import { COLORS } from '../utils/styles'

// 自定义组件
import MapToolbar from './MapToolbar.vue'
import MapPopup from './MapPopup.vue'

// ==========================================
// 响应式状态
// ==========================================
const mapEl = ref(null)                // 地图 DOM 容器引用
const popupEl = ref(null)              // 弹窗 DOM 容器引用
const map = shallowRef(null)           // 地图实例（shallowRef 避免深度代理 OL 对象）

const activeTool = ref('none')         // 当前激活的交互工具
const activeLayers = reactive({        // 图层可见性
  base: true,
  cities: true,
  routes: false,
  regions: false,
  mixed: false,
  heatmap: false,
  cluster: false,
})
const measureResult = ref('')          // 测量结果文本

// 弹窗状态
const popupState = reactive({
  visible: false,
  title: '',
  content: '',
  properties: {},
  position: '',
})

// 图层存储
const layers = {}
// 交互存储
const interactions = {}
// 绘制的要素集合
let drawSource = null
let drawLayer = null
// 测量要素
let measureSource = null
let measureLayer = null
let measureTooltipEl = null
let measureTooltipOverlay = null
// 覆盖物
let popupOverlay = null

// ==========================================
// 地图初始化
// ==========================================
onMounted(() => {
  if (!mapEl.value) return

  // --- 创建矢量数据源（用于绘制和测量）---
  drawSource = new VectorSource({
    wrapX: false, // 不在水平方向重复
  })
  drawLayer = new VectorLayer({
    source: drawSource,
    zIndex: 998,
  })

  measureSource = new VectorSource({
    wrapX: false,
  })
  measureLayer = new VectorLayer({
    source: measureSource,
    style: new Style({
      fill: new Fill({ color: 'rgba(24, 144, 255, 0.15)' }),
      stroke: new Stroke({ color: COLORS.primary, width: 2, lineDash: [8, 4] }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: COLORS.primary }),
        stroke: new Stroke({ color: COLORS.white, width: 2 }),
      }),
    }),
    zIndex: 999,
  })

  // --- 获取所有演示图层 ---
  const demoLayers = getAllDemoLayers()
  Object.assign(layers, demoLayers)

  // 设置初始可见性
  layers.routes.setVisible(false)
  layers.regions.setVisible(false)
  layers.mixed.setVisible(false)
  layers.heatmap.setVisible(false)
  layers.cluster.setVisible(false)

  // --- 创建地图实例 ---
  map.value = new Map({
    target: mapEl.value,              // 地图绑定的 DOM 元素

    // 视图配置
    view: new View({
      center: fromLonLat([104.5, 35.5]),  // 地图中心点（从经纬度转换为投影坐标）
      zoom: 4,                             // 初始缩放级别
      minZoom: 1,                          // 最小缩放级别
      maxZoom: 18,                         // 最大缩放级别
      rotation: 0,                         // 初始旋转角度（弧度）
      constrainRotation: true,             // 旋转约束，接近0时自动回正
      enableRotation: true,                // 是否允许旋转（Alt+Shift+拖拽）
      projection: 'EPSG:3857',            // 地图投影（Web Mercator）
      maxResolution: undefined,            // 最大分辨率（由 minZoom 计算）
      extent: undefined,                   // 视图限制范围（undefined=不限制）
      smoothExtentConstraint: true,        // 平滑范围约束
      constrainOnlyCenter: false,          // 仅约束中心点还是整个视口
      multiWorld: false,                   // 是否允许多个世界（水平重复）
    }),

    // 图层列表（从下到上排列）
    layers: [
      layers.base,
      layers.regions,
      layers.routes,
      layers.cities,
      layers.mixed,
      layers.heatmap,
      layers.cluster,
      measureLayer,
      drawLayer,
    ],

    // 控件配置
    controls: defaultControls({
      zoom: true,              // 缩放按钮（+/-）
      rotate: true,            // 旋转重置按钮
      attribution: true,       // 版权信息
    }).extend([
      // 比例尺控件
      new ScaleLine({
        units: 'metric',       // 单位: 'metric'(米/千米) | 'degrees'(度) | 'imperial'(英尺/英里) | 'nautical'(海里)
        minWidth: 64,          // 最小宽度（像素）
        maxWidth: 200,         // 最大宽度（像素）
        bar: false,            // 是否显示为条形比例尺
        steps: 4,              // 条形比例尺的步数
        text: true,            // 是否显示文本标注
        target: undefined,     // 自定义渲染目标 DOM
      }),
      // 鼠标位置控件 - 显示当前鼠标所在坐标
      new MousePosition({
        coordinateFormat: createStringXY(4), // 坐标格式化函数（保留4位小数）
        projection: 'EPSG:4326',             // 显示为经纬度坐标
        undefinedHTML: '&nbsp;',             // 鼠标离开地图时的显示内容
      }),
      // 鹰眼图控件 - 小地图概览
      new OverviewMap({
        collapsed: true,         // 默认是否折叠
        collapsible: true,       // 是否可折叠
        target: undefined,       // 自定义渲染目标
        layers: [
          new TileLayer({ source: new OSM() }),
        ],
      }),
      // 全屏控件
      new FullScreen({
        source: undefined,       // 全屏目标元素（undefined=整个地图）
        keys: false,             // 是否使用键盘快捷键（F11）
      }),
      // 缩放滑块控件
      new ZoomSlider(),
    ]),

    // 交互配置
    interactions: defaultInteractions({
      altShiftDragRotate: true,  // Alt+Shift+拖拽 旋转
      pinchRotate: true,         // 双指旋转（触屏）
      pinchZoom: true,           // 双指缩放（触屏）
      keyboard: true,            // 键盘控制（方向键平移，+/- 缩放）
      mouseWheelZoom: true,      // 鼠标滚轮缩放
      shiftDragZoom: true,       // Shift+拖拽 框选缩放
      doubleClickZoom: true,     // 双击缩放
      dragPan: true,             // 拖拽平移
      onFocusOnly: false,        // 仅在聚焦时响应
    }),

    // 其他配置
    pixelRatio: window.devicePixelRatio, // 像素比（高清屏适配）
    keyboardEventTarget: document,       // 键盘事件目标
    moveTolerance: 1,                    // 移动容差（像素），小于此值不算拖拽
  })

  // --- 创建弹窗覆盖物 ---
  popupOverlay = new Overlay({
    element: popupEl.value,              // 弹窗 DOM 元素
    autoPan: {                           // 弹窗超出视口时自动平移地图
      animation: { duration: 250 },      // 平移动画时长
      margin: 20,                        // 距视口边缘最小距离
    },
    offset: [0, -12],                    // 弹窗偏移量 [x, y]（像素）
    positioning: 'bottom-center',        // 定位方式: 'bottom-center' 表示弹窗底部中心对准坐标
    stopEvent: true,                     // 阻止弹窗上的点击事件传递到地图
  })
  map.value.addOverlay(popupOverlay)

  // --- 绑定地图事件 ---
  bindMapEvents()
})

// ==========================================
// 地图事件绑定
// ==========================================
function bindMapEvents() {
  const m = map.value
  if (!m) return

  // 单击事件 - 显示要素信息
  m.on('click', (evt) => {
    const coordinate = evt.coordinate           // 点击的地图坐标（投影坐标系）
    const pixel = evt.pixel                     // 点击的像素坐标 [x, y]

    // 检查是否点击到了要素
    const features = []
    m.forEachFeatureAtPixel(pixel, (feature, layer) => {
      // 处理聚类要素
      if (feature.get('features')) {
        features.push(...feature.get('features'))
      } else {
        features.push(feature)
      }
    })

    if (features.length > 0) {
      const feature = features[0]
      const props = feature.getProperties()
      const geometry = feature.getGeometry()
      const geomType = geometry?.getType()
      let center

      if (geomType === 'Point') {
        center = geometry.getCoordinates()
      } else {
        center = geometry?.getExtent()
        center = [(center[0] + center[2]) / 2, (center[1] + center[3]) / 2]
      }

      const lonLat = toLonLat(center)
      popupState.title = props.name || `${geomType} 要素`
      popupState.properties = props
      popupState.position = `${lonLat[0].toFixed(4)}, ${lonLat[1].toFixed(4)}`
      popupState.visible = true
      popupOverlay.setPosition(center)
    } else {
      closePopup()
    }
  })

  // 鼠标移动事件 - 改变光标样式
  m.on('pointermove', (evt) => {
    const pixel = evt.pixel
    const hit = m.hasFeatureAtPixel(pixel)
    mapEl.value.style.cursor = hit ? 'pointer' : ''
  })

  // 视图变化事件 - 缩放/平移时触发
  m.on('moveend', () => {
    const view = m.getView()
    const center = toLonLat(view.getCenter())
    const zoom = view.getZoom()
    const resolution = view.getResolution()
    const rotation = view.getRotation()
    // 可在此处记录或更新状态
  })
}

// ==========================================
// 交互工具切换
// ==========================================
function handleToolChange(toolName) {
  activeTool.value = toolName
  const m = map.value
  if (!m) return

  // 移除所有自定义交互
  removeAllInteractions()

  switch (toolName) {
    case 'draw-point':
      addDrawInteraction('Point')
      break
    case 'draw-line':
      addDrawInteraction('LineString')
      break
    case 'draw-polygon':
      addDrawInteraction('Polygon')
      break
    case 'draw-circle':
      addDrawInteraction('Circle')
      break
    case 'modify':
      addModifyInteraction()
      break
    case 'select':
      addSelectInteraction()
      break
    case 'measure-line':
      addMeasureInteraction('LineString')
      break
    case 'measure-area':
      addMeasureInteraction('Polygon')
      break
    case 'none':
    default:
      break
  }
}

// 移除所有自定义交互
function removeAllInteractions() {
  const m = map.value
  if (!m) return

  Object.keys(interactions).forEach((key) => {
    m.removeInteraction(interactions[key])
    delete interactions[key]
  })

  if (measureTooltipOverlay) {
    m.removeOverlay(measureTooltipOverlay)
    measureTooltipOverlay = null
  }
}

// ==========================================
// 绘制交互 (Draw)
// ==========================================
function addDrawInteraction(type) {
  const m = map.value
  if (!m) return

  const draw = new Draw({
    source: drawSource,       // 绘制到的矢量数据源
    type,                     // 几何类型: 'Point' | 'LineString' | 'Polygon' | 'Circle' | 'MultiPoint' 等
    minPoints: 2,             // 最小点数（线至少2个点）
    maxPoints: undefined,     // 最大点数（undefined=不限制）
    clickTolerance: 6,        // 点击容差（像素），在此范围内视为同一点
    style: new Style({        // 绘制过程中的临时样式
      fill: new Fill({ color: 'rgba(24, 144, 255, 0.2)' }),
      stroke: new Stroke({ color: COLORS.primary, width: 2 }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: COLORS.primary }),
        stroke: new Stroke({ color: COLORS.white, width: 2 }),
      }),
    }),
  })

  // 绘制完成事件
  draw.on('drawend', (evt) => {
    const feature = evt.feature
    const geometry = feature.getGeometry()
    const geomType = geometry.getType()

    // 为新绘制的要素设置默认属性
    feature.set('name', `${geomType}_${Date.now()}`)
    feature.set('category', 'default')
    feature.set('createTime', new Date().toISOString())

    // 应用样式
    feature.setStyle(new Style({
      fill: new Fill({ color: 'rgba(24, 144, 255, 0.3)' }),
      stroke: new Stroke({ color: COLORS.primary, width: 2 }),
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: COLORS.primary }),
        stroke: new Stroke({ color: COLORS.white, width: 2 }),
      }),
    }))
  })

  // 添加吸附交互 - 自动对齐到已有要素
  const snap = new Snap({
    source: drawSource,       // 吸附目标数据源
    pixelTolerance: 10,       // 吸附容差（像素）
    edge: true,               // 吸附到边
    vertex: true,             // 吸附到顶点
  })

  interactions.draw = draw
  interactions.snap = snap
  m.addInteraction(draw)
  m.addInteraction(snap)
}

// ==========================================
// 修改交互 (Modify)
// ==========================================
function addModifyInteraction() {
  const m = map.value
  if (!m) return

  const modify = new Modify({
    source: drawSource,       // 修改目标数据源
    pixelTolerance: 10,       // 像素容差
    style: new Style({        // 修改节点样式
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: COLORS.warning }),
        stroke: new Stroke({ color: COLORS.white, width: 2 }),
      }),
    }),
    deleteCondition: (evt) => {
      // 删除条件：Alt + 点击
      const shiftKey = evt.originalEvent.altKey
      return shiftKey
    },
  })

  // 修改开始/结束事件
  modify.on('modifystart', (evt) => {
    // evt.features 包含即将被修改的要素集合
  })
  modify.on('modifyend', (evt) => {
    // 修改完成后触发
  })

  interactions.modify = modify
  m.addInteraction(modify)
}

// ==========================================
// 选择交互 (Select)
// ==========================================
function addSelectInteraction() {
  const m = map.value
  if (!m) return

  const select = new Select({
    layers: [drawLayer, layers.cities, layers.routes, layers.regions, layers.mixed],
    style: new Style({
      fill: new Fill({ color: 'rgba(250, 173, 20, 0.3)' }),
      stroke: new Stroke({ color: COLORS.warning, width: 3 }),
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: COLORS.warning }),
        stroke: new Stroke({ color: COLORS.white, width: 2 }),
      }),
    }),
    multi: false,              // 是否允许多选
    hitTolerance: 5,           // 点击容差（像素）
    addCondition: undefined,   // 添加选择条件（Shift 多选等）
    toggleCondition: undefined, // 切换选择条件
    removeCondition: undefined, // 移除选择条件
    wrapX: false,
  })

  select.on('select', (evt) => {
    const selected = evt.selected
    const deselected = evt.deselected

    if (selected.length > 0) {
      const feature = selected[0]
      const props = feature.getProperties()
      const geometry = feature.getGeometry()
      const geomType = geometry?.getType()
      let center

      if (geomType === 'Point') {
        center = geometry.getCoordinates()
      } else {
        const extent = geometry?.getExtent()
        center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
      }

      const lonLat = toLonLat(center)
      popupState.title = props.name || `${geomType} 要素`
      popupState.properties = props
      popupState.position = `${lonLat[0].toFixed(4)}, ${lonLat[1].toFixed(4)}`
      popupState.visible = true
      popupOverlay.setPosition(center)
    } else {
      closePopup()
    }
  })

  interactions.select = select
  m.addInteraction(select)
}

// ==========================================
// 测量交互 (Measure)
// ==========================================
function addMeasureInteraction(type) {
  const m = map.value
  if (!m) return

  const draw = new Draw({
    source: measureSource,
    type,
    style: new Style({
      fill: new Fill({ color: 'rgba(24, 144, 255, 0.15)' }),
      stroke: new Stroke({ color: COLORS.primary, width: 2, lineDash: [8, 4] }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: COLORS.primary }),
        stroke: new Stroke({ color: COLORS.white, width: 2 }),
      }),
    }),
  })

  // 创建测量提示覆盖物
  measureTooltipEl = document.createElement('div')
  measureTooltipEl.className = 'measure-tooltip'
  measureTooltipOverlay = new Overlay({
    element: measureTooltipEl,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
  })
  m.addOverlay(measureTooltipOverlay)

  // 绘制过程中实时更新测量值
  draw.on('drawstart', (evt) => {
    const sketch = evt.feature
    const geometry = sketch.getGeometry()

    // 监听几何变化
    const listener = geometry.on('change', (e) => {
      const geom = e.target
      let output = ''

      if (type === 'LineString') {
        // 计算球面距离（米）
        const length = getLength(geom, { projection: 'EPSG:3857' })
        output = length > 1000
          ? `${(length / 1000).toFixed(2)} km`
          : `${length.toFixed(2)} m`
      } else if (type === 'Polygon') {
        // 计算球面面积（平方米）
        const area = getArea(geom, { projection: 'EPSG:3857' })
        output = area > 1000000
          ? `${(area / 1000000).toFixed(2)} km²`
          : `${area.toFixed(2)} m²`
      }

      measureResult.value = output

      // 更新提示位置
      let pos
      if (type === 'LineString') {
        pos = geom.getLastCoordinate()
      } else {
        pos = geom.getInteriorPoint().getCoordinates()
      }
      measureTooltipEl.innerHTML = output
      measureTooltipOverlay.setPosition(pos)
    })

    sketch.set('_listener', listener)
  })

  // 绘制完成
  draw.on('drawend', () => {
    if (measureTooltipEl) {
      measureTooltipEl.className = 'measure-tooltip measure-tooltip-static'
    }
    measureTooltipOverlay = null
    measureTooltipEl = null
  })

  interactions.measure = draw
  m.addInteraction(draw)
}

// ==========================================
// 图层切换
// ==========================================
function handleLayerToggle(layerName, visible) {
  activeLayers[layerName] = visible
  if (layers[layerName]) {
    layers[layerName].setVisible(visible)
  }
}

// ==========================================
// 操作按钮
// ==========================================
function handleClearDraw() {
  if (drawSource) drawSource.clear()
}

function handleClearMeasure() {
  if (measureSource) measureSource.clear()
  measureResult.value = ''
  if (measureTooltipOverlay && map.value) {
    map.value.removeOverlay(measureTooltipOverlay)
    measureTooltipOverlay = null
  }
}

function handleFitExtent() {
  const m = map.value
  if (!m) return

  const extent = drawSource.getExtent()
  if (extent && isFinite(extent[0])) {
    m.getView().fit(extent, {
      padding: [50, 50, 50, 50],  // 内边距 [top, right, bottom, left]
      maxZoom: 16,                 // 最大缩放级别
      duration: 500,               // 动画时长（毫秒）
      easing: (t) => t * (2 - t), // 缓动函数
      constrainResolution: true,   // 约束到整数缩放级别
    })
  } else {
    // 没有绘制要素时，缩放到所有可见矢量图层的范围
    const allExtent = [Infinity, Infinity, -Infinity, -Infinity]
    Object.values(layers).forEach((layer) => {
      if (layer.getVisible() && layer.getSource?.()?.getExtent) {
        const ext = layer.getSource().getExtent()
        if (ext && isFinite(ext[0])) {
          allExtent[0] = Math.min(allExtent[0], ext[0])
          allExtent[1] = Math.min(allExtent[1], ext[1])
          allExtent[2] = Math.max(allExtent[2], ext[2])
          allExtent[3] = Math.max(allExtent[3], ext[3])
        }
      }
    })
    if (isFinite(allExtent[0])) {
      m.getView().fit(allExtent, {
        padding: [50, 50, 50, 50],
        duration: 500,
      })
    }
  }
}

function handleExportGeoJSON() {
  const format = new GeoJSON({
    dataProjection: 'EPSG:4326',     // 输出投影（经纬度）
    featureProjection: 'EPSG:3857',  // 要素投影
  })

  const features = drawSource.getFeatures()
  if (features.length === 0) {
    alert('没有可导出的绘制要素')
    return
  }

  const json = format.writeFeatures(features, {
    decimals: 6, // 坐标精度（小数位数）
  })

  // 下载 JSON 文件
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `draw-features-${Date.now()}.geojson`
  a.click()
  URL.revokeObjectURL(url)
}

function closePopup() {
  popupState.visible = false
  if (popupOverlay) {
    popupOverlay.setPosition(undefined)
  }
}

// ==========================================
// 清理
// ==========================================
onBeforeUnmount(() => {
  removeAllInteractions()
  if (map.value) {
    map.value.setTarget(null)
    map.value = null
  }
})
</script>

<template>
  <div class="map-wrapper">
    <!-- 工具栏 -->
    <MapToolbar
      :active-tool="activeTool"
      :active-layers="activeLayers"
      :measure-result="measureResult"
      @tool-change="handleToolChange"
      @layer-toggle="handleLayerToggle"
      @clear-draw="handleClearDraw"
      @clear-measure="handleClearMeasure"
      @fit-extent="handleFitExtent"
      @export-geojson="handleExportGeoJSON"
    />

    <!-- 地图容器 -->
    <div class="map-container">
      <div ref="mapEl" class="map-target" />

      <!-- 弹窗覆盖物 -->
      <div ref="popupEl">
        <MapPopup
          :visible="popupState.visible"
          :title="popupState.title"
          :properties="popupState.properties"
          :position="popupState.position"
          @close="closePopup"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}

.map-container {
  flex: 1;
  position: relative;
  min-width: 0;
}

.map-target {
  width: 100%;
  height: 100%;
}

/* 测量提示样式 */
:global(.measure-tooltip) {
  position: relative;
  background: rgba(24, 144, 255, 0.9);
  border-radius: 4px;
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
}

:global(.measure-tooltip::after) {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(24, 144, 255, 0.9);
}

:global(.measure-tooltip-static) {
  background: rgba(24, 144, 255, 0.7);
}
</style>
