const params = new URLSearchParams(window.location.search);
const key = params.get("project") || "ccd";
const studies = window.CASE_STUDIES || {};
const study = studies[key] || studies.ccd;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateClock() {
  const clock = document.querySelector("#clock");
  if (!clock) return;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit"
  });
  clock.textContent = formatter.format(new Date());
}

document.title = `${study.title} | Graphic Design Case Study`;
setText("case-record", study.record);
setText("case-meta", study.meta);
setText("case-title", study.title);
setText("case-summary", study.summary);
setText("case-role", study.role);
setText("case-deliverables", study.deliverables);
setText("case-tools", study.tools);
setText("case-challenge", study.challenge);
setText("case-concept", study.concept);
setText("case-outcome", study.outcome);

const makingList = document.getElementById("case-making");
study.making.forEach((step) => {
  const item = document.createElement("li");
  item.textContent = step;
  makingList.appendChild(item);
});

const gallery = document.getElementById("campaign-grid");
study.images.forEach((src, index) => {
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  image.src = src;
  image.alt = `${study.title} campaign image ${index + 1}`;
  caption.textContent = `${study.record} / Image ${String(index + 1).padStart(2, "0")}`;
  figure.append(image, caption);
  gallery.appendChild(figure);
});

updateClock();
setInterval(updateClock, 15000);
