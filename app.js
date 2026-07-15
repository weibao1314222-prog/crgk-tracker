// 成人高考报考信息聚合页面 —— 渲染逻辑（无依赖）
(function () {
  "use strict";
  var DATA = window.ADMISSION_DATA;
  var state = { season: "2026", region: "all", status: "all", q: "" };

  var REGIONS = ["直辖市", "省", "自治区"];

  // 2026 实时数据默认模板（未发布时的灰色占位）
  var DEFAULT_LIVE = {
    status: "pending",
    online: "", confirm: "", pay: "", ticket: "",
    exam: "", score: "", admit: "",
    source: "", updatedAt: "", note: ""
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function getData(p) {
    if (state.season === "2025") return p.ref2025;
    // 2026：从独立的 live2026.js 按省份 code 合并，缺失字段用默认模板补齐
    var live = (window.LIVE2026 && window.LIVE2026[p.code]) || {};
    var merged = {};
    Object.keys(DEFAULT_LIVE).forEach(function (k) {
      merged[k] = (live[k] != null ? live[k] : DEFAULT_LIVE[k]);
    });
    return merged;
  }

  function isPublished(d) {
    // 已发布判定：有任意节点填充即视为已发布
    return !!(d.status && d.status === "published") ||
      ["online", "confirm", "pay", "ticket", "exam", "score", "admit"].some(function (k) { return d[k] && String(d[k]).trim() !== ""; });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderStats(provinces) {
    var box = document.getElementById("stats");
    box.innerHTML = "";
    var total = provinces.length;
    var pub = 0, pen = 0;
    provinces.forEach(function (p) {
      if (isPublished(getData(p))) pub++; else pen++;
    });
    var stats = [
      { num: total, lbl: "省份总数", cls: "" },
      { num: pub, lbl: "已发布", cls: "pub" },
      { num: pen, lbl: "未发布", cls: "pen" },
    ];
    stats.forEach(function (s) {
      var d = el("div", "stat " + s.cls);
      d.appendChild(el("div", "num", String(s.num)));
      d.appendChild(el("div", "lbl", s.lbl));
      box.appendChild(d);
    });
  }

  function renderBanner() {
    var b = document.getElementById("banner");
    if (state.season === "2026") {
      b.className = "banner";
      b.innerHTML = "📅 <b>2026 年实时追踪</b>：成人高考报考公告预计 8 月底起由各省市区教育考试院陆续发布，当前尚未发布，均显示为灰色“未发布”。" +
        "一旦某省公告发布，对应节点将自动点亮。点击右上角“2025 参考”可查看去年真实时间节点的拆分效果。";
    } else {
      b.className = "banner ref";
      b.innerHTML = "📚 <b>2025 年参考数据</b>（演示节点拆分）：以下为 2025 年真实报考时间节点，其中“网上报名”与“统考”为当年公告原文，" +
        "其余节点对未单独发布公告的省份采用往年通用时间作参考。2026 年公告发布后将替换为本页实时数据。";
    }
  }

  function renderControls() {
    var chips = document.getElementById("regionChips");
    chips.innerHTML = "";
    var opts = [{ k: "all", t: "全部" }].concat(REGIONS.map(function (r) { return { k: r, t: r }; }));
    opts.forEach(function (o) {
      var c = el("button", "chip" + (state.region === o.k ? " active" : ""), o.t);
      c.onclick = function () { state.region = o.k; render(); };
      chips.appendChild(c);
    });

    var stats = document.getElementById("statusChips");
    stats.innerHTML = "";
    [{ k: "all", t: "全部状态" }, { k: "pub", t: "已发布" }, { k: "pen", t: "未发布" }].forEach(function (o) {
      var c = el("button", "chip" + (state.status === o.k ? " active" : ""), o.t);
      c.onclick = function () { state.status = o.k; render(); };
      stats.appendChild(c);
    });
  }

  function matches(p) {
    if (state.region !== "all" && p.region !== state.region) return false;
    var d = getData(p);
    var pub = isPublished(d);
    if (state.status === "pub" && !pub) return false;
    if (state.status === "pen" && pub) return false;
    if (state.q) {
      var q = state.q.toLowerCase();
      if (p.name.toLowerCase().indexOf(q) === -1 && p.siteName.toLowerCase().indexOf(q) === -1) return false;
    }
    return true;
  }

  function renderCard(p) {
    var d = getData(p);
    var pub = isPublished(d);
    var card = el("div", "card " + (pub ? "published" : "pending"));

    // head
    var head = el("div", "card-head");
    var title = el("div", "card-title");
    title.appendChild(el("span", "pname", p.name));
    title.appendChild(el("span", "region-badge", p.region));
    head.appendChild(title);
    head.appendChild(el("span", "status-badge " + (pub ? "pub" : "pen"), pub ? "已发布" : "未发布"));
    card.appendChild(head);

    // timeline
    var tl = el("div", "timeline");
    DATA.nodeDefs.forEach(function (n, i) {
      var val = d[n.key] || "";
      var filled = String(val).trim() !== "";
      var node = el("div", "node" + (filled ? " filled" : ""));
      node.appendChild(el("div", "dot", String(i + 1)));
      node.appendChild(el("div", "nlabel", n.label));
      node.appendChild(el("div", "nsub", n.sub));
      node.appendChild(el("div", "ndate", filled ? escapeHtml(val) : "待公布"));
      tl.appendChild(node);
    });
    card.appendChild(tl);

    // foot: link + tip
    var foot = el("div", "card-foot");
    var link = el("a", "card-link", "🔗 " + p.siteName + " ↗");
    link.href = p.site;
    link.target = "_blank";
    link.rel = "noopener";
    foot.appendChild(link);
    foot.appendChild(el("span", "tip", pub ? "点击卡片展开完整节点" : "点击卡片查看官网入口"));
    card.appendChild(foot);

    // detail
    var detail = el("div", "detail");
    DATA.nodeDefs.forEach(function (n) {
      var val = d[n.key] || "";
      var row = el("div", "drow");
      row.appendChild(el("div", "dk", n.label));
      row.appendChild(el("div", "dv", val ? escapeHtml(val) : "（未公布）"));
      detail.appendChild(row);
    });
    if (d.source) {
      var sr = el("div", "drow");
      sr.appendChild(el("div", "dk", "信息来源"));
      sr.appendChild(el("div", "dv"));
      sr.querySelector(".dv").appendChild(el("span", "src", escapeHtml(d.source)));
      detail.appendChild(sr);
    }
    if (d.note) {
      var nr = el("div", "drow");
      nr.appendChild(el("div", "dk", "备注"));
      nr.appendChild(el("div", "dv", escapeHtml(d.note)));
      detail.appendChild(nr);
    }
    if (d.updatedAt) {
      var ur = el("div", "drow");
      ur.appendChild(el("div", "dk", "更新时间"));
      ur.appendChild(el("div", "dv", escapeHtml(d.updatedAt)));
      detail.appendChild(ur);
    }
    card.appendChild(detail);

    card.onclick = function (e) {
      if (e.target.tagName === "A") return;
      card.classList.toggle("open");
    };
    return card;
  }

  function render() {
    renderBanner();
    renderControls();
    var list = DATA.provinces.filter(matches);
    var grid = document.getElementById("grid");
    grid.innerHTML = "";
    if (!list.length) {
      grid.appendChild(el("div", "tip", "没有匹配的省份。"));
    } else {
      list.forEach(function (p) { grid.appendChild(renderCard(p)); });
    }
    renderStats(DATA.provinces);
    document.getElementById("lastUpdated").textContent = computeLastUpdated();
    document.getElementById("examDate").textContent = DATA.meta.examDate;
  }

  // 取各省 2026 实时数据中最新的一条 updatedAt，作为页面“数据最后更新”
  function computeLastUpdated() {
    var max = "";
    var map = window.LIVE2026 || {};
    Object.keys(map).forEach(function (code) {
      var u = map[code] && map[code].updatedAt;
      if (u && String(u).trim() !== "" && String(u) > max) max = String(u);
    });
    return max || DATA.meta.lastUpdated;
  }

  function init() {
    // season toggle
    var t2026 = document.getElementById("t2026");
    var t2025 = document.getElementById("t2025");
    t2026.onclick = function () { state.season = "2026"; t2026.classList.add("active"); t2025.classList.remove("active"); render(); };
    t2025.onclick = function () { state.season = "2025"; t2025.classList.add("active"); t2026.classList.remove("active"); render(); };

    var search = document.getElementById("search");
    search.oninput = function () { state.q = search.value.trim(); render(); };

    document.getElementById("examDate").textContent = DATA.meta.examDate;
    document.getElementById("lastUpdated").textContent = DATA.meta.lastUpdated;
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
