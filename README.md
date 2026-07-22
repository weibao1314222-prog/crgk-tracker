# 全国成人高考报考信息追踪

聚合全国 **31 个省市区**教育考试院的成人高考（成人高校招生）报考公告，按时间节点拆分展示：

**网上报名 → 现场确认 → 缴费截止 → 准考证打印 → 全国统一考试 → 成绩查询 → 录取查询**

- 未发布省份**灰色**显示，已发布省份自动**点亮**对应节点。
- 数据由**每日自动任务**更新（默认每天 9:00 核查各省官网并同步到本页）。
- 纯静态、零依赖，可直接用浏览器打开，也可托管到 GitHub Pages 给团队共享。

---

## 一、给同事/团队部署一套（复制本仓库）

本仓库已设为 **Template（模板）**，一键复制即可拥有你自己的独立实例：

1. 打开 **https://github.com/weibao1314222-prog/crgk-tracker**
2. 点右上角 **`Use this template`** → 填仓库名（建议 `crgk-tracker`）→ **Create repository**
3. 进新仓库 **Settings → Pages**，Source 选 `main` 分支、目录 `/(root)` → Save
   - 约 1 分钟后得到固定公网网址：`https://<你的用户名>.github.io/<仓库名>/`
   - 嫌手动点麻烦，也可在本机克隆后运行 `./enable_pages.sh <你的token>`（见后文）
4. （可选）在 **WorkBuddy** 里让 AI 创建每日自动更新任务，提示词见 **`AUTOMATION_PROMPT.md`**

> 直接用浏览器打开 `index.html` 也能看（无需起服务），但公网网址才能给团队共享、且每日自动刷新。

---

## 二、文件结构

| 文件 | 作用 |
|------|------|
| `index.html` / `styles.css` / `app.js` | 前端页面（纯静态，无第三方依赖） |
| `data.js` | 静态数据：31 省信息、官网链接、7 个时间节点定义、2025 参考 |
| `live2026.js` | 2026 实时数据（由每日任务整体重写，**请勿手改**） |

> 自动更新只会重写 `live2026.js`，`data.js` 等模板文件保持不动，安全且可重复部署。

---

## 三、每日自动更新说明

自动任务每天核查 31 省教育考试院官网，把结果写进 `live2026.js`，再同步到 GitHub Pages。

- 在**部分网络环境**下 git 协议端口（`github.com:443`）不通，因此本方案用 **GitHub Contents API**（`api.github.com`）更新文件，比 `git push` 更稳。
- 任务需要能写你仓库的 token（经典 PAT，`repo` 权限），建议通过 `git remote` 的 URL 内置，或按 `AUTOMATION_PROMPT.md` 配置。

---

## 四、enable_pages.sh 用法（可选，自动化开通 Pages）

```bash
# 在本机克隆你的模板仓库后：
cd crgk-tracker
chmod +x enable_pages.sh
./enable_pages.sh <你的GitHub经典PAT>        # 自动开启 Pages 并打印网址
```

脚本会从 `git remote` 读取仓库信息，调用 GitHub API 开启 Pages。

---

## 五、注意

- 自动抓取 31 个异构官网可靠性有限：官网结构各异，解析不出的省份会被标「待人工核对」、绝不臆造日期。关键报考信息请以官网原文为准。
- 各省报名公告通常每年 **8 月底–9 月中旬**集中发布，期间重点关注。
- GitHub PAT 有有效期，到期前需更换，否则自动推送会失败。
