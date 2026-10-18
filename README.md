# Study-WebGis

基于 **Vue 3 + Vite + OpenLayers 10** 的 WebGIS 学习项目，系统性覆盖 OpenLayers 常用 API，每个属性和方法均附带中文注释。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| [Vue 3](https://cn.vuejs.org/) | ^3.5 | 渐进式 JavaScript 框架，使用 Composition API |
| [Vite](https://vite.dev/) | ^8.3 | 下一代前端构建工具，极速热更新 |
| [OpenLayers](https://openlayers.org/) | ^10.11 | 专业级开源 WebGIS 地图引擎 |
| [pnpm](https://pnpm.io/) | - | 快速、节省磁盘空间的包管理器 |

## 快速开始

### 环境要求

- **Node.js** >= 18.0
- **pnpm** >= 8.0（推荐）或 npm / yarn

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

启动后访问终端显示的地址（默认 `http://localhost:5173`）。

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `dist/` 目录。

### 预览生产版本

```bash
pnpm preview
```

## 项目结构

```
Study-WebGis/
├── index.html                  # 入口 HTML
├── package.json                # 项目配置与依赖
├── vite.config.js              # Vite 构建配置
├── pnpm-lock.yaml              # 依赖锁定文件
├── public/                     # 静态资源（不经过构建）
├── src/
│   ├── main.js                 # 应用入口，挂载 Vue 实例
│   ├── App.vue                 # 根组件，页面布局
│   ├── style.css               # 全局样式
│   ├── assets/                 # 静态资源（经过构建处理）
│   ├── components/
│   │   ├── OlMap.vue           # 核心地图组件（覆盖全部常用 API）
│   │   ├── MapToolbar.vue      # 工具栏组件（交互工具 + 图层控制）
│   │   ├── MapPopup.vue        # 弹窗覆盖物组件
│   │   └── HelloWorld.vue      # 默认模板组件（可删除）
│   └── utils/
│       ├── layers.js           # 图层工厂函数（各类图层配置）
│       ├── styles.js           # 样式工具函数（点/线/面/文本样式）
│       └── geoData.js          # 示例 GeoJSON 数据
└── README.md                   # 项目文档
```

## 覆盖的 OpenLayers API

### 1. 核心类 (Core)

| 类 | 说明 | 文件 |
|----|------|------|
| `Map` | 地图核心类，管理图层、视图、控件、交互 | `OlMap.vue` |
| `View` | 视图类，控制地图中心、缩放、旋转、投影 | `OlMap.vue` |
| `Overlay` | 覆盖物，在地图上叠加 HTML 元素（弹窗） | `OlMap.vue` |
| `Feature` | 要素类，包含几何体和属性 | `OlMap.vue` |
| `Collection` | 集合类，可监听变化的数组 | `OlMap.vue` |

### 2. 几何类型 (Geometry)

| 类 | 说明 | 数据文件 |
|----|------|----------|
| `Point` | 点 | `geoData.js` |
| `LineString` | 线 | `geoData.js` |
| `Polygon` | 多边形 | `geoData.js` |
| `MultiPoint` | 多点 | `geoData.js` |
| `MultiLineString` | 多线 | `geoData.js` |
| `MultiPolygon` | 多多边形 | `geoData.js` |
| `Circle` | 圆形 | `OlMap.vue` (绘制交互) |

### 3. 图层 (Layers)

| 类 | 说明 | 文件 |
|----|------|------|
| `TileLayer` | 瓦片图层（OSM、XYZ、WMS、WMTS、BingMaps） | `layers.js` |
| `VectorLayer` | 矢量图层（GeoJSON、KML、TopoJSON） | `layers.js` |
| `HeatmapLayer` | 热力图图层 | `layers.js` |
| `GroupLayer` | 图层组 | `layers.js` |
| `ImageLayer` | 静态图片图层 | `layers.js` |
| `VectorTileLayer` | 矢量瓦片图层 | `layers.js` |

### 4. 数据源 (Sources)

| 类 | 说明 | 文件 |
|----|------|------|
| `OSM` | OpenStreetMap 数据源 | `layers.js` |
| `XYZ` | 通用 XYZ 瓦片数据源 | `layers.js` |
| `TileWMS` | WMS 瓦片服务 | `layers.js` |
| `WMTS` | WMTS 瓦片服务 | `layers.js` |
| `BingMaps` | 微软必应地图 | `layers.js` |
| `VectorSource` | 矢量数据源 | `layers.js` |
| `Cluster` | 聚类数据源 | `layers.js` |
| `ImageStatic` | 静态图片数据源 | `layers.js` |
| `VectorTileSource` | 矢量瓦片数据源 | `layers.js` |

### 5. 样式 (Styles)

| 类 | 说明 | 文件 |
|----|------|------|
| `Style` | 样式容器 | `styles.js` |
| `Fill` | 填充样式 | `styles.js` |
| `Stroke` | 描边样式 | `styles.js` |
| `Circle` (CircleStyle) | 圆形点样式 | `styles.js` |
| `Icon` | 图标点样式 | `styles.js` |
| `RegularShape` | 正则图形（三角形、星形等） | `styles.js` |
| `Text` | 文本标注样式 | `styles.js` |
| Style Function | 样式函数（动态样式） | `styles.js` |

### 6. 控件 (Controls)

| 类 | 说明 | 文件 |
|----|------|------|
| `ScaleLine` | 比例尺 | `OlMap.vue` |
| `MousePosition` | 鼠标坐标显示 | `OlMap.vue` |
| `OverviewMap` | 鹰眼图 | `OlMap.vue` |
| `FullScreen` | 全屏切换 | `OlMap.vue` |
| `ZoomSlider` | 缩放滑块 | `OlMap.vue` |
| `ZoomToExtent` | 缩放到范围 | `OlMap.vue` |
| Zoom / Rotate / Attribution | 默认控件 | `OlMap.vue` |

### 7. 交互 (Interactions)

| 类 | 说明 | 文件 |
|----|------|------|
| `Draw` | 绘制（点/线/面/圆） | `OlMap.vue` |
| `Modify` | 修改要素节点 | `OlMap.vue` |
| `Select` | 选择要素 | `OlMap.vue` |
| `Snap` | 吸附到已有要素 | `OlMap.vue` |
| `Translate` | 平移要素 | `OlMap.vue` (导入) |

### 8. 格式 (Formats)

| 类 | 说明 | 文件 |
|----|------|------|
| `GeoJSON` | GeoJSON 解析与输出 | `layers.js` / `OlMap.vue` |
| `WKT` | WKT 格式解析 | `OlMap.vue` (导入) |
| `KML` | KML 格式解析 | `layers.js` |
| `TopoJSON` | TopoJSON 格式解析 | `layers.js` |

### 9. 投影与坐标 (Projection)

| 函数 | 说明 | 文件 |
|------|------|------|
| `fromLonLat` | 经纬度 → 投影坐标 | `OlMap.vue` |
| `toLonLat` | 投影坐标 → 经纬度 | `OlMap.vue` |
| `transformExtent` | 范围坐标转换 | `layers.js` (导入) |
| `getProjection` | 获取投影对象 | `layers.js` |

### 10. 工具函数 (Utils)

| 函数 | 说明 | 文件 |
|------|------|------|
| `getLength` | 球面距离计算 | `OlMap.vue` |
| `getArea` | 球面面积计算 | `OlMap.vue` |
| `createStringXY` | 坐标格式化 | `OlMap.vue` |

### 11. 地图事件 (Events)

| 事件 | 说明 | 文件 |
|------|------|------|
| `click` | 单击地图 | `OlMap.vue` |
| `pointermove` | 鼠标移动 | `OlMap.vue` |
| `moveend` | 视图变化结束 | `OlMap.vue` |
| `drawstart` / `drawend` | 绘制开始/结束 | `OlMap.vue` |
| `modifystart` / `modifyend` | 修改开始/结束 | `OlMap.vue` |
| `select` | 选择变化 | `OlMap.vue` |

## 功能演示

### 交互工具

- **平移** — 拖拽平移地图
- **画点/线/面/圆** — 在地图上绘制矢量要素
- **编辑** — 拖拽节点修改已绘制要素
- **选择** — 点击要素查看属性弹窗
- **测距** — 测量线段距离（球面距离）
- **测面** — 测量多边形面积（球面面积）

### 图层控制

- **OSM 底图** — OpenStreetMap 标准底图
- **城市标记** — 中国主要城市点数据
- **路线数据** — 高铁线路和河流线数据
- **区域数据** — 华北平原、长三角、珠三角多边形
- **混合几何** — MultiPoint、MultiPolygon 演示
- **热力图** — 点密度热力可视化
- **聚类图层** — 密集点自动聚合

### 其他功能

- **全图范围** — 缩放到所有可见要素范围
- **导出 JSON** — 将绘制要素导出为 GeoJSON 文件
- **坐标显示** — 鼠标位置实时显示经纬度
- **比例尺** — 显示当前比例尺
- **鹰眼图** — 小地图概览
- **全屏模式** — 切换全屏显示

## 学习建议

1. **从 `src/utils/styles.js` 开始** — 理解 OpenLayers 样式系统
2. **阅读 `src/utils/layers.js`** — 掌握各类图层和数据源的创建方式
3. **研究 `src/utils/geoData.js`** — 了解 GeoJSON 数据结构
4. **重点阅读 `src/components/OlMap.vue`** — 核心地图逻辑，覆盖所有常用 API
5. **尝试修改参数** — 改变颜色、缩放级别、图层配置等，观察效果

## 参考资源

- [OpenLayers 官方文档](https://openlayers.org/en/latest/apidoc/)
- [OpenLayers 示例](https://openlayers.org/en/latest/examples/)
- [Vue 3 中文文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://vite.dev/)

## License

MIT
