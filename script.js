const featureContent = {
  offline: {
    title: "Always within reach.",
    description: "Your Bible and reading stay ready without an internet connection. Sam-Sam can help online or offline, so a quiet moment is never out of bounds."
  },
  samsam: {
    title: "Questions welcome.",
    description: "Ask Sam-Sam about a passage, explore a theme, or find a little context. Your AI companion is there online and offline."
  },
  rhythm: {
    title: "Make it your own.",
    description: "Pick up where you left off, return to a verse, and build a reading rhythm that feels like yours, one day at a time."
  }
};

const welcomeVideoDialog = document.querySelector("#welcome-video-dialog");
const welcomeVideoPlayer = document.querySelector("#welcome-video-player");
const welcomeVideoClose = document.querySelector(".welcome-video-close");
const welcomeVideoSkip = document.querySelector(".welcome-video-skip");
const welcomeVideoAudio = document.querySelector("#welcome-video-audio");
const welcomeVideoStatus = document.querySelector("#welcome-video-status");

if (welcomeVideoDialog && welcomeVideoPlayer && welcomeVideoClose && welcomeVideoSkip && welcomeVideoAudio && welcomeVideoStatus) {
  const closeWelcomeVideo = () => {
    welcomeVideoPlayer.pause();
    welcomeVideoDialog.close();
  };

  welcomeVideoClose.addEventListener("click", closeWelcomeVideo);
  welcomeVideoSkip.addEventListener("click", closeWelcomeVideo);
  welcomeVideoAudio.addEventListener("click", () => {
    welcomeVideoPlayer.muted = false;
    welcomeVideoPlayer.play().then(() => {
      welcomeVideoAudio.hidden = true;
      welcomeVideoStatus.textContent = "Sound on";
    }).catch(() => {
      welcomeVideoStatus.textContent = "Use the video controls to start playback";
    });
  });
  welcomeVideoDialog.addEventListener("close", () => welcomeVideoPlayer.pause());

  if (typeof welcomeVideoDialog.showModal === "function") {
    welcomeVideoDialog.showModal();
    welcomeVideoSkip.focus();
    welcomeVideoPlayer.muted = false;
    welcomeVideoPlayer.play().catch(() => {
      welcomeVideoAudio.hidden = false;
      welcomeVideoStatus.textContent = "Your browser requires a tap to play audio";
    });
  }
}

const featureTabs = [...document.querySelectorAll(".feature-tab")];
const featurePanel = document.querySelector("#feature-panel");

function selectFeature(selectedTab) {
  const feature = featureContent[selectedTab.dataset.feature];
  if (!feature || !featurePanel) return;

  for (const tab of featureTabs) {
    const isSelected = tab === selectedTab;
    tab.classList.toggle("is-active", isSelected);
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  }

  featurePanel.setAttribute("aria-labelledby", selectedTab.id);
  featurePanel.querySelector("h3").textContent = feature.title;
  featurePanel.querySelector("p").textContent = feature.description;
}

for (const [index, tab] of featureTabs.entries()) {
  tab.addEventListener("click", () => selectFeature(tab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = featureTabs[(index + direction + featureTabs.length) % featureTabs.length];
    nextTab.focus();
    selectFeature(nextTab);
  });
}

const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const donationQr = document.querySelector("#donation-qr");
const qrOpenButton = document.querySelector("#qr-open");
const qrPlaceholder = document.querySelector("#qr-placeholder");
const qrDialog = document.querySelector("#qr-dialog");
const qrDialogImage = document.querySelector("#qr-dialog-image");
const qrCloseButton = document.querySelector(".qr-close");

if (donationQr && qrOpenButton && qrPlaceholder && qrDialog && qrDialogImage && qrCloseButton) {
  donationQr.addEventListener("load", () => {
    donationQr.hidden = false;
    qrPlaceholder.hidden = true;
    qrOpenButton.disabled = false;
  });

  qrOpenButton.addEventListener("click", () => {
    qrDialogImage.src = donationQr.currentSrc;
    qrDialog.showModal();
  });

  qrCloseButton.addEventListener("click", () => qrDialog.close());
  qrDialog.addEventListener("click", (event) => {
    if (event.target === qrDialog) qrDialog.close();
  });
}

// Counts are stored in Supabase; a browser is counted once using a local marker.
const statsConfig = {
  url: "https://fteeurgkgeywlytmabwt.supabase.co",
  key: "sb_publishable_osn77U7AB8qzngoM8RIBkg_pzTFkq4M"
};
const statsHeaders = {
  apikey: statsConfig.key,
  Authorization: `Bearer ${statsConfig.key}`,
  "Content-Type": "application/json"
};
const visitorCount = document.querySelector("#visitor-count");
const downloadCount = document.querySelector("#download-count");

async function getSiteCounts() {
  const response = await fetch(`${statsConfig.url}/rest/v1/site_counters?select=name,value`, {
    headers: { apikey: statsConfig.key, Authorization: `Bearer ${statsConfig.key}` }
  });
  if (!response.ok) throw new Error("Could not load site counters");
  const counts = await response.json();
  for (const row of counts) {
    const target = row.name === "visitors" ? visitorCount : row.name === "downloads" ? downloadCount : null;
    if (target) target.textContent = Number(row.value).toLocaleString();
  }
}

async function incrementSiteCounter(name) {
  const response = await fetch(`${statsConfig.url}/rest/v1/rpc/increment_site_counter`, {
    method: "POST",
    headers: statsHeaders,
    body: JSON.stringify({ counter_name: name }),
    keepalive: true
  });
  if (!response.ok) throw new Error("Could not update site counter");
}

getSiteCounts().catch(() => {});
try {
  if (!localStorage.getItem("veralume-visitor-counted")) {
    incrementSiteCounter("visitors").then(() => {
      localStorage.setItem("veralume-visitor-counted", "1");
      return getSiteCounts();
    }).catch(() => {});
  }
} catch {
  // Browsing in private or restricted storage mode still leaves the page usable.
}

document.querySelectorAll("[data-apk-download]").forEach((button) => {
  button.addEventListener("click", () => {
    incrementSiteCounter("downloads").then(getSiteCounts).catch(() => {});
  });
});

// A small canvas layer keeps snowfall smooth without adding DOM nodes or blocking clicks.
const snowCanvas = document.querySelector("#snowfall");
const snowContext = snowCanvas?.getContext("2d", { alpha: true });
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (snowCanvas && snowContext && !prefersReducedMotion) {
  const snowflakes = [];
  let viewportWidth = 0;
  let viewportHeight = 0;
  let lastFrameTime = 0;
  let animationFrame = 0;
  const frameInterval = 1000 / 30;
  const randomBetween = (min, max) => min + Math.random() * (max - min);

  function resizeSnowfall() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    snowCanvas.width = Math.round(viewportWidth * pixelRatio);
    snowCanvas.height = Math.round(viewportHeight * pixelRatio);
    snowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    snowContext.clearRect(0, 0, viewportWidth, viewportHeight);

    const targetCount = viewportWidth < 620 ? 18 : 34;
    while (snowflakes.length < targetCount) {
      snowflakes.push({
        x: randomBetween(0, viewportWidth),
        y: randomBetween(-viewportHeight, viewportHeight),
        radius: randomBetween(1, 2.3),
        speed: randomBetween(15, 34),
        drift: randomBetween(-7, 7),
        opacity: randomBetween(0.25, 0.65)
      });
    }
    snowflakes.length = targetCount;
  }

  function drawSnowfall(timestamp) {
    if (document.hidden) {
      animationFrame = 0;
      return;
    }
    if (timestamp - lastFrameTime < frameInterval) {
      animationFrame = window.requestAnimationFrame(drawSnowfall);
      return;
    }
    const deltaSeconds = Math.min((timestamp - (lastFrameTime || timestamp)) / 1000, 0.05);
    lastFrameTime = timestamp;
    snowContext.clearRect(0, 0, viewportWidth, viewportHeight);

    for (const flake of snowflakes) {
      flake.y += flake.speed * deltaSeconds;
      flake.x += flake.drift * deltaSeconds;
      if (flake.y > viewportHeight + 4) {
        flake.y = -4;
        flake.x = randomBetween(0, viewportWidth);
      }
      if (flake.x < -4) flake.x = viewportWidth + 4;
      if (flake.x > viewportWidth + 4) flake.x = -4;
      snowContext.beginPath();
      snowContext.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      snowContext.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      snowContext.fill();
    }
    animationFrame = window.requestAnimationFrame(drawSnowfall);
  }

  function startSnowfall() {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(drawSnowfall);
  }

  window.addEventListener("resize", resizeSnowfall, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      lastFrameTime = 0;
      startSnowfall();
    }
  });
  resizeSnowfall();
  startSnowfall();
}
