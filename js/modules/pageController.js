// =============================================================================
// Page Controller - Main page switching and global nav state
// =============================================================================

import { onLangChange } from "./langController.js";

export function initPageController(options = {}) {
  const {
    onTablePageShown,
    onVirtualLabPageShown,
    onVirtualLabPageHidden,
  } = options;

  const mainContainer = document.getElementById("main-container");
  const virtualLabPage = document.getElementById("virtual-lab-page");

  let currentPage = "table";

  const pages = {
    table: () => {
      if (mainContainer) mainContainer.style.display = "";
    },
    "virtual-lab": () => {
      if (virtualLabPage) virtualLabPage.classList.add("active");
    },
  };

  function hideAllPages() {
    if (currentPage === "virtual-lab" && typeof onVirtualLabPageHidden === "function") {
      onVirtualLabPageHidden();
    }
    if (mainContainer) mainContainer.style.display = "none";
    if (virtualLabPage) virtualLabPage.classList.remove("active");
  }

  function showPage(page) {
    if (!pages[page] || currentPage === page) return;

    hideAllPages();
    pages[page]();
    currentPage = page;

    if (page === "table" && typeof onTablePageShown === "function") {
      requestAnimationFrame(onTablePageShown);
    }

    if (page === "virtual-lab" && typeof onVirtualLabPageShown === "function") {
      onVirtualLabPageShown();
    }
  }

  const globalNavBtns = document.querySelectorAll(".nav-pill-btn, .nav-logo-link, .nav-brand");
  const navPageMap = {
    table: "table",
    "virtual-lab": "virtual-lab",
    lab: "virtual-lab",
  };

  function updateGlobalNavActive(activePage) {
    globalNavBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === activePage);
    });
    moveSliderTo(activePage);
  }

  // ── Sliding pill indicator ──
  const pillContainer = document.querySelector(".global-nav-pill");
  const pillBtns = pillContainer ? pillContainer.querySelectorAll(".nav-pill-btn") : [];
  let slider = null;
  let sliderRefreshFrame = null;

  function positionSlider(activeBtn, { immediate = false } = {}) {
    if (!slider || !pillContainer || !activeBtn) return;

    const containerRect = pillContainer.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    if (immediate) slider.style.transition = "none";
    slider.style.width = `${btnRect.width}px`;
    slider.style.transform = `translateX(${btnRect.left - containerRect.left}px)`;

    if (immediate) {
      requestAnimationFrame(() => {
        if (slider) slider.style.transition = "";
      });
    }
  }

  function refreshSliderPosition(immediate = false) {
    if (!pillContainer) return;
    const activeBtn = pillContainer.querySelector(".nav-pill-btn.active");
    if (activeBtn) positionSlider(activeBtn, { immediate });
  }

  function scheduleSliderRefresh() {
    if (sliderRefreshFrame !== null) return;

    sliderRefreshFrame = requestAnimationFrame(() => {
      sliderRefreshFrame = null;
      refreshSliderPosition(true);
    });
  }

  function createSlider() {
    if (!pillContainer || pillBtns.length === 0) return;
    slider = document.createElement("div");
    slider.className = "nav-pill-slider";
    pillContainer.appendChild(slider);
    refreshSliderPosition(true);
  }

  function moveSliderTo(page) {
    const targetBtn = pillContainer.querySelector(`.nav-pill-btn[data-page="${page}"]`);
    positionSlider(targetBtn);
  }

  createSlider();

  // Recalculate slider position on resize
  window.addEventListener("resize", scheduleSliderRefresh);

  // Recalculate after language change (button text width changes)
  onLangChange(() => requestAnimationFrame(() => refreshSliderPosition(true)));

  globalNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      const target = navPageMap[page];
      if (!target) return;
      showPage(target);
      updateGlobalNavActive(page);
    });
  });

  updateGlobalNavActive("table");

  return {
    showPage,
    updateGlobalNavActive,
    getCurrentPage: () => currentPage,
  };
}
