/* =====================================================
   GEBYA MINCH MARKETPLACE
   Dashboard JavaScript
   Seller + Buyer Dashboard
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  await loadUser();
  await loadMyProducts();
  await loadFavorites();
  await loadPayments();

  setupDashboardTabs();
  setupLogout();

});


/* ================= USER ================= */

async function loadUser() {

  try {

    const data =
      await API.get("/api/auth/me");

    const user =
      data.user || data;

    if (user) {

      localStorage.setItem(
        "gebya_user",
        JSON.stringify(user)
      );

      const nameElements =
        document.querySelectorAll(
          "[data-user-name]"
        );

      nameElements.forEach(element => {
        element.textContent =
          user.name || "User";
      });


      const emailElements =
        document.querySelectorAll(
          "[data-user-email]"
        );

      emailElements.forEach(element => {
        element.textContent =
          user.email || "";
      });


      const phoneElements =
        document.querySelectorAll(
          "[data-user-phone]"
        );

      phoneElements.forEach(element => {
        element.textContent =
          user.phone || "";
      });

    }

  } catch (error) {

    console.error(
      "User loading error:",
      error
    );

  }

}


/* ================= MY PRODUCTS ================= */

async function loadMyProducts() {

  const container =
    document.getElementById(
      "myProducts"
    );

  if (!container) return;


  try {

    const data =
      await API.get("/api/my/products");

    const products =
      data.products || data || [];


    updateStatistics(products);


    if (!products.length) {

      container.innerHTML = `
        <div class="empty">

          <h3>
            No listings yet
          </h3>

          <p>
            You have not created any products.
          </p>

          <a
            href="index.html"
            class="btn btn-primary"
          >
            Browse Marketplace
          </a>

        </div>
      `;

      return;

    }


    container.innerHTML =
      products.map(product => `

        <div class="dashboard-product">

          <div>

            <h3>
              ${escapeHTML(product.title)}
            </h3>

            <p class="price">
              ${money(product.price)}
            </p>

            <p>
              ${escapeHTML(product.city || "")}
              •
              ${escapeHTML(product.condition || "")}
            </p>

            <p>
              Views:
              ${Number(product.views || 0)}
            </p>

            <p>
              Status:
              <strong>
                ${escapeHTML(
                  product.status || "pending"
                )}
              </strong>
            </p>

          </div>


          <div class="dashboard-actions">

            <a
              href="product.html?id=${product.id}"
              class="btn btn-secondary"
            >
              View
            </a>


            <button
              class="btn btn-danger"
              onclick="deleteProduct(${product.id})"
            >
              Delete
            </button>


            ${
              product.status !== "sold"
                ? `
                  <button
                    class="btn btn-primary"
                    onclick="markAsSold(${product.id})"
                  >
                    Mark Sold
                  </button>
                `
                : `
                  <span class="badge">
                    Sold
                  </span>
                `
            }

          </div>

        </div>

      `).join("");


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="empty">
        Products could not be loaded.
      </p>
    `;

  }

}


/* ================= STATISTICS ================= */

function updateStatistics(products) {

  const total =
    products.length;


  const approved =
    products.filter(
      product =>
        product.status === "approved"
    ).length;


  const pending =
    products.filter(
      product =>
        product.status === "pending"
    ).length;


  const sold =
    products.filter(
      product =>
        product.status === "sold"
    ).length;


  const views =
    products.reduce(
      (sum, product) =>
        sum +
        Number(product.views || 0),
      0
    );


  setStatistic(
    "totalListings",
    total
  );

  setStatistic(
    "approvedListings",
    approved
  );

  setStatistic(
    "pendingListings",
    pending
  );

  setStatistic(
    "soldListings",
    sold
  );

  setStatistic(
    "totalViews",
    views
  );

}


function setStatistic(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }

}


/* ================= DELETE PRODUCT ================= */

async function deleteProduct(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this product?"
    );


  if (!confirmed) return;


  try {

    const result =
      await API.delete(
        `/api/products/${id}`
      );


    alert(
      result.message ||
      "Product deleted successfully."
    );


    await loadMyProducts();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to delete product."
    );

  }

}


/* ================= MARK SOLD ================= */

async function markAsSold(id) {

  const confirmed =
    confirm(
      "Mark this product as sold?"
    );


  if (!confirmed) return;


  try {

    const result =
      await API.post(
        `/api/products/${id}/sold`,
        {}
      );


    alert(
      result.message ||
      "Product marked as sold."
    );


    await loadMyProducts();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to mark product as sold."
    );

  }

}


/* ================= FAVORITES ================= */

async function loadFavorites() {

  const container =
    document.getElementById(
      "favorites"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/favorites"
      );

    const products =
      data.products || data || [];


    if (!products.length) {

      container.innerHTML = `
        <p class="empty">
          No favorite products yet.
        </p>
      `;

      return;

    }


    container.innerHTML =
      products.map(productCard).join("");


  } catch (error) {

    console.error(
      "Favorites error:",
      error
    );

    container.innerHTML = `
      <p class="empty">
        Favorites could not be loaded.
      </p>
    `;

  }

}


/* ================= PAYMENTS ================= */

async function loadPayments() {

  const container =
    document.getElementById(
      "paymentHistory"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/payments/my"
      );

    const payments =
      data.payments || data || [];


    if (!payments.length) {

      container.innerHTML = `
        <p class="empty">
          No payment records yet.
        </p>
      `;

      return;

    }


    container.innerHTML = `

      <div class="table-wrapper">

        <table class="payment-table">

          <thead>

            <tr>

              <th>Product</th>

              <th>Type</th>

              <th>Amount</th>

              <th>Provider</th>

              <th>Status</th>

              <th>Date</th>

            </tr>

          </thead>


          <tbody>

            ${payments.map(payment => `

              <tr>

                <td>
                  ${escapeHTML(
                    payment.product_title ||
                    payment.title ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    payment.type || "-"
                  )}
                </td>

                <td>
                  ${money(
                    payment.amount
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    payment.provider || "-"
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    payment.status || "-"
                  )}
                </td>

                <td>
                  ${formatDate(
                    payment.created_at
                  )}
                </td>

              </tr>

            `).join("")}

          </tbody>

        </table>

      </div>

    `;


  } catch (error) {

    console.error(
      "Payment error:",
      error
    );

    container.innerHTML = `
      <p class="empty">
        Payment history could not be loaded.
      </p>
    `;

  }

}


/* ================= TABS ================= */

function setupDashboardTabs() {

  const buttons =
    document.querySelectorAll(
      "[data-dashboard-tab]"
    );


  const sections =
    document.querySelectorAll(
      "[data-dashboard-section]"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const target =
          button.dataset.dashboardTab;


        buttons.forEach(item => {
          item.classList.remove(
            "active"
          );
        });


        sections.forEach(section => {
          section.style.display =
            "none";
        });


        button.classList.add(
          "active"
        );


        const section =
          document.querySelector(
            `[data-dashboard-section="${target}"]`
          );


        if (section) {
          section.style.display =
            "block";
        }

      }
    );

  });

}


/* ================= LOGOUT ================= */

function setupLogout() {

  document
    .querySelectorAll(
      "[data-logout]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();

          logout();

        }
      );

    });

}


/* ================= DATE ================= */

function formatDate(date) {

  if (!date) {
    return "-";
  }


  try {

    return new Date(date)
      .toLocaleDateString();

  } catch (error) {

    return date;

  }

}
