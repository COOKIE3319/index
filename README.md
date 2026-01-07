# ParseHikari - 电影资源聚合系统

> 解析光 // RESOURCE AGGREGATION & PARSING SYSTEM

一个现代化的电影资源聚合与展示系统，提供简洁优雅的界面和强大的资源管理功能。

## ✨ 功能特性

### 核心功能
- 🎬 **电影展示** - 支持本地精选电影库和扩展电影数据库
- 🏷️ **智能标签** - 自动识别并显示4K、HDR、REMUX、Atmos等标签
- 🔍 **搜索功能** - 浮动搜索框，支持全局电影搜索
- 📦 **资源链接** - 详细的磁力链接解析，支持标签筛选
- 🎨 **分类收藏** - 5大主题分类，精心策划的电影集合

### 页面结构
- **HOME** - 首页展示精选电影（4部）+ 扩展电影库
- **RESOURCE** - 随机展示12部电影资源
- **COLLECTION** - 分类收藏页面
  - CRITICALLY_ACCLAIMED（评价极高）- 6部
  - HIDDEN_GEMS（隐藏瑰宝）- 8部
  - MODERN_CLASSICS（现代经典）- 5部
  - CULT_FAVORITES（邪典佳作）- 7部
  - ACTION_PACKED（动作大片）- 4部
- **LIBRARY** - 媒体库，随机展示18部电影

### 技术亮点
- 🎯 **3D卡片效果** - 鼠标交互的3D旋转动画
- 🌈 **多彩标签系统** - 不同类型标签对应不同配色
- 🎭 **模糊背景特效** - Collection页面独特的海报背景效果
- 📱 **响应式设计** - 适配不同屏幕尺寸
- ⚡ **动态加载** - JavaScript异步加载电影数据

## 🚀 快速开始

### 环境要求
- Python 3.x（用于本地HTTP服务器）
- 现代浏览器（Chrome、Firefox、Safari等）

### 安装运行

1. **克隆项目**
```bash
git clone https://github.com/COOKIE3319/index.git
cd index
```

2. **启动服务器**
```bash
python3 -m http.server 8000
```

3. **访问页面**
打开浏览器访问：`http://localhost:8000`

## 📁 项目结构

```
index/
├── index.html              # 首页
├── resource.html           # 资源页
├── collection.html         # 收藏页
├── library.html            # 媒体库页
├── movie-detail.html       # 电影详情页
├── search.html             # 搜索结果页
├── css/
│   └── style.css          # 全局样式
├── js/
│   ├── script.js          # 核心JavaScript逻辑
│   ├── movies-index.json  # 精选电影数据（4部完整信息）
│   └── movies-more.json   # 扩展电影数据（标题+海报）
├── fonts/                 # 字体文件
└── readme.md             # 项目说明
```

## 📊 数据格式

### movies-index.json（精选电影）
```json
[
  {
    "poster": "海报URL",
    "标签": "4K/HDR/REMUX",
    "译名": "中文译名",
    "片名": "Original Title",
    "年代": "2024",
    "产地": "美国",
    "类别": "动作/科幻",
    "导演": "导演名",
    "编剧": "编剧名",
    "主演": "主演列表",
    "简介": "电影简介",
    "简介图片": ["图片URL数组"],
    "magnets": [
      {
        "name": "资源名称（含标签信息）",
        "link": "磁力链接"
      }
    ]
  }
]
```

### movies-more.json（扩展电影库）
```json
[
  {
    "title": "中文名 / English Title",
    "poster": "海报URL"
  }
]
```

## 🎨 标签颜色系统

- **4K/2160P** - 🟠 橙色/金色 (`#ff9500`, `#ffd700`)
- **1080P** - 🟡 黄色 (`#ffcc00`)
- **HDR** - 🔴 红色 (`#ff3b30`)
- **REMUX** - 🟣 紫色 (`#af52de`)
- **WEB-DL** - 🔵 蓝色 (`#007aff`)
- **BluRay/BDRip** - 🟢 青色 (`#34c759`)
- **Atmos/杜比** - 🟣 粉紫色 (`#ff2d55`)

## 🎯 详情页功能

### 资源链接解析
自动从磁力链接名称中提取以下信息：
- **画质标签**：4K、2160P、1080P、720P
- **格式标签**：REMUX、BluRay、WEB-DL、BDRip
- **文件大小**：自动识别GB单位
- **HDR信息**：HDR、DV（杜比视界）
- **编码格式**：HEVC、H.265、x265、AVC、H.264、x264
- **音频格式**：Atmos、TrueHD、DTS-X、DTS-HD

### 筛选功能
- 全部
- 4K
- REMUX
- BluRay
- WEB-DL
- HDR

## 🛠️ 技术栈

- **前端框架**：原生JavaScript（Vanilla JS）
- **样式**：CSS3（Grid布局、Flexbox、动画）
- **字体**：
  - YamahaEBM10（标题）
  - JetBrains Mono（等宽字体）
  - Noto Sans SC（中文）
- **数据格式**：JSON

## 🎨 样式特色

### CSS自定义属性
```css
--primary: #00f0ff;      /* 主色调 - 青色 */
--secondary: #52ffb8;    /* 次要色 - 绿色 */
--background: #0a0a0a;   /* 背景色 - 深黑 */
--card-bg: #1a1a1a;      /* 卡片背景 */
```

### 特效
- 3D卡片旋转效果
- 悬停放大动画
- 背景模糊过渡
- 渐变文字阴影
- 边框发光效果

## 📝 开发说明

### 添加新电影

**添加到精选库（movies-index.json）**：
1. 准备完整的电影信息（包括海报、标签、简介、磁力链接等）
2. 按照JSON格式添加到数组中
3. 电影会显示在首页前4部，并支持详情页查看

**添加到扩展库（movies-more.json）**：
1. 只需提供标题和海报URL
2. 系统会自动为其生成随机标签
3. 会在各个页面随机展示

### 修改分类数量
在 `collection.html` 中修改：
```javascript
fetchCollectionMovies('collection-acclaimed', 6);  // 修改数字
fetchCollectionMovies('collection-gems', 8);
// ...
```

## 📄 License

MIT License

## 👤 Author

ParseHikari Project

---

**享受观影时光 🎬✨**
