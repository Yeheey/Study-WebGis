import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import VectorLayer from 'ol/layer/Vector'
import VectorTileLayer from 'ol/layer/VectorTile'
import HeatmapLayer from 'ol/layer/Heatmap'
import GroupLayer from 'ol/layer/Group'

import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import TileWMS from 'ol/source/TileWMS'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import VectorSource from 'ol/source/Vector'
import VectorTileSource from 'ol/source/VectorTile'
import ImageStatic from 'ol/source/ImageStatic'
import Cluster from 'ol/source/Cluster'
import BingMaps from 'ol/source/BingMaps'

import GeoJSON from 'ol/format/GeoJSON'
import TopoJSON from 'ol/format/TopoJSON'
import KML from 'ol/format/KML'
import { get as getProjection } from 'ol/proj'
import { getWidth, getTopLeft } from 'ol/extent'

import { createCircleStyle, createPolygonStyle, createLineStyle, createStyleFunction, COLORS } from './styles'
import { citiesGeoJSON, routesGeoJSON, regionsGeoJSON, mixedGeoJSON, generateHeatmapData, generateClusterData } from './geoData'

// ==========================================
// 1. 底图图层 (Base Layers)
// ==========================================

// OSM 开源地图图层
// 最常用的免费底图，数据来自 OpenStreetMap 社区
export function createOSMLayer() {
  return new TileLayer({
    source: new OSM({
      attributions: '© OpenStreetMap contributors', // 数据来源版权信息
      crossOrigin: 'anonymous',                     // 跨域请求设置
      wrapX: true,                                  // 水平方向是否循环渲染（世界地图左右重复）
    }),
    opacity: 1,        // 图层透明度 0~1
    visible: true,     // 是否可见
    zIndex: 0,         // 图层叠放顺序，数值越大越靠上
    minZoom: 0,        // 图层最小缩放级别
    maxZoom: 19,       // 图层最大缩放级别
    preload: 0,        // 预加载相邻缩放级别的瓦片数
  })
}

// XYZ 瓦片图层
// 通用的 XYZ 瓦片服务，可用于加载各种在线地图（高德、天地图等）
export function createXYZLayer(url, options = {}) {
  const {
    attributions = '',    // 版权信息
    minZoom = 0,          // 最小缩放级别
    maxZoom = 18,         // 最大缩放级别
    tileSize = 256,       // 瓦片尺寸（像素），通常为 256 或 512
    crossOrigin = 'anonymous', // 跨域设置
  } = options

  return new TileLayer({
    source: new XYZ({
      url,                // 瓦片 URL 模板，如 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                          // {x} = 瓦片X坐标, {y} = 瓦片Y坐标, {z} = 缩放级别
      attributions,       // 版权信息
      minZoom,            // 最小缩放级别
      maxZoom,            // 最大缩放级别
      tileSize,           // 瓦片尺寸
      crossOrigin,        // 跨域设置
      wrapX: true,        // 水平循环
      transition: 250,    // 瓦片加载过渡动画时长（毫秒）
    }),
  })
}

// 高德地图底图
// 使用高德瓦片服务（注意：实际使用需遵守高德地图 API 使用条款）
export function createGaodeLayer() {
  return createXYZLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    attributions: '© 高德地图',
    minZoom: 1,
    maxZoom: 18,
  })
}

// 天地图底图 (WMTS 格式)
// 国家地理信息公共服务平台，需要申请 key
export function createTianDiTuLayer(key = '') {
  const projection = getProjection('EPSG:4326')
  const projectionExtent = projection.getExtent()
  const size = getWidth(projectionExtent) / 256
  const resolutions = new Array(18)
  const matrixIds = new Array(18)

  for (let z = 1; z <= 18; ++z) {
    resolutions[z] = size / Math.pow(2, z)
    matrixIds[z] = z
  }

  return new TileLayer({
    source: new WMTS({
      url: `https://t{s}.tianditu.gov.cn/vec_w/wmts?tk=${key}`, // WMTS 服务地址
      layer: 'vec',           // 图层名称: vec(矢量底图) | img(影像底图) | ter(地形)
      matrixSet: 'w',         // 矩阵集: w(Web Mercator) | c(经纬度)
      format: 'tiles',        // 数据格式
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent), // 瓦片网格原点
        resolutions,          // 分辨率数组
        matrixIds,            // 矩阵ID数组
        tileSize: 256,        // 瓦片尺寸
      }),
      urls: [
        'https://t0.tianditu.gov.cn/vec_w/wmts',
        'https://t1.tianditu.gov.cn/vec_w/wmts',
        'https://t2.tianditu.gov.cn/vec_w/wmts',
        'https://t3.tianditu.gov.cn/vec_w/wmts',
        'https://t4.tianditu.gov.cn/vec_w/wmts',
        'https://t5.tianditu.gov.cn/vec_w/wmts',
        'https://t6.tianditu.gov.cn/vec_w/wmts',
        'https://t7.tianditu.gov.cn/vec_w/wmts',
      ],
      crossOrigin: 'anonymous',
    }),
  })
}

// WMS 图层 (Web Map Service)
// OGC 标准地图服务，常用于加载 GIS 服务器发布的地图
export function createWMSLayer(url, layerName, options = {}) {
  const {
    params = {},        // 额外 WMS 请求参数
    ratio = 1,          // 图片比例因子，1=请求与视口大小一致的图片
    serverType = 'geoserver', // 服务器类型: 'geoserver' | 'mapserver' | 'qgis'
  } = options

  return new TileLayer({
    source: new TileWMS({
      url,              // WMS 服务地址
      params: {
        LAYERS: layerName,       // 请求的图层名称（逗号分隔多个图层）
        TILED: true,             // 是否请求瓦片格式
        FORMAT: 'image/png',     // 返回图片格式: 'image/png' | 'image/jpeg'
        VERSION: '1.1.1',        // WMS 版本: '1.1.1' | '1.3.0'
        STYLES: '',              // 样式名称，空字符串使用默认样式
        ...params,               // 额外参数
      },
      serverType,       // 服务器类型，影响 GetFeatureInfo 请求
      crossOrigin: 'anonymous',
      ratio,
    }),
  })
}

// Bing Maps 图层
// 微软必应地图（需要 API Key）
export function createBingMapsLayer(key, imagerySet = 'Aerial') {
  return new TileLayer({
    source: new BingMaps({
      key,              // Bing Maps API Key
      imagerySet,       // 影像集类型:
                        // 'Road' - 道路地图
                        // 'Aerial' - 航空影像
                        // 'AerialWithLabels' - 航空影像+标注
                        // 'OrdnanceSurvey' - 英国 Ordnance Survey
                        // 'CollinsBart' - Collins Bart
    }),
  })
}

// ==========================================
// 2. 矢量图层 (Vector Layers)
// ==========================================

// 城市点矢量图层
// 使用 GeoJSON 格式加载点数据
export function createCitiesVectorLayer() {
  return new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(citiesGeoJSON, {
        dataProjection: 'EPSG:4326',     // 数据原始投影（经纬度）
        featureProjection: 'EPSG:3857',  // 地图投影（Web Mercator）
      }),
    }),
    style: createStyleFunction, // 使用样式函数，根据属性动态设置样式
  })
}

// 路线矢量图层
// 使用 GeoJSON 格式加载线数据
export function createRoutesVectorLayer() {
  return new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(routesGeoJSON, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    }),
    style: createStyleFunction,
  })
}

// 区域矢量图层
// 使用 GeoJSON 格式加载多边形数据
export function createRegionsVectorLayer() {
  return new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(regionsGeoJSON, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    }),
    style: createStyleFunction,
  })
}

// 混合几何矢量图层
// 展示 MultiPoint / MultiPolygon 等复合几何类型
export function createMixedVectorLayer() {
  return new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(mixedGeoJSON, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    }),
    style: createStyleFunction,
  })
}

// 从 URL 加载 GeoJSON 的矢量图层
export function createRemoteGeoJSONLayer(url) {
  return new VectorLayer({
    source: new VectorSource({
      url,              // GeoJSON 文件 URL
      format: new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    }),
    style: createStyleFunction,
  })
}

// 从 URL 加载 KML 的矢量图层
// KML 是 Google Earth 使用的格式
export function createKMLLayer(url) {
  return new VectorLayer({
    source: new VectorSource({
      url,
      format: new KML({
        extractStyles: true, // 是否提取 KML 内嵌样式
      }),
    }),
  })
}

// 从 URL 加载 TopoJSON 的矢量图层
// TopoJSON 是 GeoJSON 的拓扑编码格式，体积更小
export function createTopoJSONLayer(url) {
  return new VectorLayer({
    source: new VectorSource({
      url,
      format: new TopoJSON(),
    }),
    style: createPolygonStyle(COLORS.cyan, COLORS.cyan),
  })
}

// ==========================================
// 3. 热力图图层 (Heatmap Layer)
// ==========================================

// 热力图图层
// 用于可视化点数据的密度分布
export function createHeatmapLayer() {
  const data = generateHeatmapData(200)

  return new HeatmapLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    }),
    weight: 'weight',      // 指定要素属性中作为权重值的字段名（0~1）
    blur: 15,              // 高斯模糊半径（像素），值越大热力图越平滑
    radius: 8,             // 热力点半径（像素）
    gradient: [            // 渐变色带，从低密度到高密度
      COLORS.primary,      // 蓝色（低密度）
      COLORS.cyan,         // 青色
      COLORS.success,      // 绿色
      COLORS.warning,      // 黄色
      COLORS.danger,       // 红色（高密度）
    ],
    opacity: 0.8,          // 图层透明度
  })
}

// ==========================================
// 4. 聚类图层 (Cluster Layer)
// ==========================================

// 聚类图层
// 将距离相近的点聚合为一个点，避免密集点重叠
export function createClusterLayer() {
  const data = generateClusterData(300)

  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(data, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }),
  })

  const clusterSource = new Cluster({
    source: vectorSource,   // 原始矢量数据源
    distance: 40,           // 聚类距离（像素），距离小于此值的点会被聚合
    minDistance: 20,        // 最小聚类距离（像素）
  })

  return new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      const size = feature.get('features')?.length || 0 // 聚合包含的要素数量
      const radius = Math.max(8, Math.min(size * 2, 30)) // 根据数量计算圆形半径

      return createCircleStyle(
        size > 10 ? COLORS.danger : size > 5 ? COLORS.warning : COLORS.primary,
        radius
      )
    },
  })
}

// ==========================================
// 5. 静态图片图层 (Image Layer)
// ==========================================

// 静态图片图层
// 用于在地图上叠加一张静态图片（如历史地图、规划图等）
export function createStaticImageLayer(imageUrl, extent) {
  return new ImageLayer({
    source: new ImageStatic({
      url: imageUrl,          // 图片 URL
      imageExtent: extent,    // 图片在地图上的范围 [minX, minY, maxX, maxY]
                              // 使用地图投影坐标系（如 EPSG:3857）
      crossOrigin: 'anonymous',
      projection: 'EPSG:3857', // 图片映射到的投影
    }),
    opacity: 0.7,
  })
}

// ==========================================
// 6. 矢量瓦片图层 (Vector Tile Layer)
// ==========================================

// 矢量瓦片图层
// 结合了矢量数据和瓦片切割的优势，渲染性能优于普通矢量图层
export function createVectorTileLayer(url) {
  return new VectorTileLayer({
    source: new VectorTileSource({
      url,              // 矢量瓦片 URL 模板，如 'https://example.com/tiles/{z}/{x}/{y}.pbf'
      format: new GeoJSON(), // 数据格式: GeoJSON | MVT(Mapbox Vector Tile) | TopoJSON
      minZoom: 0,
      maxZoom: 14,
    }),
    style: createStyleFunction,
    declutter: true,    // 启用标注防碰撞，避免文字/图标重叠
    opacity: 1,
  })
}

// ==========================================
// 7. 图层组 (Layer Group)
// ==========================================

// 图层组
// 将多个图层组合为一个整体，方便统一控制可见性/透明度
export function createLayerGroup(layers, options = {}) {
  const {
    visible = true,     // 组整体是否可见
    opacity = 1,        // 组整体透明度
    zIndex = 0,         // 组叠放顺序
  } = options

  return new GroupLayer({
    layers,             // 子图层数组
    visible,
    opacity,
    zIndex,
  })
}

// ==========================================
// 8. 预设图层组合
// ==========================================

// 获取所有演示图层
export function getAllDemoLayers() {
  return {
    base: createOSMLayer(),
    cities: createCitiesVectorLayer(),
    routes: createRoutesVectorLayer(),
    regions: createRegionsVectorLayer(),
    mixed: createMixedVectorLayer(),
    heatmap: createHeatmapLayer(),
    cluster: createClusterLayer(),
  }
}
