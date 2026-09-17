/* =====================================================
   GEBYA MINCH MARKETPLACE
   Authentication JavaScript
   Login + Register + Logout
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const loginForm =
    document.getElementById("loginForm");

  const registerForm =
    document.getElementById("registerForm");


  /* ================= LOGIN ================= */

  if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

      event.preventDefault();

      const email =
        document.getElementById("email")?.value.trim();

      const password =
        document.getElementById("password")?.value;


      if (!email || !password) {
        alert("Please enter email and password.");
        return;
      }


      try {

        const result = await API.post(
          "/api/auth/login",
          {
            email,
            password
          }
        );


        if (result.token) {

          saveToken(result.token);

          if (result.user) {
            localStorage.setItem(
              "gebya_user",
              JSON.stringify(result.user)
            );
          }

          alert("Login successful!");

          window.location.href =
            "dashboard.html";

        } else {

          alert("Login failed.");

        }

      } catch (error) {

        console.error(error);

        alert(
          error.message ||
          "Login failed. Please check your email and password."
        );

      }

    });

  }


  /* ================= REGISTER ================= */

  if (registerForm) {

    registerForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        const name =
          document.getElementById("name")?.value.trim();

        const email =
          document.getElementById("email")?.value.trim();

        const phone =
          document.getElementById("phone")?.value.trim();

        const city =
          document.getElementById("city")?.value;

        const password =
          document.getElementById("password")?.value;

        const confirmPassword =
          document.getElementById(
            "confirmPassword"
          )?.value;


        /* Validation */

        if (
          !name ||
          !email ||
          !phone ||
          !city ||
          !password
        ) {

          alert(
            "Please complete all required fields."
          );

          return;
        }


        if (password.length < 6) {

          alert(
            "Password must be at least 6 characters."
          );

          return;
        }


        if (
          confirmPassword &&
          password !== confirmPassword
        ) {

          alert(
            "Passwords do not match."
          );

          return;
        }


        try {

          const result = await API.post(
            "/api/auth/register",
            {
              name,
              email,
              phone,
              city,
              password
            }
          );


          if (result.token) {

            saveToken(result.token);

            if (result.user) {

              localStorage.setItem(
                "gebya_user",
                JSON.stringify(result.user)
              );

            }

            alert(
              "Registration successful!"
            );

            window.location.href =
              "dashboard.html";

          } else {

            alert(
              "Registration successful. Please login."
            );

            window.location.href =
              "login.html";

          }


        } catch (error) {

          console.error(error);

          alert(
            error.message ||
            "Registration failed."
          );

        }

      }
    );

  }


  /* ================= LOGOUT ================= */

  document
    .querySelectorAll("[data-logout]")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();

          logout();

        }
      );

    });

});
