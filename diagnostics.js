
const API_URL = "https://metrics.lan:8444/api/metrics";
const REFRESH_INTERVAL = 15000;

const systemNames = {
  "256Server": "256Server",
  "256StorageServer": "256StorageServer",
  "Main PC": "Main PC"
};

const serviceNames = {
  "Immich": "Immich",
  "Navidrone": "Navidrome",
  "Nextcloud": "Nextcloud",
  "Pi-hole": "Pi-hole",
  "Plex": "Plex"
};

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(element => {
    element.textContent = value;
  });
}

function formatBytesPerSecond(value) {
  if (typeof value !== "number") return "—";

  const mbps = (value * 8) / 1000000;
  return `${mbps.toFixed(2)} Mbps`;
}

function formatUptime(seconds) {
  if (typeof seconds !== "number") return "—";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTemperature(temperatures) {
  if (!temperatures) return "—";

  const preferredSensors = [
    "coretemp_package_id_0",
    "k10temp_tctl"
  ];

  for (const sensor of preferredSensors) {
    if (typeof temperatures[sensor] === "number") {
      return `${temperatures[sensor].toFixed(1)}°C`;
    }
  }

  return "—";
}

function updateMetric(name, value) {
  setText(`[data-metric="${name}"]`, value);
}

function updateSystem(systemKey, system) {
  const prefix = systemKey.toLowerCase().replaceAll(" ", "-");

  updateMetric(`${prefix}-cpu`, `${system.cpu_percent?.toFixed(1) ?? "—"}%`);
  updateMetric(`${prefix}-memory`, `${system.memory_percent?.toFixed(1) ?? "—"}%`);
  updateMetric(`${prefix}-memory-used`, `${system.memory_used_gb?.toFixed(2) ?? "—"} GB`);
  updateMetric(`${prefix}-disk`, `${system.disk_percent?.toFixed(1) ?? "—"}%`);
  updateMetric(`${prefix}-disk-used`, `${system.disk_used_gb?.toFixed(1) ?? "—"} GB`);
  updateMetric(`${prefix}-disk-total`, `${system.disk_total_gb?.toFixed(1) ?? "—"} GB`);
  updateMetric(`${prefix}-uptime`, formatUptime(system.uptime_seconds));
  updateMetric(`${prefix}-temperature`, formatTemperature(system.temperatures));
  updateMetric(`${prefix}-download`, formatBytesPerSecond(system.network?.receive_rate));
  updateMetric(`${prefix}-upload`, formatBytesPerSecond(system.network?.transmit_rate));

  document.querySelectorAll(`[data-system-status="${prefix}"]`).forEach(element => {
    const online = system.status === "up";
    element.textContent = online ? "Online" : "Offline";
    element.classList.toggle("online", online);
    element.classList.toggle("offline", !online);
  });
}

function updateService(serviceKey, service) {
  const prefix = serviceKey.toLowerCase().replaceAll(" ", "-");
  const online = service.status === "up";

  document.querySelectorAll(`[data-service-status="${prefix}"]`).forEach(element => {
    element.textContent = online ? "Online" : "Offline";
    element.classList.toggle("online", online);
    element.classList.toggle("offline", !online);
  });

  updateMetric(`service-${prefix}-uptime`,
    typeof service.uptime === "number"
      ? `${service.uptime.toFixed(2)}%`
      : "—"
  );
}

async function loadDiagnostics() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("The metrics API reported an unsuccessful response.");
    }

    Object.entries(data.systems || {}).forEach(([name, system]) => {
      updateSystem(name, system);
    });

    Object.entries(data.services || {}).forEach(([name, service]) => {
      updateService(name, service);
    });

    setText("[data-metrics-updated]", `Updated ${new Date().toLocaleTimeString()}`);
    setText("[data-metrics-connection]", "Connected");

    document.querySelectorAll("[data-metrics-connection]").forEach(element => {
      element.classList.add("online");
      element.classList.remove("offline");
    });

  } catch (error) {
    console.error("Unable to load server metrics:", error);

    setText("[data-metrics-connection]", "Connection unavailable");

    document.querySelectorAll("[data-metrics-connection]").forEach(element => {
      element.classList.remove("online");
      element.classList.add("offline");
    });
  }
}

loadDiagnostics();
setInterval(loadDiagnostics, REFRESH_INTERVAL);
