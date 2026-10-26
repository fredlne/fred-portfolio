
document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // 01. PROJECT DATA
  // =====================================

  const projects = {
    gaming: {
      title: "Gaming Platform 2.0",
      images: [
        "./images/project-1/1-1.png",
        "./images/project-1/1-2.png",
        "./images/project-1/1-3.png",
        "./images/project-1/1-4.png",
        "./images/project-1/1-5.png"
      ]
    },

    app: {
      title: "App Interface Design",
      images: [
        "./images/project-2/2-1.png",
        "./images/project-2/2-2.png",
        "./images/project-2/2-3.png"
      ]
    },

    smartcat: {
      title: "Smartcat",
      images: [
        "./images/project-3/3-1.png",
        "./images/project-3/3-2.png",
        "./images/project-3/3-3.png",
        "./images/project-3/3-4.png",
        "./images/project-3/3-5.png",
        "./images/project-3/3-6.png"
      ]
    }
  };


  // =====================================
  // 02. PORTFOLIO MODAL
  // =====================================

  const modal = document.getElementById("portfolioModal");

  if (modal) {

    const modalBox = modal.querySelector(".portfolio-modal-box");
    const modalImage = document.getElementById("portfolioModalImage");
    const modalTitle = document.getElementById("portfolioModalTitle");
    const modalCounter = document.getElementById("portfolioModalCounter");

    const prevBtn = modal.querySelector(".portfolio-modal-prev");
    const nextBtn = modal.querySelector(".portfolio-modal-next");
    const closeBtn = modal.querySelector(".portfolio-modal-close");
    const imageArea = modal.querySelector(".portfolio-modal-image");

    if (
      modalBox &&
      modalImage &&
      modalTitle &&
      modalCounter &&
      prevBtn &&
      nextBtn &&
      closeBtn &&
      imageArea
    ) {

      let currentProject = null;
      let currentIndex = 0;
      let startX = 0;

      let previousFocus = null;
      let previousOverflow = "";

      // 防止快速切換時舊圖片覆蓋新圖片
      let imageRequestId = 0;

      // 儲存圖片載入狀態
      const imageCache = new Map();


      // =====================================
      // 03. IMAGE PRELOADING
      // =====================================

      function preloadImage(src) {

        if (imageCache.has(src)) {
          return imageCache.get(src);
        }

        const image = new Image();
        image.decoding = "async";

        // 先設定事件，再指定 src
        const loaded = new Promise((resolve, reject) => {

          image.onload = async () => {
            try {
              if (typeof image.decode === "function") {
                await image.decode();
              }
              resolve(image);
            } catch (error) {
              // 圖片已載入但 decode 不支援或失敗
              resolve(image);
            }
          };

          image.onerror = () => {
            reject(new Error(`圖片載入失敗：${src}`));
          };

        });

        image.src = src;

        // 失敗時清除快取，允許重新嘗試
        const cached = loaded.catch(error => {
          imageCache.delete(src);
          throw error;
        });

        imageCache.set(src, cached);

        return cached;
      }


      // =====================================
      // 04. PRELOAD NEARBY IMAGES
      // =====================================

      function preloadNearbyImages() {

        if (!currentProject) return;

        const images = currentProject.images;

        const nextIndex = currentIndex + 1;
        const prevIndex = currentIndex - 1;

        if (nextIndex < images.length) {
          preloadImage(images[nextIndex]).catch(() => {});
        }

        if (prevIndex >= 0) {
          preloadImage(images[prevIndex]).catch(() => {});
        }
      }


      // =====================================
      // 05. UPDATE IMAGE
      // =====================================

      async function updateImage() {

        if (!currentProject) return;

        const project = currentProject;
        const index = currentIndex;
        const src = project.images[index];

        const requestId = ++imageRequestId;

        // 更新標題及圖片數量
        modalTitle.textContent = project.title;

        modalCounter.textContent =
          `${index + 1} / ${project.images.length}`;

        // 控制左右箭頭
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === project.images.length - 1;

        // 如果圖片還沒準備好，保持上一張顯示
        // 避免畫面突然空白

        try {

          await preloadImage(src);

          // 如果使用者已經切換到別張，取消舊請求
          if (requestId !== imageRequestId) return;

          if (!modal.classList.contains("active")) return;

          // 只有圖片準備好才更新 src
          if (modalImage.getAttribute("src") !== src) {
            modalImage.src = src;
          }

          modalImage.alt =
            `${project.title} - 第 ${index + 1} 張圖片`;

          // 預載入前後圖片
          preloadNearbyImages();

        } catch (error) {

          if (requestId !== imageRequestId) return;

          console.error(error);

        }
      }


      // =====================================
      // 06. OPEN MODAL
      // =====================================

      function openModal(projectId) {

        const selectedProject = projects[projectId];

        if (!selectedProject || !selectedProject.images.length) {
          return;
        }

        currentProject = selectedProject;
        currentIndex = 0;

        previousFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;

        // 清除上一個專案的圖片
        modalImage.removeAttribute("src");

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        updateImage();

        closeBtn.focus();
      }


      // =====================================
      // 07. NEXT / PREVIOUS
      // =====================================

      function nextImage() {

        if (!currentProject) return;

        if (currentIndex < currentProject.images.length - 1) {
          currentIndex++;
          updateImage();
        }
      }

      function prevImage() {

        if (!currentProject) return;

        if (currentIndex > 0) {
          currentIndex--;
          updateImage();
        }
      }


      // =====================================
      // 08. CLOSE MODAL
      // =====================================

      function closeModal() {

        // 取消尚未完成的圖片切換
        imageRequestId++;

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = previousOverflow;

        currentProject = null;

        modalImage.removeAttribute("src");

        if (previousFocus && previousFocus.isConnected) {
          previousFocus.focus();
        }
      }


      // =====================================
      // 09. PROJECT CARD EVENTS
      // =====================================

      document.querySelectorAll(".project-card[data-project]")
        .forEach(card => {

          card.addEventListener("click", event => {

            event.preventDefault();

            openModal(card.dataset.project);

          });

        });


      // =====================================
      // 10. BUTTON EVENTS
      // =====================================

      prevBtn.addEventListener("click", prevImage);
      nextBtn.addEventListener("click", nextImage);
      closeBtn.addEventListener("click", closeModal);


      // 點擊遮罩關閉
      modal.addEventListener("click", event => {

        if (!modalBox.contains(event.target)) {
          closeModal();
        }

      });


      // =====================================
      // 11. KEYBOARD EVENTS
      // =====================================

      document.addEventListener("keydown", event => {

        if (!modal.classList.contains("active")) return;

        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextImage();
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevImage();
          return;
        }

        // Tab 焦點限制
        if (event.key === "Tab") {

          const focusable = [
            ...modal.querySelectorAll(
              'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            )
          ].filter(el => el.getClientRects().length > 0);

          if (!focusable.length) {
            event.preventDefault();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === first) {

            event.preventDefault();
            last.focus();

          } else if (
            !event.shiftKey &&
            document.activeElement === last
          ) {

            event.preventDefault();
            first.focus();

          } else if (
            !focusable.includes(document.activeElement)
          ) {

            event.preventDefault();

            (event.shiftKey ? last : first).focus();
          }
        }

      });


      // =====================================
      // 12. MOBILE SWIPE
      // =====================================

      imageArea.addEventListener("touchstart", event => {

        startX = event.changedTouches[0].screenX;

      }, { passive: true });


      imageArea.addEventListener("touchend", event => {

        const endX = event.changedTouches[0].screenX;

        const distance = startX - endX;

        if (Math.abs(distance) < 50) return;

        if (distance > 0) {
          nextImage();
        } else {
          prevImage();
        }

      }, { passive: true });

    }
  }


  // =====================================
  // 13. MOBILE HEADER MENU
  // =====================================

  const menuToggle = document.querySelector(".menu-toggle");
  const headerNav = document.querySelector(".header-nav");

  if (menuToggle && headerNav) {

    function closeMenu() {

      menuToggle.classList.remove("active");
      headerNav.classList.remove("active");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "開啟選單");
    }

    menuToggle.addEventListener("click", () => {

      const isOpen = headerNav.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "關閉選單" : "開啟選單"
      );
    });

    headerNav.querySelectorAll("a").forEach(link => {

      link.addEventListener("click", closeMenu);

    });

    document.addEventListener("keydown", event => {

      if (event.key === "Escape") {
        closeMenu();
      }

    });

  }


  // =====================================
  // 14. FOOTER - BACK TO TOP
  // =====================================

  const backToTop = document.getElementById("backToTop");

  backToTop?.addEventListener("click", () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });


  // =====================================
  // 15. FOOTER - PORTFOLIO SCROLL
  // =====================================

  const portfolioLink = document.querySelector(".footer-portfolio");

  portfolioLink?.addEventListener("click", event => {

    const target = document.querySelector("#portfolio");

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });


  // =====================================
  // 16. FOOTER - FADE IN
  // =====================================

  const footerElements = document.querySelectorAll(
    ".footer-left, .footer-info-card"
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion && "IntersectionObserver" in window) {

    footerElements.forEach(element => {

      element.style.opacity = "0";
      element.style.transform = "translateY(25px)";

      element.style.transition =
        "opacity 0.7s ease, transform 0.7s ease";

    });

    const observer = new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";

          observer.unobserve(entry.target);
        }

      });

    }, {
      threshold: 0.1
    });

    footerElements.forEach(element => {
      observer.observe(element);
    });

  }

});
