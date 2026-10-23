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