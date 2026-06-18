const STORAGE_KEY = "smap_points";
const DEFAULT_DATA_URL = "data/points.json";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const map = L.map("map").setView([35.681236, 139.767125], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const pointsLayer = L.layerGroup().addTo(map);

let points = [];

function loadPoints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    points = JSON.parse(saved);
    renderAll();
    return;
  }
  fetch(DEFAULT_DATA_URL)
    .then((res) => res.json())
    .then((data) => {
      points = data;
      renderAll();
    })
    .catch(() => {
      points = [];
      renderAll();
    });
}

function savePoints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

function renderAll() {
  renderMarkers();
  renderList();
}

function renderMarkers() {
  pointsLayer.clearLayers();
  points.forEach((p) => {
    const marker = L.marker([p.lat, p.lng]).bindPopup(
      `<strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.address)}<br>(${p.lat.toFixed(5)}, ${p.lng.toFixed(5)})`
    );
    pointsLayer.addLayer(marker);
  });
}

function renderList() {
  const list = document.getElementById("points-list");
  list.innerHTML = "";
  points.forEach((p) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${p.name}（${p.address}）`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "削除";
    removeBtn.addEventListener("click", () => {
      points = points.filter((x) => x.id !== p.id);
      savePoints();
      renderAll();
    });
    li.appendChild(text);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("toggle-points-layer").addEventListener("change", (e) => {
  if (e.target.checked) {
    map.addLayer(pointsLayer);
  } else {
    map.removeLayer(pointsLayer);
  }
});

document.getElementById("reset-points").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  loadPoints();
});

document.getElementById("geocode-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("geocode-name").value.trim();
  const address = document.getElementById("geocode-address").value.trim();
  const status = document.getElementById("geocode-status");
  if (!name || !address) return;

  status.textContent = "検索中...";
  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("リクエストに失敗しました");
    const results = await res.json();
    if (!results.length) {
      status.textContent = "座標が見つかりませんでした。住所を確認してください。";
      return;
    }
    const { lat, lon } = results[0];
    const newPoint = {
      id: `pt-${Date.now()}`,
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
    };
    points.push(newPoint);
    savePoints();
    renderAll();
    map.setView([newPoint.lat, newPoint.lng], 15);
    status.textContent = `登録しました: (${newPoint.lat.toFixed(5)}, ${newPoint.lng.toFixed(5)})`;
    e.target.reset();
  } catch (err) {
    status.textContent = `エラー: ${err.message}`;
  }
});

loadPoints();
