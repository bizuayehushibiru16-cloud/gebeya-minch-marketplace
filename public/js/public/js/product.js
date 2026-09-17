/* =====================================================
   GEBYA MINCH MARKETPLACE
   Product Details JavaScript
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    showError("Product ID was not provided.");
    return;
  }

  await loadProduct(productId);
  await loadReviews(productId);

});


/* ================= PRODUCT ================= */

async function loadProduct(id) {

  try {

    const data = await API.get(
      `/api/products/${id}`
    );

    const product =
      data.product || data;

    if (!product || !product.id) {
      showError("Product not found.");
      return;
    }

    renderProduct(product);

  } catch (error) {

    console.error(error);

    showError(
      error.message ||
      "Unable to load product."
    );

  }

}


/* ================= RENDER PRODUCT ================= */

function renderProduct(product) {

  const container =
    document.getElementById("productDetails");

  if (!container) return;


  const images =
    product.images && product.images.length
      ? product.images
      : [
          {
            url:
              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1000"
          }
        ];


  const mainImage =
    images[0].url;


  container.innerHTML = `

    <div class="product-detail">

      <div class="product-gallery">

        <img
          id="mainProductImage"
          src="${mainImage}"
          alt="${escapeHTML(product.title)}"
          class="main-product-image"
        >

        <div class="product-thumbnails">

          ${images.map((image, index) => `

            <img
              src="${image.url}"
              alt="Product image ${index + 1}"
              onclick="changeMainImage('${image.url}')"
              class="product-thumbnail"
            >

          `).join("")}

        </div>

      </div>


      <div class="product-content">

        <h1 class="product-title">
          ${escapeHTML(product.title)}
        </h1>


        <div class="price product-price">
          ${money(product.price)}
        </div>


        <div class="product-meta">

          <p>
            <strong>Category:</strong>
            ${escapeHTML(product.category || "-")}
          </p>

          <p>
            <strong>City:</strong>
            ${escapeHTML(product.city || "-")}
          </p>

          <p>
            <strong>Condition:</strong>
            ${escapeHTML(product.condition || "-")}
          </p>

          <p>
            <strong>Negotiable:</strong>
            ${product.negotiable ? "Yes" : "No"}
          </p>

          <p>
            <strong>Views:</strong>
            ${Number(product.views || 0)}
          </p>

        </div>


        <div class="product-badges">

          ${
            product.featured
              ? `<span class="badge">Featured</span>`
              : ""
          }

          ${
            product.trusted
              ? `<span class="badge">Trusted Seller</span>`
              : ""
          }

        </div>


        <div class="product-description">

          <h3>Description</h3>

          <p>
            ${escapeHTML(
              product.description ||
              "No description provided."
            )}
          </p>

        </div>


        <div class="seller-section">

          <h3>Seller</h3>

          <p>
            ${escapeHTML(
              product.seller_name ||
              product.name ||
              "Seller"
            )}
          </p>

          ${
            product.seller_phone
              ? `
                <p>
                  📞 ${escapeHTML(product.seller_phone)}
                </p>
              `
              : ""
          }

        </div>


        <div class="product-actions">

          ${
            product.seller_phone
              ? `
                <a
                  href="tel:${product.seller_phone}"
                  class="btn btn-primary"
                >
                  📞 Call Seller
                </a>
              `
              : ""
          }


          <button
            class="btn btn-secondary"
            onclick="favoriteProduct(${product.id})"
          >
            ❤️ Favorite
          </button>


          <button
            class="btn btn-secondary"
            onclick="shareProduct(${product.id})"
          >
            🔗 Share
          </button>


          <button
            class="btn btn-danger"
            onclick="reportProduct(${product.id})"
          >
            ⚠️ Report
          </button>

        </div>

      </div>

    </div>

  `;

}


/* ================= CHANGE IMAGE ================= */

function changeMainImage(url) {

  const image =
    document.getElementById(
      "mainProductImage"
    );

  if (image) {
    image.src = url;
  }

}


/* ================= FAVORITE ================= */

async function favoriteProduct(id) {

  const token = getToken();

  if (!token) {

    alert(
      "Please login first to add favorites."
    );

    window.location.href =
      "login.html";

    return;

  }


  try {

    const result = await API.post(
      `/api/products/${id}/favorite`,
      {}
    );

    alert(
      result.message ||
      "Product added to favorites."
    );

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to add favorite."
    );

  }

}


/* ================= SHARE ================= */

async function shareProduct(id) {

  const url =
    window.location.origin +
    "/product.html?id=" +
    id;


  try {

    if (
      navigator.share
    ) {

      await navigator.share({
        title: "Gebya Minch Marketplace",
        text: "Check this product on Gebya Minch Marketplace.",
        url
      });

    } else {

      await navigator.clipboard.writeText(
        url
      );

      alert(
        "Product link copied."
      );

    }

  } catch (error) {

    console.error(error);

  }

}


/* ================= REPORT ================= */

async function reportProduct(id) {

  const token = getToken();

  if (!token) {

    alert(
      "Please login first to report a product."
    );

    window.location.href =
      "login.html";

    return;

  }


  const reason =
    prompt(
      "Please enter the reason for reporting this product:"
    );


  if (!reason || !reason.trim()) {
    return;
  }


  try {

    const result = await API.post(
      `/api/products/${id}/reports`,
      {
        reason: reason.trim()
      }
    );


    alert(
      result.message ||
      "Report submitted successfully."
    );

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to submit report."
    );

  }

}


/* ================= REVIEWS ================= */

async function loadReviews(id) {

  const container =
    document.getElementById("reviews");

  if (!container) return;


  try {

    const data = await API.get(
      `/api/products/${id}/reviews`
    );


    const reviews =
      data.reviews || data || [];


    if (!reviews.length) {

      container.innerHTML = `
        <p class="empty">
          No reviews yet.
        </p>
      `;

      return;

    }


    container.innerHTML =
      reviews.map(review => `

        <div class="review">

          <div class="review-header">

            <strong>
              ${escapeHTML(
                review.name ||
                review.user_name ||
                "User"
              )}
            </strong>

            <span>
              ${"⭐".repeat(
                Math.max(
                  1,
                  Math.min(
                    5,
                    Number(review.rating || 0)
                  )
                )
              )}
            </span>

          </div>

          <p>
            ${escapeHTML(
              review.comment || ""
            )}
          </p>

        </div>

      `).join("");


  } catch (error) {

    console.error(
      "Reviews error:",
      error
    );

    container.innerHTML = `
      <p class="empty">
        Reviews could not be loaded.
      </p>
    `;

  }

}


/* ================= ADD REVIEW ================= */

async function addReview(id) {

  const token = getToken();

  if (!token) {

    alert(
      "Please login first to write a review."
    );

    window.location.href =
      "login.html";

    return;

  }


  const rating =
    Number(
      prompt(
        "Give this product a rating from 1 to 5:"
      )
    );


  if (
    !rating ||
    rating < 1 ||
    rating > 5
  ) {

    alert(
      "Rating must be between 1 and 5."
    );

    return;

  }


  const comment =
    prompt(
      "Write your review:"
    );


  try {

    const result =
      await API.post(
        `/api/products/${id}/reviews`,
        {
          rating,
          comment:
            comment || ""
        }
      );


    alert(
      result.message ||
      "Review submitted."
    );


    await loadReviews(id);


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to submit review."
    );

  }

}


/* ================= ERROR ================= */

function showError(message) {

  const container =
    document.getElementById(
      "productDetails"
    );

  if (!container) return;


  container.innerHTML = `
    <div class="empty">

      <h2>
        Product Error
      </h2>

      <p>
        ${escapeHTML(message)}
      </p>

      <a
        href="index.html"
        class="btn btn-primary"
      >
        Back to Marketplace
      </a>

    </div>
  `;

}
