# 每日自动更新任务 —— 部署提示词

把下面的提示词**直接发给 WorkBuddy（你自己的对话里）**，让它帮你创建每日自动更新任务。
使用前请把两处 `{{ }}` 占位符替换成你自己的值：

- `{{WORKSPACE_PATH}}`：你机器上本仓库克隆后的**绝对路径**（例如 `/Users/你/WorkBuddy/crgk-tracker`）
- `{{OWNER/REPO}}`：你自己的仓库，例如 `zhangsan/crgk-tracker`

> 任务运行需要能写你仓库的 token。最省事的做法：克隆后给 remote 设置带 token 的 URL，
> 任务会自动从中提取，无需在提示词里写明文 token：
> ```bash
> git remote set-url origin https://<你的用户名>:<你的PAT>@github.com/{{OWNER/REPO}}.git
> ```

---

## 复制给 WorkBuddy 的提示词

```
创建一个每日 9:00 自动运行的任务，名称「成人高考报考信息每日追踪」。

任务要做的事（每天执行）：
1. 读取 {{WORKSPACE_PATH}}/data.js，取出 provinces 数组里每个省的 code、site（官网）、siteName，作为核查清单（共 31 个）。
2. 读取当前 {{WORKSPACE_PATH}}/live2026.js，拿到现有 window.LIVE2026 对象（保留之前已发布省份的数据，不要丢失）。
3. 用 WebSearch / WebFetch 逐个核查各省官网是否发布了当年成人高考报名/招生工作通知。
   - 若已发布：读取公告原文，提取节点 online(网上报名起止)、confirm(现场确认/资格审核)、pay(缴费截止)、ticket(准考证打印)、exam(统考时间)、score(成绩查询)、admit(录取查询)，写入该省；status 设 'published'，source 填公告原文链接，updatedAt 填今天(YYYY-MM-DD)，note 可补充要点。
   - 若未发布：保持 status 'pending'、各节点留空（不要删除该 code 键，也不要改已发布省份的数据）。
4. 用 Write 工具整体覆盖 {{WORKSPACE_PATH}}/live2026.js，文件开头保留注释，内容为：
   // 本文件由「每日自动任务」整体重写，请勿手改。
   // 结构：按省份 code 索引，每个值为该省当年实时报考节点。
   // status: 'pending'(未发布/灰色) | 'published'(已发布/点亮)
   window.LIVE2026 = { 完整 31 个 code 的 JSON，2 空格缩进 };
   注意 JSON 必须合法、31 个 code 一个都不能少。
5. 用 GitHub Contents API 把更新推送到公网（本环境若 github.com:443 不通，则走 api.github.com）：
   a. 提取 token：TOKEN=$(git -C {{WORKSPACE_PATH}} config remote.origin.url | sed -E 's#https://[^:]+:([^@]+)@.*#\1#'); export GH_TOKEN="$TOKEN"
   b. 用 gh api 获取远程 live2026.js 的 sha，再把本地文件 base64 后 PUT 到 repos/{{OWNER/REPO}}/contents/live2026.js（message 写"每日更新：YYYY-MM-DD"，带 sha）。
   c. 推送成功后约 1 分钟，公网页 https://<你的用户名>.github.io/<仓库名>/ 自动刷新。
   严禁使用 git push（若端口不通会超时）；也不要 git commit（只用 Contents API 更新远程文件）。
6. 完成后用一段话汇报：今日新发布几省、分别是什么、哪些省仍待发布、是否已成功推送。

铁律：仅以官方公告原文为准，不确定时绝不臆造日期；成人高考报名通常每年 8 月底至 9 月中旬集中发布，此期间须重点关注。
```

---

## 验证任务是否生效

- 第二天打开你的公网网址，看页脚「数据最后更新」是否变成当天的日期。
- 或在 WorkBuddy 里手动触发一次该任务，看汇报里是否出现「已成功推送」。
