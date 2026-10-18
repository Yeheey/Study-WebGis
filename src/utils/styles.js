import { Circle as CircleStyle, Fill, Icon, RegularShape, Stroke, Style, Text } from 'ol/style'

// ==========================================
// 颜色常量
// ==========================================
export const COLORS = {
  primary: '#1890ff',        // 主色调 - 蓝色
  success: '#52c41a',        // 成功 - 绿色
  warning: '#faad14',        // 警告 - 黄色
  danger: '#ff4d4f',         // 危险 - 红色
  purple: '#722ed1',         // 紫色
  cyan: '#13c2c2',           // 青色
  orange: '#fa8c16',         // 橙色
  white: '#ffffff',          // 白色
  black: '#000000',          // 黑色
  transparent: 'transparent', // 透明
}

// ==========================================
// 基础填充样式 (Fill)
// Fill 用于设置多边形/圆形的填充颜色
// ==========================================
export function createFill(color = COLORS.primary, opacity = 0.3) {
  return new Fill({
    color: hexToRgba(color, opacity), // 填充颜色，支持 rgba 实现透明度
  })
}

// ==========================================
// 基础描边样式 (Stroke)
// Stroke 用于设置线/多边形边框的描边
// ==========================================
export function createStroke(color = COLORS.primary, width = 2) {
  return new Stroke({
    color,                // 描边颜色
    width,                // 线宽（像素）
    lineDash: [],         // 虚线样式，如 [10, 5] 表示 10px 实线 + 5px 间隔
    lineCap: 'round',     // 线端样式: 'butt'(平直) | 'round'(圆头) | 'square'(方形)
    lineJoin: 'round',    // 拐角样式: 'bevel'(斜角) | 'round'(圆角) | 'miter'(尖角)
    miterLimit: 10,       // 尖角限制值，超过此值时 'miter' 会被截断为 'bevel'
  })
}

// ==========================================
// 点样式 - 圆形 (Circle)
// CircleStyle 用于渲染点要素为圆形
// ==========================================
export function createCircleStyle(color = COLORS.primary, radius = 6) {
  return new Style({
    image: new CircleStyle({
      radius,                           // 圆形半径（像素）
      fill: createFill(color, 0.6),     // 填充样式
      stroke: createStroke(color, 2),   // 描边样式
    }),
  })
}

// ==========================================
// 点样式 - 图标 (Icon)
// Icon 用于使用图片作为点要素的渲染样式
// ==========================================
export function createIconStyle(src, options = {}) {
  const {
    scale = 1,            // 缩放比例，0.5 表示原图的一半
    rotation = 0,         // 旋转角度（弧度），Math.PI / 4 = 45度
    opacity = 1,          // 透明度 0~1
    anchor = [0.5, 1],    // 锚点位置，[0,0]为左上角，[1,1]为右下角，默认底部中心
    anchorOrigin = 'top-left', // 锚点原点: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    anchorXUnits = 'fraction', // 锚点X单位: 'fraction'(比例) | 'pixels'(像素)
    anchorYUnits = 'fraction', // 锚点Y单位: 'fraction'(比例) | 'pixels'(像素)
    color,                // 色调叠加，如 'red' 或 [255, 0, 0]
    offset = [0, 0],      // 图标在雪碧图中的偏移量 [x, y]
    size,                 // 图标在雪碧图中的原始尺寸 [width, height]
    crossOrigin = 'anonymous', // 跨域设置，用于加载外部图片
  } = options

  return new Style({
    image: new Icon({
      src,                // 图片 URL 路径
      scale,              // 缩放比例
      rotation,           // 旋转弧度
      opacity,            // 透明度
      anchor,             // 锚点
      anchorOrigin,       // 锚点原点
      anchorXUnits,       // X轴单位
      anchorYUnits,       // Y轴单位
      color,              // 色调叠加
      offset,             // 偏移量
      size,               // 雪碧图尺寸
      crossOrigin,        // 跨域配置
    }),
  })
}

// ==========================================
// 点样式 - 正则图形 (RegularShape)
// RegularShape 用于渲染正多边形（三角形、五角星等）
// ==========================================
export function createRegularShape(points = 5, options = {}) {
  const {
    radius = 10,          // 外圆半径（像素）
    radius2,              // 内圆半径（像素），用于星形，不设置则为正多边形
    rotation = 0,         // 旋转角度（弧度）
    fillColor = COLORS.primary,  // 填充颜色
    strokeColor = COLORS.primary, // 描边颜色
    strokeWidth = 2,      // 描边宽度
    angle = 0,            // 起始角度（弧度）
  } = options

  return new Style({
    image: new RegularShape({
      points,             // 边数/角数，3=三角形，4=菱形，5=五角星，6=六角形
      radius,             // 外圆半径
      radius2,            // 内圆半径（星形用）
      rotation,           // 旋转角度
      angle,              // 起始角度
      fill: createFill(fillColor, 0.6),   // 填充
      stroke: createStroke(strokeColor, strokeWidth), // 描边
    }),
  })
}

// ==========================================
// 文本标注样式 (Text)
// Text 用于在要素上显示文字标注
// ==========================================
export function createTextStyle(text, options = {}) {
  const {
    font = '14px sans-serif',      // 字体，CSS font 语法
    fillColor = COLORS.black,      // 文字颜色
    strokeColor = COLORS.white,    // 文字描边颜色
    strokeWidth = 3,               // 文字描边宽度
    offsetX = 0,                   // X方向偏移量（像素）
    offsetY = -15,                 // Y方向偏移量（像素），负值向上
    textAlign = 'center',          // 水平对齐: 'left' | 'center' | 'right'
    textBaseline = 'bottom',       // 垂直基线: 'top' | 'middle' | 'bottom'
    rotation = 0,                  // 文字旋转角度（弧度）
    scale,                         // 缩放比例
    padding = [2, 4, 2, 4],       // 内边距 [top, right, bottom, left]
    backgroundFill,                // 背景填充色
    backgroundStroke,              // 背景描边色
    placement = 'point',           // 标注放置方式: 'point'(点) | 'line'(沿线)
    overflow = false,              // 是否允许文字溢出多边形
    maxAngle = Math.PI / 4,       // 沿线标注最大弯曲角度（弧度）
  } = options

  return new Text({
    text,               // 标注文字内容
    font,               // 字体
    fill: new Fill({ color: fillColor }),     // 文字填充
    stroke: new Stroke({ color: strokeColor, width: strokeWidth }), // 文字描边（产生描边效果）
    offsetX,            // X偏移
    offsetY,            // Y偏移
    textAlign,          // 水平对齐
    textBaseline,       // 垂直基线
    rotation,           // 旋转
    scale,              // 缩放
    padding,            // 内边距
    backgroundFill: backgroundFill ? new Fill({ color: backgroundFill }) : undefined,
    backgroundStroke: backgroundStroke ? new Stroke({ color: backgroundStroke, width: 1 }) : undefined,
    placement,          // 放置方式
    overflow,           // 溢出控制
    maxAngle,           // 最大弯曲角度
  })
}

// ==========================================
// 线样式
// 用于 LineString / MultiLineString 要素
// ==========================================
export function createLineStyle(color = COLORS.primary, width = 3) {
  return new Style({
    stroke: createStroke(color, width),
  })
}

// ==========================================
// 多边形样式
// 用于 Polygon / MultiPolygon 要素
// ==========================================
export function createPolygonStyle(fillColor = COLORS.primary, strokeColor = COLORS.primary) {
  return new Style({
    fill: createFill(fillColor, 0.3),       // 半透明填充
    stroke: createStroke(strokeColor, 2),    // 边框描边
  })
}

// ==========================================
// 选中高亮样式
// 当要素被 Select 交互选中时使用
// ==========================================
export function createSelectedStyle() {
  return new Style({
    fill: createFill(COLORS.warning, 0.4),
    stroke: createStroke(COLORS.warning, 3),
    image: new CircleStyle({
      radius: 8,
      fill: createFill(COLORS.warning, 0.6),
      stroke: createStroke(COLORS.warning, 2),
    }),
    text: createTextStyle('已选中', {
      offsetY: -20,
      fillColor: COLORS.warning,
      strokeColor: COLORS.white,
      font: 'bold 12px sans-serif',
    }),
  })
}

// ==========================================
// 样式函数 (Style Function)
// 根据要素属性和分辨率动态返回样式
// 在 layer.setStyle() 或 vector layer 的 style 选项中使用
// ==========================================
export function createStyleFunction(feature, resolution) {
  const type = feature.getGeometry()?.getType() // 获取几何类型
  const name = feature.get('name') || ''        // 获取要素名称属性
  const category = feature.get('category') || '' // 获取要素分类属性

  // 根据分类返回不同颜色
  const colorMap = {
    park: COLORS.success,
    water: COLORS.primary,
    building: COLORS.warning,
    road: COLORS.danger,
    default: COLORS.purple,
  }
  const color = colorMap[category] || colorMap.default

  switch (type) {
    case 'Point':
    case 'MultiPoint':
      return new Style({
        image: new CircleStyle({
          radius: 7,
          fill: createFill(color, 0.6),
          stroke: createStroke(color, 2),
        }),
        text: createTextStyle(name, { offsetY: -15, fillColor: color }),
      })

    case 'LineString':
    case 'MultiLineString':
      return new Style({
        stroke: createStroke(color, 3),
      })

    case 'Polygon':
    case 'MultiPolygon':
      return new Style({
        fill: createFill(color, 0.3),
        stroke: createStroke(color, 2),
        text: createTextStyle(name, { fillColor: color }),
      })

    default:
      return new Style({
        image: new CircleStyle({
          radius: 5,
          fill: createFill(COLORS.primary, 0.5),
          stroke: createStroke(COLORS.primary, 1),
        }),
      })
  }
}

// ==========================================
// 工具函数: 十六进制颜色转 RGBA
// ==========================================
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
