/**
 * AnimeGallery · 应用逻辑
 * 负责：渲染分类 / 瀑布流卡片 / 图片懒加载 / 筛选搜索 / 详情弹窗
 */
(function () {
  "use strict";

  const { CATEGORIES, loadCategory } = window.__DATA__;
  let WALLPAPERS = [];           // 当前分类的壁纸数据
  const catCounts = {};          // 各分类壁纸数量（init 时计算，不随分类切换变化）
  let totalCount = 0;            // 壁纸总数（init 时计算）

  /* ---------- DOM 引用 ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    statTotal: $("#statTotal"),
    statCat: $("#statCat"),
    catsTrack: $("#catsTrack"),
    masonry: $("#masonry"),
    pager: $("#pager"),
    gallery: $("#gallery"),
    empty: $("#empty"),
    resetBtn: $("#resetBtn"),
    searchInput: $("#searchInput"),
    nav: $("#nav"),
    toTop: $("#toTop"),
    modal: $("#modal"),
    modalImg: $("#modalImg"),
    modalCat: $("#modalCat"),
    modalTitle: $("#modalTitle"),
    modalDesc: $("#modalDesc"),
    modalTags: $("#modalTags"),
    modalDownload: $("#modalDownload"),
    modalFav: $("#modalFav"),
    imgLoader: $(".modal__img-loader"),
    loader: $("#loader"),
    year: $("#year"),
  };

  /* ---------- 状态 ---------- */
  const PAGE_SIZE = 20; // 每页卡片数量
  const PAGER_VISIBLE = 1; // 当前页前后各显示多少个页码

  const state = {
    activeCat: "all",
    keyword: "",
    currentId: null,
    page: 1,
    favorites: new Set(loadFav())
  };

  function loadFav() {
    try { return JSON.parse(localStorage.getItem("ag_fav") || "[]"); }
    catch { return []; }
  }
  function saveFav() {
    try { localStorage.setItem("ag_fav", JSON.stringify([...state.favorites])); } catch {}
  }

  /* ---------- 工具 ---------- */
  const catName = (id) => (CATEGORIES.find(c => c.id === id) || {}).name || id;

  /* ---------- 渲染：统计 ---------- */
  function renderStats() {
    els.statTotal.textContent = totalCount;
    els.statCat.textContent = CATEGORIES.filter(c => c.id !== "all").length;
    els.year.textContent = new Date().getFullYear();
  }

  /* ---------- 渲染：分类导航 ---------- */
  function renderCats() {
    els.catsTrack.innerHTML = CATEGORIES.map(c => {
      const badge = c.id === "all" ? "" : `<span class="cat__count">${catCounts[c.id] || 0}</span>`;
      return `
      <button class="cat ${c.id === state.activeCat ? "is-active" : ""}" data-cat="${c.id}">
        <span class="cat__icon">${c.icon}</span>${c.name}${badge}
      </button>`;
    }).join("");
  }

  /* ---------- 渲染：壁纸卡片 ---------- */
  function getFiltered() {
    const kw = state.keyword.trim().toLowerCase();
    if (!kw) return WALLPAPERS;
    return WALLPAPERS.filter(w => {
      const hay = (w.title + " " + w.desc + " " + (w.tags || []).join(" ") + " " + catName(w.category)).toLowerCase();
      return hay.includes(kw);
    });
  }

  function renderCards() {
    const list = getFiltered();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;

    if (!list.length) {
      els.masonry.innerHTML = "";
      els.empty.style.display = "block";
      els.pager.hidden = true;
      return;
    }
    els.empty.style.display = "none";

    const start = (state.page - 1) * PAGE_SIZE;
    const pageList = list.slice(start, start + PAGE_SIZE);

    els.masonry.innerHTML = pageList.map((w, i) => `
      <article class="card" data-id="${w.id}" style="animation-delay:${Math.min(i, 12) * 60}ms">
        <div class="card__img-wrap">
          <div class="card__skeleton"></div>
          <img class="card__img" src="${w.thumb}" alt="${escapeHtml(w.title)}" decoding="async" />
          <div class="card__overlay">
            <span class="card__cat">${catName(w.category)}</span>
            <span class="card__title">${escapeHtml(w.title)}</span>
          </div>
          <span class="card__view" aria-hidden="true">⤢</span>
        </div>
      </article>
    `).join("");

    // 绑定加载完成事件以移除骨架屏
    $$(".card__img").forEach(attachImgHandlers);
    renderPager(list.length, totalPages);
  }

  /* ---------- 渲染：分页器 ---------- */
  function renderPager(total, totalPages) {
    // 只有一页时不显示分页器
    if (totalPages <= 1) {
      els.pager.hidden = true;
      els.pager.innerHTML = "";
      return;
    }
    els.pager.hidden = false;

    const cur = state.page;
    const items = [];

    // 上一页
    items.push(pagerNode("‹", cur === 1 ? null : cur - 1, "pager__prev", cur === 1));

    // 页码：始终显示第 1 页与当前页附近，超出部分用省略号
    const pages = new Set([1, totalPages, cur - PAGER_VISIBLE, cur, cur + PAGER_VISIBLE]);
    let last = 0;
    Array.from(pages).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b).forEach(p => {
      if (p - last > 1) items.push(pagerNode("…", null, "pager__ellipsis", true));
      items.push(pagerNode(String(p), p, p === cur ? "is-active" : "", false));
      last = p;
    });

    // 下一页
    items.push(pagerNode("›", cur === totalPages ? null : cur + 1, "pager__next", cur === totalPages));

    els.pager.innerHTML = items.join("");
  }

  function pagerNode(label, page, extraClass, disabled) {
    const cls = ["pager__btn"];
    if (extraClass) cls.push(extraClass);
    const dataAttr = page != null ? `data-page="${page}"` : "";
    const disAttr = disabled ? "aria-disabled=\"true\" tabindex=\"-1\"" : "";
    return `<button class="${cls.join(" ")}" ${dataAttr} ${disAttr}>${label}</button>`;
  }

  /* ---------- 切换页码 ---------- */
  function selectPage(page) {
    const total = getFiltered().length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page < 1 || page > totalPages || page === state.page) return;
    state.page = page;
    renderCards();
    // 滚动到瀑布流顶部（避开 sticky 导航与分类栏）
    const top = els.gallery.getBoundingClientRect().top + window.scrollY - (varNavH() + 56);
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  // 读取 --nav-h 的像素值，用于分页跳转偏移
  function varNavH() {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--nav-h").trim();
    return parseFloat(v) || 64;
  }

  /* ---------- 图片加载：骨架屏淡出 / 错误占位 ---------- */
  function attachImgHandlers(img) {
    const card = img.closest(".card");
    const skel = card && card.querySelector(".card__skeleton");
    const imgWrap = img.closest(".card__img-wrap");

    const finish = () => {
      img.classList.add("loaded");
      if (!skel) return;
      skel.classList.add("fade-out");
      skel.addEventListener("transitionend", () => skel.remove(), { once: true });
    };

    const fail = () => {
      if (imgWrap) imgWrap.classList.add("is-error");
      if (skel) skel.remove();
    };

    // 兼容已缓存（complete）的图片
    if (img.complete && img.naturalWidth > 0) {
      finish();
      return;
    }
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", fail, { once: true });
  }

  /* ---------- 转义 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  /* ---------- 选中分类 ---------- */
  async function selectCat(id) {
    state.activeCat = id;
    // 切换分类时清掉残留搜索词，避免组合筛选导致空状态
    state.keyword = "";
    state.page = 1;
    els.searchInput.value = "";
    $$(".cat").forEach(b => b.classList.toggle("is-active", b.dataset.cat === id));
    // 让选中项在容器内水平居中（仅滚动容器本身，避免触发整页垂直/水平滚动）
    const active = $$(".cat").find(b => b.dataset.cat === id);
    if (active) {
      const track = els.catsTrack;
      const trackRect = track.getBoundingClientRect();
      const btnRect = active.getBoundingClientRect();
      const delta = (btnRect.left - trackRect.left) + btnRect.width / 2 - track.clientWidth / 2;
      track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
    }
    // 按需加载该分类数据（命中缓存则零网络请求）
    WALLPAPERS = await loadCategory(id);
    renderCards();
  }

  /* ---------- 详情弹窗 ---------- */
  function openModal(id) {
    const w = WALLPAPERS.find(x => x.id === id);
    if (!w) return;
    state.currentId = w.id;

    els.modalImg.classList.remove("loaded");
    els.imgLoader.classList.remove("hide");
    els.modalImg.alt = w.title;
    els.modalCat.textContent = catName(w.category);
    els.modalTitle.textContent = w.title;
    els.modalDesc.textContent = w.desc;
    els.modalTags.innerHTML = (w.tags || []).map(t => `<span class="modal__tag">#${escapeHtml(t)}</span>`).join("");

    // 下载链接使用高清原图
    els.modalDownload.href = w.src;
    els.modalDownload.download = `AnimeGallery_${w.title}${w.type}`;

    // 收藏按钮状态
    syncFavBtn(w.id);

    // 加载大图
    const tester = new Image();
    tester.onload = () => {
      els.modalImg.src = w.src;
      els.modalImg.classList.add("loaded");
      els.imgLoader.classList.add("hide");
    };
    tester.onerror = () => {
      els.modalImg.src = w.src;
      els.imgLoader.classList.add("hide");
    };
    tester.src = w.src;

    els.modal.classList.add("open");
    els.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modal.classList.remove("open");
    els.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    els.modalImg.src = "";
  }

  function syncFavBtn(id) {
    const active = state.favorites.has(id);
    els.modalFav.textContent = active ? "已收藏 ♥" : "收藏 ♡";
    els.modalFav.style.color = active ? "var(--accent)" : "";
  }

  function toggleFav(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    saveFav();
    syncFavBtn(id);
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    // 分类点击
    els.catsTrack.addEventListener("click", (e) => {
      const btn = e.target.closest(".cat");
      if (btn) selectCat(btn.dataset.cat);
    });

    // 搜索（防抖）—— 搜索视为全局行为，自动回到"全部"分类，避免与分类叠加产生空状态
    let timer;
    els.searchInput.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (state.activeCat !== "all") {
          state.activeCat = "all";
          WALLPAPERS = await loadCategory("all");
          $$(".cat").forEach(b => b.classList.toggle("is-active", b.dataset.cat === "all"));
        }
        state.keyword = els.searchInput.value;
        state.page = 1;
        renderCards();
      }, 180);
    });

    // 卡片点击 -> 弹窗
    els.masonry.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) openModal(card.dataset.id);
    });

    // 分页点击
    els.pager.addEventListener("click", (e) => {
      const btn = e.target.closest(".pager__btn");
      if (!btn || btn.hasAttribute("aria-disabled")) return;
      const p = parseInt(btn.dataset.page, 10);
      if (!isNaN(p)) selectPage(p);
    });

    // 弹窗关闭
    els.modal.addEventListener("click", (e) => {
      if (e.target.dataset.close !== undefined || e.target === els.modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.modal.classList.contains("open")) closeModal();
    });

    // 收藏
    els.modalFav.addEventListener("click", () => {
      if (state.currentId) toggleFav(state.currentId);
    });

    // 重置筛选
    els.resetBtn.addEventListener("click", async () => {
      state.activeCat = "all";
      state.keyword = "";
      state.page = 1;
      els.searchInput.value = "";
      WALLPAPERS = await loadCategory("all");
      renderCats();
      renderCards();
    });

    // 滚动：导航/回到顶部
    const onScroll = () => {
      const y = window.scrollY;
      els.nav.classList.toggle("scrolled", y > 20);
      els.toTop.classList.toggle("show", y > 600);
      els.toTop.hidden = false;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    els.toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- 启动 ---------- */
  function showLoader(on) {
    if (els.loader) els.loader.style.display = on ? "block" : "none";
    if (on) els.empty.style.display = "none";
  }

  async function init() {
    showLoader(true);
    try {
      WALLPAPERS = await loadCategory("all");
      // 计算各分类数量和总数（仅一次，后续切换分类不重复计算）
      totalCount = WALLPAPERS.length;
      CATEGORIES.forEach(c => {
        if (c.id !== "all") {
          catCounts[c.id] = WALLPAPERS.filter(w => w.category === c.id).length;
        }
      });
    } catch (e) {
      console.error("壁纸加载失败:", e);
    }
    showLoader(false);
    renderStats();
    renderCats();
    renderCards();
    bindEvents();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
