# 热门板块页面改版计划

## Context

当前 BlockRankPage 调用的是自定义后端 `http://152.136.147.208:8233/get_bankuai_lists`，该接口已失效（返回空数组）。同花顺 10jqka API 可用，直接返回 60 个交易日的板块排行数据，只需前端直连。

## 改动内容

### 1. 替换 `blockRankModel.js` — 改为直连同花顺 API

**文件**: `web/src/components/models/blockRankModel.js`

- 移除原有 `BlockRankItem`/`BlockRankResponse` 类定义
- `fetchBlockRank()` 改为 GET 请求 `https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/hot_block_list?type=con&field=zf`
- 需携带 `Referer: https://eq.10jqka.com.cn/` 头（否则 401）
- 解析 `data.data_list[].block_list[]`，每个板块提取：`name`、`info.zf`（涨幅）、`date`
- 返回格式保持与当前页面兼容：`{ "2026-04-24": [{name, price}, ...], ... }`，其中 `price` 用 `zf` 值（如 "2.49" 表示 +2.49%）

### 2. 重构 `BlockRankPage.vue` 样式

**文件**: `web/src/components/page/BlockRankPage.vue`

参考设计图样式，保持现有 table 列结构（日期为列、排名为行），调整：

- 板块名 + 涨跌幅上下排列，涨跌幅红色加粗显示（如 `+2.49%`）
- 排名数字左侧显示，1-3 名用红/橙/黄色背景方块
- 保持 `isTopRankBlock` 逻辑（当日第一名板块名高亮加粗）
- 单元格最小宽度适当调整
- 去掉现有的 `up-percent`/`down-percent` 复杂逻辑，统一红色显示涨幅

### 3. 数据处理适配

- API 返回 60 天数据，每 10 个板块。`tableData` 逻辑不变，显示前 20 行
- `dates` 从 `rawData` 的 key 提取，按日期倒序排列
- `formatDate` 输出 `MM-DD` 格式

### 4. 验证

- `npm run build` 确认编译通过
- Chrome 打开 `/BlockRankPage` 确认数据正常加载
- 截图验证样式与设计图一致
