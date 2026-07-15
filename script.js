const clock = document.querySelector("#clock");
const filters = document.querySelectorAll(".filter");
const tiles = document.querySelectorAll(".project-tile");
const contactForm = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");

function updateClock() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit"
  });
  clock.textContent = formatter.format(new Date());
}

function setFilter(type) {
  filters.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === type);
  });

  tiles.forEach((tile) => {
    const visible = type === "all" || tile.dataset.type === type;
    tile.classList.toggle("is-hidden", !visible);
  });
}

filters.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const recipient = [106, 46, 99, 111, 108, 100, 114, 101, 110, 64, 111, 117, 116, 108, 111, 111, 107, 46, 99, 111, 109]
      .map((code) => String.fromCharCode(code))
      .join("");
    const subject = `J.C. Archive contact from ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message
    ].join("\n");

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formNote) {
      formNote.textContent = "Opening your email app to send the message.";
    }
  });
}

updateClock();
setInterval(updateClock, 15000);
