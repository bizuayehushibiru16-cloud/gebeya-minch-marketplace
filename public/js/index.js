document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  await loadAnnouncements();

  setupSearch();
  setupCategoryButtons();
  setupCityButtons();
});

async function loadProducts() {
  try {
    const data = await API.get("/api/products");

    const products = data.products || data || [];

    const featuredContainer =
      document.getElementById("featuredProducts");

    const latestContainer =
      document.getElementById("latestProducts");

    const featured = products.filter(p => p.featured);
    const latest = products.slice(0, 12);

    if (featuredContainer) {
      featuredContainer.innerHTML =
        featured.length
          ? featured.map(productCard).join("")
          : `<p class="empty">No featured products available.</p>`;
    }

    if (latestContainer) {
      latestContainer.innerHTML =
        latest.length
          ? latest.map(productCard).join("")
          : `<p class="empty">No products available.</p>`;
    }

  } catch (error) {
    console.error(error);

    const containers = [
      document.getElementById("featuredProducts"),
      document.getElementById("latestProducts")
    ];

    containers.forEach(container => {
      if (container) {
        container.innerHTML = `
          <p class="empty">
            Products could not be loaded.
          </p>
        `;
      }
    });
  }
}

async function loadAnnouncements() {
  try {
    const data = await API.get("/api/announcements");

    const announcements =
      data.announcements || data || [];

    const container =
      document.getElementById("announcements");

    if (!container) return;

    if (!announcements.length) {
      container.innerHTML = `
        <p>No announcements available.</p>
      `;
      return;
    }

    container.innerHTML = announcements.map(item => `
      <div class="announcement">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.body)}</p>
      </div>
    `).join("");

  } catch (error) {
    console.error("Announcements error:", error);
  }
}

function setupSearch() {
  const searchForm =
    document.getElementById("searchForm");

  const searchInput =
    document.getElementById("searchInput");

  if (!searchForm || !searchInput) return;

  searchForm.addEventListener("submit", async event => {
    event.preventDefault();

    const keyword =
      searchInput.value.trim();

    if (!keyword) {
      await loadProducts();
      return;
    }

    try {
      const data = await API.get(
        `/api/products?search=${encodeURIComponent(keyword)}`
      );

      const products =
        data.products || data || [];

      const container =
        document.getElementById("latestProducts");

      if (container) {
        container.innerHTML =
          products.length
            ? products.map(productCard).join("")
            : `<p class="empty">No products found.</p>`;
      }

    } catch (error) {
      console.error(error);
      alert("Search failed.");
    }
  });
}

function setupCategoryButtons() {
  document.querySelectorAll("[data-category]")
    .forEach(button => {

      button.addEventListener("click", async () => {

        const category =
          button.dataset.category;

        try {
          const data = await API.get(
            `/api/products?category=${encodeURIComponent(category)}`
          );
