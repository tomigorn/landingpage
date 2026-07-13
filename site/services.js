// ============================================================================
//  Homelab services
// ----------------------------------------------------------------------------
//  To add a service: copy a line, fill it in. Fields:
//    name     – shown in bold
//    desc     – short description (optional)
//    icon     – an emoji (simplest) OR a URL/path to an image
//    lan      – URL used in HOME mode (direct LAN access)
//    wan      – URL used in AWAY mode (public, no VPN). Optional.
//               If omitted, AWAY mode reuses `lan` and tags the row "VPN".
//    note     – tiny hint shown under the name (optional), e.g. "basic auth"
//
//  Categories are defined by `CATEGORIES` below (order + accent color).
// ============================================================================

const HOST = "fastpi.homelab"; // internal hostname (AdGuard resolves this on the LAN)

const CATEGORIES = [
  { id: "infra",      label: "Infrastructure",     color: "#a855f7" },
  { id: "monitoring", label: "Monitoring",         color: "#38bdf8" },
  { id: "media",      label: "Media & Downloads",  color: "#fb7185" },
  { id: "apps",       label: "Apps",               color: "#34d399" },
  { id: "dev",        label: "Dev & Data",         color: "#f59e0b" },
];

const SERVICES = [
  // ---- Infrastructure -----------------------------------------------------
  { category: "infra", name: "Portainer",     desc: "Container management",  icon: "🐳",
    lan: `https://${HOST}:9443` },
  { category: "infra", name: "Traefik",       desc: "Reverse proxy dashboard", icon: "🔀",
    lan: `http://${HOST}:8080/dashboard/`, note: "basic auth" },
  { category: "infra", name: "AdGuard Home",  desc: "DNS & ad blocking",     icon: "🛡️",
    lan: `http://${HOST}:3000/` },
  { category: "infra", name: "WireGuard",     desc: "VPN management (wg-easy)", icon: "🔑",
    lan: `http://wg-easy.${HOST}:8080/` },

  // ---- Monitoring ---------------------------------------------------------
  { category: "monitoring", name: "Grafana",    desc: "Dashboards & graphs", icon: "📊",
    lan: `http://${HOST}:3001/` },
  { category: "monitoring", name: "Prometheus", desc: "Metrics & alerts",    icon: "🔥",
    lan: `http://${HOST}:9090/` },
  { category: "monitoring", name: "InfluxDB",   desc: "Time-series database", icon: "⏱️",
    lan: `http://${HOST}:8086/` },

  // ---- Media & Downloads --------------------------------------------------
  { category: "media", name: "Audiobookshelf", desc: "Audiobooks & podcasts", icon: "📚",
    lan: "https://audiobookshelf.holy-grail.ch", wan: "https://audiobookshelf.holy-grail.ch" },
  { category: "media", name: "qBittorrent (mouse)", desc: "Torrent client", icon: "⬇️",
    lan: `http://${HOST}:8085/`, note: "mouse stack · behind VPN" },
  { category: "media", name: "SABnzbd", desc: "Usenet downloader", icon: "📰",
    lan: `http://${HOST}:8090/` },
  { category: "media", name: "Mousehole", desc: "qBittorrent companion", icon: "🐭",
    lan: `http://${HOST}:5010/` },
  { category: "media", name: "Port Updater", desc: "VPN port-forward helper", icon: "🔌",
    lan: `http://${HOST}:8087/` },

  // ---- Apps ---------------------------------------------------------------
  { category: "apps", name: "WG-Chores", desc: "Chore tracker", icon: "🧹",
    lan: `http://${HOST}:8084/`, wan: "https://wg-aemtli.ddns.net" },
  { category: "apps", name: "WG-Chores DB", desc: "SQLite web viewer", icon: "🗃️",
    lan: `http://${HOST}:8088/` },
  { category: "apps", name: "Bitwarden", desc: "Password manager", icon: "🔐",
    // TODO: confirm the public domain for Vaultwarden (set in the Cloudflare tunnel).
    lan: "https://bitwarden.holy-grail.ch", wan: "https://bitwarden.holy-grail.ch" },
  { category: "apps", name: "SBB EasyRide", desc: "Tax report tool", icon: "🚆",
    lan: `http://${HOST}:8083/` },
  { category: "apps", name: "Backdrop Carousel", desc: "Wallpaper carousel", icon: "🖼️",
    lan: "https://backdrop-carousel.holy-grail.ch", wan: "https://backdrop-carousel.holy-grail.ch" },

  // ---- Dev & Data ---------------------------------------------------------
  { category: "dev", name: "Jenkins", desc: "CI / CD", icon: "⚙️",
    lan: `http://${HOST}:8081/` },
  { category: "dev", name: "CloudBeaver", desc: "Database UI (loyalty)", icon: "🗄️",
    lan: `http://${HOST}:8978/` },
  { category: "dev", name: "pgweb", desc: "Postgres UI (Digitec)", icon: "🐘",
    lan: `http://${HOST}:8089/` },
  { category: "dev", name: "Digitec Tracker", desc: "Price tracker web", icon: "💲",
    lan: `http://${HOST}:3002/` },
  { category: "dev", name: "Loyalty Cards API", desc: "Backend API", icon: "🎴",
    lan: `http://${HOST}:5000/` },
  { category: "dev", name: "phpLDAPadmin", desc: "LDAP admin (OpenNebula)", icon: "📇",
    lan: `http://${HOST}:6443/` },
];
