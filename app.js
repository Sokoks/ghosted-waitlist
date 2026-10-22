(() => {
  const html = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");
  const modal = document.getElementById("waitlist-modal");
  const form = document.getElementById("waitlist-form");
  const formView = document.getElementById("modal-form-view");
  const successView = document.getElementById("modal-success-view");
  const contactTypeInput = document.getElementById("contact-type");
  const instagramField = document.getElementById("instagram-field");
  const emailField = document.getElementById("email-field");
  const instagramInput = document.getElementById("instagram-input");
  const emailInput = document.getElementById("email-input");
  const formError = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");
  const tabs = document.querySelectorAll("[data-contact-type]");
  const openButtons = document.querySelectorAll("[data-open-waitlist]");
  const closeElements = document.querySelectorAll("[data-close-modal]");

  const THEME_KEY = "ghosted-theme";

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(getPreferredTheme());
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const tw = window.Telegram?.WebApp;
  const isTelegram =
    html.classList.contains("is-telegram") ||
    /Telegram/i.test(navigator.userAgent || "") ||
    !!window.TelegramWebviewProxy ||
    !!(tw && (tw.initData || (tw.platform && tw.platform !== "unknown")));
  if (isTelegram) {
    html.classList.add("is-telegram");
    try {
      tw?.ready?.();
      tw?.expand?.();
    } catch {
      /* ignore */
    }
  }

  // TikTok / IG / FB in-app browsers often block autoplay — show tap-to-play.
  const appVideo = document.getElementById("app-video");
  const videoFrame = document.getElementById("video-frame");
  const videoPlayBtn = document.getElementById("video-play");
  const ua = navigator.userAgent || "";
  const isInAppBrowser =
    /TikTok|BytedanceWebview|musical_ly|Instagram|FBAN|FBAV|Line\//i.test(ua) ||
    isTelegram;

  if (appVideo && videoFrame) {
    appVideo.muted = true;
    appVideo.defaultMuted = true;
    appVideo.playsInline = true;
    appVideo.setAttribute("playsinline", "");
    appVideo.setAttribute("webkit-playsinline", "");
    appVideo.setAttribute("muted", "");

    const showPlay = () => {
      videoFrame.classList.add("is-paused");
      videoFrame.classList.remove("is-playing");
    };
    const hidePlay = () => {
      videoFrame.classList.remove("is-paused");
      videoFrame.classList.add("is-playing");
    };

    const tryPlay = () => {
      appVideo.muted = true;
      const playPromise = appVideo.play();
      if (playPromise?.then) {
        return playPromise.then(hidePlay).catch(() => {
          showPlay();
          return false;
        });
      }
      showPlay();
      return Promise.resolve(false);
    };

    const startFromGesture = () => {
      tryPlay();
    };

    if (isInAppBrowser) {
      showPlay();
    } else {
      showPlay();
      tryPlay();
    }

    videoPlayBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      startFromGesture();
    });

    videoFrame.addEventListener(
      "click",
      () => {
        if (appVideo.paused) startFromGesture();
      },
      { passive: true }
    );

    // First user gesture anywhere unlocks autoplay in many WebViews
    const unlockOnce = () => {
      if (!appVideo.paused) return;
      tryPlay();
    };
    ["touchstart", "pointerdown", "click"].forEach((evt) => {
      document.addEventListener(evt, unlockOnce, { once: true, passive: true });
    });

    appVideo.addEventListener("playing", hidePlay);
    appVideo.addEventListener("pause", () => {
      if (!appVideo.ended) showPlay();
    });
    appVideo.addEventListener("ended", showPlay);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !isInAppBrowser) tryPlay();
    });
  }

  themeToggle?.addEventListener("click", () => {
    const next =
      html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  function openModal() {
    form?.reset();
    formError.hidden = true;
    formError.textContent = "";
    formView.hidden = false;
    successView.hidden = true;
    setContactType("instagram");
    modal.hidden = false;
    document.body.classList.add("modal-open");
    window.setTimeout(() => {
      const active =
        contactTypeInput.value === "email" ? emailInput : instagramInput;
      active?.focus();
    }, 50);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function setContactType(type) {
    contactTypeInput.value = type;
    tabs.forEach((tab) => {
      const active = tab.dataset.contactType === type;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    const isEmail = type === "email";
    instagramField.hidden = isEmail;
    emailField.hidden = !isEmail;
    formError.hidden = true;

    if (isEmail) {
      emailInput?.focus();
    } else {
      instagramInput?.focus();
    }
  }

  openButtons.forEach((btn) => btn.addEventListener("click", openModal));
  closeElements.forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setContactType(tab.dataset.contactType || "instagram");
    });
  });

  function normalizeInstagram(value) {
    return value.trim().replace(/^@/, "");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showError(message) {
    formError.hidden = false;
    formError.textContent = message;
  }

  function isScriptConfigured() {
    const url = window.GHOSTED_CONFIG?.googleScriptUrl || "";
    return (
      url.startsWith("https://") &&
      !url.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")
    );
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;

    const type = contactTypeInput.value;
    const instagram = normalizeInstagram(instagramInput.value || "");
    const email = (emailInput.value || "").trim();

    if (type === "instagram") {
      if (!instagram || instagram.length < 2) {
        showError("Unesi valjani Instagram profil.");
        return;
      }
    } else if (!isValidEmail(email)) {
      showError("Unesi valjanu Gmail / email adresu.");
      return;
    }

    if (!isScriptConfigured()) {
      showError(
        "Google Sheets još nije spojen. Zalijepi Web App URL u config.js (vidi README)."
      );
      return;
    }

    const payload = {
      contactType: type,
      instagram: type === "instagram" ? instagram : "",
      email: type === "email" ? email : "",
      source: "ghosted-waitlist",
      createdAt: new Date().toISOString(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Šaljem…";

    try {
      await fetch(window.GHOSTED_CONFIG.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      formView.hidden = true;
      successView.hidden = false;
    } catch {
      showError("Nešto nije u redu. Pokušaj ponovo za trenutak.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Pošalji";
    }
  });
})();
