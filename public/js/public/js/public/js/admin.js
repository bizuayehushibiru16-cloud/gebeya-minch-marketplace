/* =====================================================
   GEBYA MINCH MARKETPLACE
   Admin Dashboard JavaScript
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {

    const data = await API.get("/api/auth/me");

    const user = data.user || data;

    if (!user || user.role !== "admin") {

      alert("Admin access required.");

      window.location.href = "index.html";

      return;
    }

  } catch (error) {

    console.error(error);

    window.location.href = "login.html";

    return;
  }


  await loadAdminStats();
  await loadAdminProducts();
  await loadAdminUsers();
  await loadAdminBusinesses();
  await loadAdminReports();
  await loadAdminPayments();
  await loadAnnouncements();

  setupAdminTabs();
  setupAdminLogout();

});


/* =====================================================
   ADMIN STATISTICS
   ===================================================== */

async function loadAdminStats() {

  try {

    const data =
      await API.get("/api/admin/stats");

    const stats =
      data.stats || data;


    setAdminValue(
      "totalUsers",
      stats.users ??
      stats.totalUsers ??
      0
    );


    setAdminValue(
      "totalProducts",
      stats.products ??
      stats.totalProducts ??
      0
    );


    setAdminValue(
      "pendingProducts",
      stats.pending ??
      stats.pendingProducts ??
      0
    );


    setAdminValue(
      "monthlyRevenue",
      money(
        stats.monthlyRevenue ??
        stats.revenue ??
        0
      )
    );

  } catch (error) {

    console.error(
      "Admin stats error:",
      error
    );

  }

}


function setAdminValue(id, value) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }

}


/* =====================================================
   PRODUCTS MODERATION
   ===================================================== */

async function loadAdminProducts() {

  const container =
    document.getElementById(
      "adminProducts"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/admin/products"
      );

    const products =
      data.products || data || [];


    if (!products.length) {

      container.innerHTML = `
        <p class="empty">
          No products found.
        </p>
      `;

      return;
    }


    container.innerHTML =
      products.map(product => `

        <div class="admin-item">

          <div>

            <h3>
              ${escapeHTML(
                product.title
              )}
            </h3>

            <p>
              ${money(
                product.price
              )}
              •
              ${escapeHTML(
                product.city || ""
              )}
            </p>

            <p>
              Seller:
              ${escapeHTML(
                product.seller_name ||
                product.name ||
                "-"
              )}
            </p>

            <p>
              Status:
              <strong>
                ${escapeHTML(
                  product.status || "-"
                )}
              </strong>
            </p>

          </div>


          <div class="admin-actions">

            <button
              class="btn btn-primary"
              onclick="changeProductStatus(
                ${product.id},
                'approved'
              )"
            >
              Approve
            </button>


            <button
              class="btn btn-danger"
              onclick="changeProductStatus(
                ${product.id},
                'rejected'
              )"
            >
              Reject
            </button>


            <button
              class="btn btn-secondary"
              onclick="changeProductStatus(
                ${product.id},
                'pending'
              )"
            >
              Pending
            </button>


            <button
              class="btn btn-secondary"
              onclick="toggleFeatured(
                ${product.id},
                ${product.featured ? "true" : "false"}
              )"
            >
              ${
                product.featured
                  ? "Remove Featured"
                  : "Make Featured"
              }
            </button>


            <button
              class="btn btn-secondary"
              onclick="toggleTrusted(
                ${product.id},
                ${product.trusted ? "true" : "false"}
              )"
            >
              ${
                product.trusted
                  ? "Remove Trusted"
                  : "Make Trusted"
              }
            </button>

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


/* =====================================================
   CHANGE PRODUCT STATUS
   ===================================================== */

async function changeProductStatus(
  id,
  status
) {

  try {

    const result =
      await API.patch(
        `/api/admin/products/${id}/status`,
        {
          status
        }
      );


    alert(
      result.message ||
      `Product status changed to ${status}.`
    );


    await loadAdminProducts();
    await loadAdminStats();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to change product status."
    );

  }

}


/* =====================================================
   FEATURED
   ===================================================== */

async function toggleFeatured(
  id,
  current
) {

  try {

    const result =
      await API.patch(
        `/api/admin/products/${id}/flags`,
        {
          featured: !current
        }
      );


    alert(
      result.message ||
      "Featured status updated."
    );


    await loadAdminProducts();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to update featured status."
    );

  }

}


/* =====================================================
   TRUSTED
   ===================================================== */

async function toggleTrusted(
  id,
  current
) {

  try {

    const result =
      await API.patch(
        `/api/admin/products/${id}/flags`,
        {
          trusted: !current
        }
      );


    alert(
      result.message ||
      "Trusted status updated."
    );


    await loadAdminProducts();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to update trusted status."
    );

  }

}


/* =====================================================
   USERS
   ===================================================== */

async function loadAdminUsers() {

  const container =
    document.getElementById(
      "adminUsers"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/admin/users"
      );

    const users =
      data.users || data || [];


    if (!users.length) {

      container.innerHTML = `
        <p class="empty">
          No users found.
        </p>
      `;

      return;
    }


    container.innerHTML =
      users.map(user => `

        <div class="admin-item">

          <div>

            <h3>
              ${escapeHTML(
                user.name || "User"
              )}
            </h3>

            <p>
              ${escapeHTML(
                user.email || ""
              )}
            </p>

            <p>
              ${escapeHTML(
                user.phone || ""
              )}
            </p>

            <p>
              Role:
              ${escapeHTML(
                user.role || "user"
              )}
            </p>

            <p>
              Status:
              <strong>
                ${escapeHTML(
                  user.status || "active"
                )}
              </strong>
            </p>

          </div>


          <div class="admin-actions">

            ${
              user.status === "blocked"
                ? `
                  <button
                    class="btn btn-primary"
                    onclick="changeUserStatus(
                      ${user.id},
                      'active'
                    )"
                  >
                    Activate
                  </button>
                `
                : `
                  <button
                    class="btn btn-danger"
                    onclick="changeUserStatus(
                      ${user.id},
                      'blocked'
                    )"
                  >
                    Block
                  </button>
                `
            }

          </div>

        </div>

      `).join("");


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="empty">
        Users could not be loaded.
      </p>
    `;

  }

}


/* =====================================================
   CHANGE USER STATUS
   ===================================================== */

async function changeUserStatus(
  id,
  status
) {

  const confirmed =
    confirm(
      `Change this user's status to ${status}?`
    );


  if (!confirmed) return;


  try {

    const result =
      await API.patch(
        `/api/admin/users/${id}/status`,
        {
          status
        }
      );


    alert(
      result.message ||
      "User status updated."
    );


    await loadAdminUsers();
    await loadAdminStats();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to update user."
    );

  }

}


/* =====================================================
   BUSINESSES
   ===================================================== */

async function loadAdminBusinesses() {

  const container =
    document.getElementById(
      "adminBusinesses"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/businesses"
      );

    const businesses =
      data.businesses || data || [];


    if (!businesses.length) {

      container.innerHTML = `
        <p class="empty">
          No businesses found.
        </p>
      `;

      return;
    }


    container.innerHTML =
      businesses.map(business => `

        <div class="admin-item">

          <div>

            <h3>
              ${escapeHTML(
                business.name ||
                "Business"
              )}
            </h3>

            <p>
              ${escapeHTML(
                business.city || ""
              )}
            </p>

            <p>
              Phone:
              ${escapeHTML(
                business.phone || "-"
              )}
            </p>

            <p>
              Verification:
              <strong>
                ${
                  business.verified
                    ? "Verified"
                    : "Not verified"
                }
              </strong>
            </p>

          </div>


          <div class="admin-actions">

            <button
              class="btn btn-primary"
              onclick="verifyBusiness(
                ${business.id},
                ${business.verified ? "false" : "true"}
              )"
            >
              ${
                business.verified
                  ? "Remove Verification"
                  : "Verify Business"
              }
            </button>

          </div>

        </div>

      `).join("");


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="empty">
        Businesses could not be loaded.
      </p>
    `;

  }

}


/* =====================================================
   VERIFY BUSINESS
   ===================================================== */

async function verifyBusiness(
  id,
  verified
) {

  try {

    const result =
      await API.patch(
        `/api/admin/businesses/${id}/verify`,
        {
          verified
        }
      );


    alert(
      result.message ||
      "Business verification updated."
    );


    await loadAdminBusinesses();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to update business verification."
    );

  }

}


/* =====================================================
   REPORTS
   ===================================================== */

async function loadAdminReports() {

  const container =
    document.getElementById(
      "adminReports"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/admin/reports"
      );

    const reports =
      data.reports || data || [];


    if (!reports.length) {

      container.innerHTML = `
        <p class="empty">
          No reports found.
        </p>
      `;

      return;
    }


    container.innerHTML =
      reports.map(report => `

        <div class="admin-item">

          <div>

            <h3>
              Report #${report.id}
            </h3>

            <p>
              Product:
              ${escapeHTML(
                report.product_title || "-"
              )}
            </p>

            <p>
              Reason:
              ${escapeHTML(
                report.reason || "-"
              )}
            </p>

            <p>
              Status:
              <strong>
                ${escapeHTML(
                  report.status || "open"
                )}
              </strong>
            </p>

          </div>


          <div class="admin-actions">

            <button
              class="btn btn-primary"
              onclick="updateReport(
                ${report.id},
                'resolved'
              )"
            >
              Resolve
            </button>


            <button
              class="btn btn-secondary"
              onclick="updateReport(
                ${report.id},
                'reviewing'
              )"
            >
              Reviewing
            </button>

          </div>

        </div>

      `).join("");


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="empty">
        Reports could not be loaded.
      </p>
    `;

  }

}


/* =====================================================
   UPDATE REPORT
   ===================================================== */

async function updateReport(
  id,
  status
) {

  try {

    const result =
      await API.patch(
        `/api/admin/reports/${id}`,
        {
          status
        }
      );


    alert(
      result.message ||
      "Report updated."
    );


    await loadAdminReports();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to update report."
    );

  }

}


/* =====================================================
   PAYMENTS
   ===================================================== */

async function loadAdminPayments() {

  const container =
    document.getElementById(
      "adminPayments"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/admin/payments"
      );

    const payments =
      data.payments || data || [];


    if (!payments.length) {

      container.innerHTML = `
        <p class="empty">
          No payment records found.
        </p>
      `;

      return;
    }


    container.innerHTML = `

      <div class="table-wrapper">

        <table class="payment-table">

          <thead>

            <tr>

              <th>ID</th>
              <th>User</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Action</th>

            </tr>

          </thead>


          <tbody>

            ${payments.map(payment => `

              <tr>

                <td>
                  ${payment.id}
                </td>

                <td>
                  ${escapeHTML(
                    payment.user_name ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    payment.product_title ||
                    "-"
                  )}
                </td>

                <td>
                  ${money(
                    payment.amount
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    payment.provider ||
                    "-"
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    payment.status ||
                    "-"
                  )}
                </td>

                <td>

                  <button
                    class="btn btn-primary"
                    onclick="updatePayment(
                      ${payment.id},
                      'paid'
                    )"
                  >
                    Mark Paid
                  </button>

                </td>

              </tr>

            `).join("")}

          </tbody>

        </table>

      </div>

    `;


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="empty">
        Payments could not be loaded.
      </p>
    `;

  }

}


/* =====================================================
   UPDATE PAYMENT
   ===================================================== */

async function updatePayment(
  id,
  status
) {

  try {

    const result =
      await API.patch(
        `/api/admin/payments/${id}`,
        {
          status
        }
      );


    alert(
      result.message ||
      "Payment status updated."
    );


    await loadAdminPayments();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to update payment."
    );

  }

}


/* =====================================================
   ANNOUNCEMENTS
   ===================================================== */

async function loadAnnouncements() {

  const container =
    document.getElementById(
      "adminAnnouncements"
    );

  if (!container) return;


  try {

    const data =
      await API.get(
        "/api/announcements"
      );

    const announcements =
      data.announcements ||
      data ||
      [];


    if (!announcements.length) {

      container.innerHTML = `
        <p class="empty">
          No announcements yet.
        </p>
      `;

      return;
    }


    container.innerHTML =
      announcements.map(item => `

        <div class="admin-item">

          <div>

            <h3>
              ${escapeHTML(
                item.title
              )}
            </h3>

            <p>
              ${escapeHTML(
                item.body
              )}
            </p>

            <small>
              ${formatDate(
                item.created_at
              )}
            </small>

          </div>

        </div>

      `).join("");


  } catch (error) {

    console.error(error);

  }

}


/* =====================================================
   CREATE ANNOUNCEMENT
   ===================================================== */

async function createAnnouncement() {

  const title =
    prompt(
      "Enter announcement title:"
    );


  if (!title || !title.trim()) {
    return;
  }


  const body =
    prompt(
      "Enter announcement message:"
    );


  if (!body || !body.trim()) {
    return;
  }


  try {

    const result =
      await API.post(
        "/api/admin/announcements",
        {
          title: title.trim(),
          body: body.trim()
        }
      );


    alert(
      result.message ||
      "Announcement created."
    );


    await loadAnnouncements();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to create announcement."
    );

  }

}


/* =====================================================
   ADMIN TABS
   ===================================================== */

function setupAdminTabs() {

  const buttons =
    document.querySelectorAll(
      "[data-admin-tab]"
    );


  const sections =
    document.querySelectorAll(
      "[data-admin-section]"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const target =
          button.dataset.adminTab;


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
            `[data-admin-section="${target}"]`
          );


        if (section) {

          section.style.display =
            "block";

        }

      }
    );

  });

}


/* =====================================================
   LOGOUT
   ===================================================== */

function setupAdminLogout() {

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


/* =====================================================
   DATE
   ===================================================== */

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
