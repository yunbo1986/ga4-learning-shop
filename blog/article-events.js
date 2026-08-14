/*
  BLOG DATA LAYER EVENTS
  ----------------------------------------------------------------
  view_article is a custom learning event fired once per article view.
  article_progress fires at 50% and 90% reading depth.
  share follows GA4's recommended share event name.
*/
window.dataLayer = window.dataLayer || [];

const articleInfo = {
  article_id: document.documentElement.dataset.articleId,
  article_title: document.documentElement.dataset.articleTitle,
  article_category: document.documentElement.dataset.articleCategory
};

function trackEvent(eventName, parameters = {}) {
  window.dataLayer.push({ event: eventName, ...parameters });
  console.log(`[dataLayer] ${eventName}`, parameters);
}

trackEvent("view_article", articleInfo);

const reachedDepths = new Set();
function trackReadingDepth() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  if (available <= 0) return;
  const percent = Math.round((window.scrollY / available) * 100);
  [50, 90].forEach(depth => {
    if (percent >= depth && !reachedDepths.has(depth)) {
      reachedDepths.add(depth);
      trackEvent("article_progress", { ...articleInfo, percent_scrolled: depth });
    }
  });
}
window.addEventListener("scroll", trackReadingDepth, { passive: true });

document.getElementById("shareArticle").addEventListener("click", async () => {
  trackEvent("share", {
    method: navigator.share ? "web_share" : "copy_link",
    content_type: "blog_article",
    item_id: articleInfo.article_id,
    content_title: articleInfo.article_title
  });

  const status = document.getElementById("shareStatus");
  try {
    if (navigator.share) {
      await navigator.share({ title: articleInfo.article_title, url: window.location.href });
      status.textContent = "Shared!";
    } else {
      await navigator.clipboard.writeText(window.location.href);
      status.textContent = "Link copied!";
    }
  } catch (error) {
    status.textContent = error.name === "AbortError" ? "Share cancelled." : "Share event recorded.";
  }
});
