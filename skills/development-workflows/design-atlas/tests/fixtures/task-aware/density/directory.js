// Fictional inventory for the field equipment directory.
const inventory = [
  ["Pocket weather meter", "North", 16], ["Soil moisture probe", "North", 12],
  ["Digital survey wheel", "East", 8], ["Handheld anemometer", "South", 15],
  ["Compass and clinometer", "West", 11], ["Pocket noise meter", "East", 10],
  ["Field pH meter", "North", 18], ["Water clarity tube", "South", 6],
  ["Survey tape reel", "West", 9], ["Pocket lux meter", "East", 14],
  ["Current meter", "South", 24], ["Digital depth gauge", "North", 11],
  ["Air sampling pump", "West", 23], ["Optical hand level", "East", 10],
  ["Soil thermometer", "North", 7], ["Portable rain gauge", "West", 9],
  ["Leaf area ruler", "South", 5], ["Cable length meter", "East", 13],
  ["Field balance", "West", 17], ["Wind direction vane", "North", 8],
  ["Pocket altimeter", "East", 15], ["Marking stake set", "South", 6],
  ["Counting frame", "West", 8], ["Water depth tape", "North", 14],
];

const directory = document.querySelector("#records");
const status = document.querySelector("output");
for (const [i, [name, depot, rate]] of inventory.entries()) {
  const id = "FE-" + String(i + 1).padStart(2, "0");
  const record = document.createElement("article");
  record.className = "record";
  record.dataset.recordId = id;
  record.innerHTML = `
    <h2 class="name" id="${id}">${name}</h2>
    <p class="specs"><span>${id}</span> <span>${depot} depot</span> <span class="rate">$${rate} per day</span></p>
    <div class="actions">
      <button data-action="inspect" aria-label="Inspect ${name}">Inspect</button>
      <button data-action="pick" aria-label="Pick ${name}" aria-pressed="false"><span aria-hidden="true">✓ </span>Pick</button>
    </div>`;
  record.setAttribute("aria-labelledby", id);
  record.querySelector("[data-action=inspect]").addEventListener("click", () => {
    status.textContent = `${id}: ${name}, ${depot} depot, $${rate} per day`;
  });
  const pick = record.querySelector("[data-action=pick]");
  pick.addEventListener("click", () => {
    const selected = pick.getAttribute("aria-pressed") !== "true";
    pick.setAttribute("aria-pressed", String(selected));
    status.textContent = `${id} ${selected ? "added to" : "removed from"} pick list`;
  });
  directory.append(record);
}
