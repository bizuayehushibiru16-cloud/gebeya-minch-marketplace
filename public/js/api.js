const API = {
  async request(url, options = {}) {
    const token = localStorage.getItem("gebya_token");

    const headers = {
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  },

  get(url) {
    return this.request(url);
  },

  post(url, body) {
    return this.request(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  put(url, body) {
    return this.request(url, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  patch(url, body) {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },

  delete(url) {
    return this.request(url, {
      method: "DELETE"
    });
  }
};

function saveToken(token) {
  localStorage.setItem("gebya_token", token);
}

function getToken() {
  return localStorage.getItem("gebya_token");
}

function logout() {
  localStorage.removeItem("gebya_token");
  localStorage.removeItem("gebya_user");
  window.location.href = "login.html";
}

function money(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0)) + " ETB";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function productCard(product) {
  const image =
    product.images && product.images.length
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800";

  return `
    <div class="product-card" onclick="openProduct(${product.id})">
      <img src="${image}" alt="${escapeHTML(product.title)}">

      <div class="product-info">
        <h3>${escapeHTML(product.title)}</h3>

        <div class="price">
          ${money(product.price)}
        </div>

        <p>
          ${escapeHTML(product.city || "")}
          •
          ${escapeHTML(product.condition || "")}
        </p>

        ${
          product.negotiable
            ? `<span class="badge">Negotiable</span>`
            : ""
        }
      </div>
    </div>
  `;
}

function openProduct(id) {
  window.location.href = `product.html?id=${id}`;
}
