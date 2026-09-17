/* =====================================================
   GEBYA MINCH MARKETPLACE
   Businesses Directory JavaScript
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  await loadBusinesses();

  setupBusinessSearch();

});


/* ================= LOAD BUSINESSES ================= */

async function loadBusinesses(search = "") {

  const container =
    document.getElementById("businesses");

  if (!container) return;


  try {

    let url = "/api/businesses";


    if (search) {

      url +=
        `?search=${encodeURIComponent(search)}`;

    }


    const data =
      await API.get(url);


    const businesses =
      data.businesses || data || [];


    if (!businesses.length) {

      container.innerHTML = `
        <div class="empty">

          <h3>
            No businesses found
          </h3>

          <p>
            There are no businesses matching your search.
          </p>

        </div>
      `;

      return;

    }


    container.innerHTML =
      businesses
        .map(businessCard)
        .join("");


  } catch (error) {

    console.error(
      "Businesses error:",
      error
    );


    container.innerHTML = `
      <div class="empty">

        <h3>
          Unable to load businesses
        </h3>

        <p>
          Please try again later.
        </p>

      </div>
    `;

  }

}


/* ================= BUSINESS CARD ================= */

function businessCard(business) {

  const logo =
    business.logo ||
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600";


  return `

    <div class="business-card">

      <div class="business-image">

        <img
          src="${logo}"
          alt="${escapeHTML(
            business.name || "Business"
          )}"
        >

      </div>


      <div class="business-content">

        <div class="business-title-row">

          <h3>
            ${escapeHTML(
              business.name || "Business"
            )}
          </h3>


          ${
            business.verified
              ? `
                <span
                  class="verified-badge"
                  title="Verified Business"
                >
                  ✓ Verified
                </span>
              `
              : ""
          }

        </div>


        <p class="business-description">

          ${escapeHTML(
            business.description ||
            "No description available."
          )}

        </p>


        <div class="business-details">

          ${
            business.city
              ? `
                <p>
                  📍
                  ${escapeHTML(
                    business.city
                  )}
                </p>
              `
              : ""
          }


          ${
            business.address
              ? `
                <p>
                  🏢
                  ${escapeHTML(
                    business.address
                  )}
                </p>
              `
              : ""
          }


          ${
            business.phone
              ? `
                <p>
                  📞
                  ${escapeHTML(
                    business.phone
                  )}
                </p>
              `
              : ""
          }


          ${
            business.hours
              ? `
                <p>
                  🕐
                  ${escapeHTML(
                    business.hours
                  )}
                </p>
              `
              : ""
          }

        </div>


        <div class="business-actions">

          ${
            business.phone
              ? `
                <a
                  href="tel:${business.phone}"
                  class="btn btn-primary"
                >
                  📞 Call
                </a>
              `
              : ""
          }


          ${
            business.telegram
              ? `
                <a
                  href="https://t.me/${encodeURIComponent(
                    business.telegram.replace("@", "")
                  )}"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-secondary"
                >
                  Telegram
                </a>
              `
              : ""
          }

        </div>

      </div>

    </div>

  `;

}


/* ================= SEARCH ================= */

function setupBusinessSearch() {

  const form =
    document.getElementById(
      "businessSearchForm"
    );


  const input =
    document.getElementById(
      "businessSearchInput"
    );


  if (!form || !input) {
    return;
  }


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const search =
        input.value.trim();


      await loadBusinesses(
        search
      );

    }
  );

}


/* ================= FILTER BY CITY ================= */

async function filterBusinessesByCity(city) {

  const container =
    document.getElementById(
      "businesses"
    );


  if (!container) return;


  try {

    const data =
      await API.get(
        `/api/businesses?city=${encodeURIComponent(city)}`
      );


    const businesses =
      data.businesses || data || [];


    if (!businesses.length) {

      container.innerHTML = `
        <div class="empty">
          No businesses found in
          ${escapeHTML(city)}.
        </div>
      `;

      return;

    }


    container.innerHTML =
      businesses
        .map(businessCard)
        .join("");


  } catch (error) {

    console.error(error);

    alert(
      "Unable to filter businesses."
    );

  }

}


/* ================= REGISTER BUSINESS ================= */

async function registerBusiness() {

  const token = getToken();


  if (!token) {

    alert(
      "Please login first to register your business."
    );

    window.location.href =
      "login.html";

    return;

  }


  const name =
    prompt("Enter business name:");


  if (!name || !name.trim()) {
    return;
  }


  const description =
    prompt(
      "Enter business description:"
    );


  const phone =
    prompt(
      "Enter business phone number:"
    );


  const telegram =
    prompt(
      "Enter Telegram username (optional):"
    );


  const address =
    prompt(
      "Enter business address:"
    );


  const city =
    prompt(
      "Enter city:"
    );


  const hours =
    prompt(
      "Enter business working hours:"
    );


  try {

    const result =
      await API.post(
        "/api/businesses",
        {
          name: name.trim(),
          description:
            description || "",
          phone:
            phone || "",
          telegram:
            telegram || "",
          address:
            address || "",
          city:
            city || "",
          hours:
            hours || ""
        }
      );


    alert(
      result.message ||
      "Business registered successfully."
    );


    await loadBusinesses();


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Unable to register business."
    );

  }

}
