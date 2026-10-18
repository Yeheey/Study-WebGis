// ==========================================
// 示例 GeoJSON 数据
// 包含各种几何类型：Point、LineString、Polygon 等
// 用于 VectorLayer 和 VectorSource 的演示
// ==========================================

// 城市标记点数据 (Point)
export const citiesGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: '北京',       // 城市名称
        population: 2154,   // 人口（万）
        category: 'capital', // 分类：首都
        level: 1,           // 等级
      },
      geometry: {
        type: 'Point',      // 点几何
        coordinates: [116.407396, 39.904200], // [经度, 纬度]
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '上海',
        population: 2428,
        category: 'municipality', // 直辖市
        level: 1,
      },
      geometry: {
        type: 'Point',
        coordinates: [121.473701, 31.230416],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '广州',
        population: 1530,
        category: 'province_capital', // 省会
        level: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [113.264385, 23.129112],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '成都',
        population: 1633,
        category: 'province_capital',
        level: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [104.065735, 30.659462],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '武汉',
        population: 1232,
        category: 'province_capital',
        level: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [114.298572, 30.584355],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '西安',
        population: 1295,
        category: 'province_capital',
        level: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [108.939621, 34.343147],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '杭州',
        population: 1036,
        category: 'province_capital',
        level: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [120.153576, 30.287459],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '南京',
        population: 942,
        category: 'province_capital',
        level: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [118.767413, 32.041544],
      },
    },
  ],
}

// 路线数据 (LineString)
export const routesGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: '京沪高铁',      // 路线名称
        type: 'railway',       // 类型：铁路
        category: 'road',
        distance: 1318,        // 距离（公里）
      },
      geometry: {
        type: 'LineString',    // 线几何
        coordinates: [
          [116.407396, 39.904200], // 北京
          [117.190186, 39.125596], // 天津
          [116.587245, 35.415393], // 济南
          [118.767413, 32.041544], // 南京
          [121.473701, 31.230416], // 上海
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '长江',
        type: 'river',          // 类型：河流
        category: 'water',
        length: 6300,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.132211, 29.660361],  // 拉萨附近（源头方向）
          [104.065735, 28.659462], // 四川
          [108.939621, 30.343147], // 重庆/武汉方向
          [114.298572, 30.584355], // 武汉
          [118.767413, 31.541544], // 南京
          [121.473701, 31.230416], // 上海（入海口）
        ],
      },
    },
  ],
}

// 区域数据 (Polygon)
export const regionsGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: '华北平原',       // 区域名称
        category: 'park',      // 分类（用于样式映射）
        area: 300000,          // 面积（平方公里）
      },
      geometry: {
        type: 'Polygon',       // 多边形几何
        coordinates: [
          [
            [112.0, 40.5],  // 各顶点 [经度, 纬度]
            [118.5, 40.5],
            [119.0, 38.0],
            [117.5, 36.5],
            [115.0, 34.5],
            [112.5, 34.5],
            [111.0, 36.0],
            [112.0, 40.5],  // 闭合点（与起点相同）
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '长三角区域',
        category: 'building',
        area: 210000,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [118.5, 32.5],
            [122.0, 32.5],
            [122.5, 30.5],
            [121.5, 29.5],
            [119.5, 29.0],
            [118.0, 30.0],
            [118.5, 32.5],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '珠三角区域',
        category: 'building',
        area: 55000,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [112.0, 24.0],
            [115.0, 24.0],
            [115.5, 22.5],
            [114.5, 21.5],
            [112.5, 21.5],
            [111.5, 22.5],
            [112.0, 24.0],
          ],
        ],
      },
    },
  ],
}

// 混合几何类型数据 (MultiPoint, MultiPolygon)
export const mixedGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: '城市群',
        category: 'park',
      },
      geometry: {
        type: 'MultiPoint',    // 多点几何
        coordinates: [
          [113.264385, 23.129112], // 广州
          [114.057868, 22.543099], // 深圳
          [113.121418, 23.021548], // 佛山
          [113.751765, 23.020536], // 东莞
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: '湖泊群',
        category: 'water',
      },
      geometry: {
        type: 'MultiPolygon',  // 多多边形几何
        coordinates: [
          // 第一个多边形（太湖）
          [
            [
              [120.0, 31.5],
              [120.5, 31.5],
              [120.5, 31.0],
              [120.0, 31.0],
              [120.0, 31.5],
            ],
          ],
          // 第二个多边形（鄱阳湖）
          [
            [
              [116.0, 29.5],
              [116.5, 29.5],
              [116.5, 29.0],
              [116.0, 29.0],
              [116.0, 29.5],
            ],
          ],
        ],
      },
    },
  ],
}

// 热力图数据 - 密集点数据
export function generateHeatmapData(count = 200) {
  const features = []
  const centerLng = 116.4
  const centerLat = 39.9

  for (let i = 0; i < count; i++) {
    // 以北京为中心，在周围随机生成点
    const lng = centerLng + (Math.random() - 0.5) * 10
    const lat = centerLat + (Math.random() - 0.5) * 8
    const weight = Math.random() // 权重值 0~1

    features.push({
      type: 'Feature',
      properties: {
        weight,         // 热力权重值
        name: `点${i}`,
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    })
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}

// 聚类数据 - 密集点（用于 Cluster 演示）
export function generateClusterData(count = 300) {
  const features = []

  // 在几个聚集中心生成点
  const clusters = [
    { lng: 116.4, lat: 39.9 },  // 北京
    { lng: 121.5, lat: 31.2 },  // 上海
    { lng: 113.3, lat: 23.1 },  // 广州
    { lng: 104.1, lat: 30.6 },  // 成都
    { lng: 114.3, lat: 30.6 },  // 武汉
  ]

  for (let i = 0; i < count; i++) {
    const cluster = clusters[i % clusters.length]
    const lng = cluster.lng + (Math.random() - 0.5) * 3
    const lat = cluster.lat + (Math.random() - 0.5) * 3

    features.push({
      type: 'Feature',
      properties: {
        name: `要素${i}`,
        value: Math.floor(Math.random() * 100),
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    })
  }

  return {
    type: 'FeatureCollection',
    features,
  }
}
