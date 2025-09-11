# BL4Builds.net MVP 技术方案（方案 A：纯静态 GitHub Pages）

## 一、目标

-   站点域名：bl4builds.net
-   目标：快速上线 Borderlands 4 Build 粉丝站 MVP（1 天内完成）
-   特点：纯静态文件，无需后端，部署 GitHub Pages

## 二、目录结构

bl4builds/ index.html \# 首页（Top Builds + 视频缩略图） builds/
zane-endgame-shock-dps.html moze-solo-boss.html amara-starter.html
about.html assets/ styles.css \# 简单样式 site.js \# 可选交互 images/

## 三、页面设计

### 首页（index.html）

-   导航：Top Builds / About
-   Build 卡片（3--6 个），跳转到对应 builds/\*.html
-   视频缩略图（3 个），点击外链到 YouTube
-   页脚：免责声明

### Build 详情页（示例：builds/zane-endgame-shock-dps.html）

-   标题 + 元信息（职业、标签、Patch）
-   TL;DR（3--4 点）
-   技能加点（列表/截图）
-   装备推荐（武器/护盾/掉落点）
-   玩法循环（步骤 1--3）

### About 页面

-   网站介绍
-   免责声明
-   联系方式（邮箱/反馈）

## 四、样式与交互

-   简单 CSS（assets/styles.css）
-   响应式布局：宽度 960px 居中，手机端全宽
-   视频：使用 YouTube 缩略图 + 外链，避免跨域问题

## 五、分析与统计

-   集成 Google Analytics 4 (GA4)
-   方式：在每个 HTML
    ```{=html}
    <head>
    ```
    中插入 gtag 脚本

## 六、部署流程

1.  推送到 GitHub 仓库
2.  Settings → Pages → 部署 main 分支 root
3.  在仓库根目录放置 CNAME 文件：bl4builds.net
4.  DNS 添加 CNAME → `<username>`{=html}.github.io
5.  Enforce HTTPS

## 七、验收标准

-   首页展示 ≥3 个 Build 卡片 + ≥3 个视频缩略图
-   至少 3 篇 Build 详情页完整可访问
-   手机端正常显示
-   GA4 能收到访问数据
-   自定义域名 bl4builds.net 可用，直链不 404

## 八、未来迁移路径

-   版本 1：改用 Markdown/MDX + JSON 索引，仍保持静态
-   版本 2：迁移 Next.js，支持工具/搜索/投稿
-   版本 3：接入数据库/账号体系，支持 ISR/SSR
