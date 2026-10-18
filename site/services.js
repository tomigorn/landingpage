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
    lan: "https://portainer.holy-grail.ch/", note: "Holy Grail login · LAN/VPN only" },
  { category: "infra", name: "Traefik",       desc: "Reverse proxy dashboard", icon: "🔀",
    lan: "https://traefik.holy-grail.ch/dashboard/", note: "Holy Grail login · LAN/VPN only" },
  { category: "infra", name: "AdGuard Home",  desc: "DNS & ad blocking",     icon: "🛡️",
    lan: `http://${HOST}:3000/` },
  { category: "infra", name: "WireGuard",     desc: "VPN management (wg-easy)", icon: "🔑",
    lan: "https://wg-easy.holy-grail.ch/", note: "Holy Grail login · LAN/VPN only" },
  { category: "infra", name: "Cup",           desc: "Docker image update checker", icon: "🥤",
    lan: "https://cup.holy-grail.ch", wan: "https://cup.holy-grail.ch", note: "Holy Grail login" },
  { category: "infra", name: "Beefy Waker",   desc: "Wake-on-LAN for beefy", icon: "⏰",
    lan: `https://beefy-wol.${HOST}/` },
  // LAN-only on purpose: this endpoint powers a machine on, so it must never be
  // reachable from the internet. Traefik enforces that with an ipAllowList.
  { category: "infra", name: "Tower Waker",   desc: "Wake-on-LAN for tower", icon: "⏰",
    lan: `https://tower-wol.${HOST}/` },
  { category: "infra", name: "Authentik",     desc: "Single sign-on (IdP)",  icon: "🔐",
    lan: "https://sso.holy-grail.ch", wan: "https://sso.holy-grail.ch" },

  // ---- Monitoring ---------------------------------------------------------
  { category: "monitoring", name: "Grafana",    desc: "Dashboards & graphs", icon: "📊",
    lan: "https://grafana.holy-grail.ch/", note: "Holy Grail login · LAN/VPN only" },
  { category: "monitoring", name: "Prometheus", desc: "Metrics & alerts",    icon: "🔥",
    lan: `http://${HOST}:9090/` },
  { category: "monitoring", name: "InfluxDB",   desc: "Time-series database", icon: "⏱️",
    lan: `http://${HOST}:8086/` },

  // ---- Media & Downloads --------------------------------------------------
  { category: "media", name: "Audiobookshelf", desc: "Audiobooks & podcasts", icon: "📚",
    lan: "https://audiobookshelf.holy-grail.ch", wan: "https://audiobookshelf.holy-grail.ch" },
  { category: "media", name: "qBittorrent (mouse)", desc: "Torrent client", icon: "⬇️",
    lan: "http://localhost:8085/", note: "ssh -L 8085:127.0.0.1:8085 fastpi" },
  { category: "media", name: "SABnzbd", desc: "Usenet downloader", icon: "📰",
    lan: "http://localhost:8090/", note: "ssh -L 8090:127.0.0.1:8090 fastpi" },
  { category: "media", name: "Mousehole", desc: "qBittorrent companion", icon: "🐭",
    lan: "http://localhost:5010/", note: "ssh -L 5010:127.0.0.1:5010 fastpi" },
  { category: "media", name: "Port Updater", desc: "VPN port-forward helper", icon: "🔌",
    lan: "http://localhost:8087/", note: "ssh -L 8087:127.0.0.1:8087 fastpi" },
  // Not a web service: `shares` makes this row open a popup instead of a link.
  { category: "media", name: "Samba (mouse)", desc: "SMB file shares", icon: "📁",
    host: HOST, shares: [
      { name: "mouse",       path: "/mnt/seagate-red",           access: "read/write", users: ["mouse"] },
      { name: "admin_books", path: "/mnt/seagate-black/library", access: "read/write", users: ["mouse"] },
      { name: "books",       path: "/mnt/seagate-black/library", access: "read-only",  users: ["books", "mouse"] },
    ] },

  // ---- Apps ---------------------------------------------------------------
  { category: "apps", name: "Home Assistant", desc: "Home automation", icon: "🏠",
    lan: `http://${HOST}:8123/` },
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
  // Runs on tower, which powers itself off when idle - the first request after a
  // sleep waits ~2 min while Traefik's wake gate boots it.
  { category: "apps", name: "Nextcloud", desc: "Files, calendar, contacts", icon: "☁️",
    lan: "https://cloud.holy-grail.ch", wan: "https://cloud.holy-grail.ch",
    note: "Holy Grail login" },
  { category: "apps", name: "LanguageTool", desc: "Grammar & style checker", icon: "📝",
    lan: "https://languagetool.holy-grail.ch", wan: "https://languagetool.holy-grail.ch",
    note: "basic auth" },
  { category: "apps", name: "Loyalty Cards", desc: "Loyalty card wallet", icon: "🎴",
    lan: "https://loyalty-cards.holy-grail.ch", wan: "https://loyalty-cards.holy-grail.ch" },
  { category: "apps", name: "Stonks", desc: "Portfolio tracker", icon: "📈",
    lan: "https://stonks.holy-grail.ch", wan: "https://stonks.holy-grail.ch" },

  // ---- Dev & Data ---------------------------------------------------------
  // On-demand: Jenkins is stopped by default to save RAM. Start it first with
  // `Docker/Jenkins/jenkins-ctl.sh start` (or `docker start jenkins-jdk-21`).
  { category: "dev", name: "Jenkins", desc: "CI / CD", icon: "⚙️",
    lan: `http://${HOST}:8081/`, note: "on-demand · start first" },
  { category: "dev", name: "CloudBeaver", desc: "Database UI (loyalty)", icon: "🗄️",
    lan: `http://${HOST}:8978/` },
  { category: "dev", name: "pgweb", desc: "Postgres UI (Digitec)", icon: "🐘",
    lan: `http://${HOST}:8089/` },
  { category: "dev", name: "Digitec Tracker", desc: "Price tracker web", icon: "💲",
    lan: `http://${HOST}:3002/` },
  { category: "dev", name: "Loyalty Cards API", desc: "Backend API", icon: "🔌",
    lan: `http://${HOST}:5000/` },
  { category: "dev", name: "Claude Mockups", desc: "Static mockup host", icon: "🎨",
    lan: "https://claude-mockups.holy-grail.ch", wan: "https://claude-mockups.holy-grail.ch",
    note: "basic auth" },
  { category: "dev", name: "phpLDAPadmin", desc: "LDAP admin (OpenNebula)", icon: "📇",
    lan: `http://${HOST}:6443/` },
];
