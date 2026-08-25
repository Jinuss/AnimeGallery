/**
 * AnimeGallery · 应用逻辑
 * 负责：渲染分类 / 瀑布流卡片 / 图片懒加载 / 筛选搜索 / 详情弹窗
 */
(function () {
  "use strict";

  const { CATEGORIES, loadWallpapers } = window.__DATA__;
  let WALLPAPERS = [];

  /* ---------- DOM 引用 ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    statTotal: $("#statTotal"),
    statCat: $("#statCat"),
    catsTrack: $("#catsTrack"),
    masonry: $("#masonry"),
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
  const state = {
    activeCat: "all",
    keyword: "",
    currentId: null,
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
    els.statTotal.textContent = WALLPAPERS.length;
    els.statCat.textContent = CATEGORIES.filter(c => c.id !== "all").length;
    els.year.textContent = new Date().getFullYear();
  }

  /* ---------- 渲染：分类导航 ---------- */
  function renderCats() {
    els.catsTrack.innerHTML = CATEGORIES.map(c => `
      <button class="cat ${c.id === state.activeCat ? "is-active" : ""}" data-cat="${c.id}">
        <span class="cat__icon">${c.icon}</span>${c.name}
      </button>
    `).join("");
  }

  /* ---------- 渲染：壁纸卡片 ---------- */
  function getFiltered() {
    const kw = state.keyword.trim().toLowerCase();
    return WALLPAPERS.filter(w => {
      const inCat = state.activeCat === "all" || w.category === state.activeCat;
      if (!inCat) return false;
      if (!kw) return true;
      const hay = (w.title + " " + w.desc + " " + (w.tags || []).join(" ") + " " + catName(w.category)).toLowerCase();
      return hay.includes(kw);
    });
  }

  function renderCards() {
    const list = getFiltered();

    if (!list.length) {
      els.masonry.innerHTML = "";
      els.empty.style.display = "block";
      return;
    }
    els.empty.style.display = "none";

    els.masonry.innerHTML = list.map((w, i) => `
      <article class="card" data-id="${w.id}" style="animation-delay:${Math.min(i, 12) * 60}ms">
        <div class="card__img-wrap">
          <div class="card__skeleton"></div>
          <img class="card__img" src="${w.thumb}" alt="${escapeHtml(w.title)}" loading="lazy" decoding="async" />
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
  }

  /* ---------- 图片加载：移除骨架屏 ---------- */
  function attachImgHandlers(img) {
    const card = img.closest(".card");
    const skel = card && card.querySelector(".card__skeleton");
    const done = () => {
      img.classList.add("loaded");
      if (skel) skel.remove();
    };
    // 兼容已缓存（complete）的图片
    if (img.complete && img.naturalWidth > 0) {
      done();
      return;
    }
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }

  /* ---------- 转义 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  /* ---------- 选中分类 ---------- */
  function selectCat(id) {
    state.activeCat = id;
    // 切换分类时清掉残留搜索词，避免组合筛选导致空状态
    state.keyword = "";
    els.searchInput.value = "";
    $$(".cat").forEach(b => b.classList.toggle("is-active", b.dataset.cat === id));
    // 让选中项滚动可见
    const active = $$(".cat").find(b => b.dataset.cat === id);
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
    els.modalDownload.download = `AnimeGallery_${w.title}.png`;

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
    els.searchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (state.activeCat !== "all") {
          state.activeCat = "all";
          $$(".cat").forEach(b => b.classList.toggle("is-active", b.dataset.cat === "all"));
        }
        state.keyword = e.target.value;
        renderCards();
      }, 180);
    });

    // 卡片点击 -> 弹窗
    els.masonry.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) openModal(card.dataset.id);
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
    els.resetBtn.addEventListener("click", () => {
      state.activeCat = "all";
      state.keyword = "";
      els.searchInput.value = "";
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
    if (els.loader) els.loader.style.display = !on ? "block" : "none";
    if (on) els.empty.style.display = "none";
  }

  async function init() {
    showLoader(true);
    try {
      WALLPAPERS = await loadWallpapers();
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
