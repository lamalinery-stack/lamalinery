// La Malinery — site vitrine. Navigation, animations, soirées en direct et formulaire de contact.
// Adresses de l'application et de sa base : écrites dans chaque page par build.mjs (window.MALINERY).
// Clé publique (anon) : lecture de ce qui est publié et envoi des messages de contact, protégés par les règles de la base.
const CONFIG = window.MALINERY || {};
const APP_URL = CONFIG.app || "https://malinery.pragmatt.com";
const SUPABASE_URL = CONFIG.base || "https://eqeaxpjyxflxysthggng.supabase.co";
const SUPABASE_ANON_KEY =
  CONFIG.cle ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxZWF4cGp5eGZseHlzdGhnZ25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjc2OTMsImV4cCI6MjEwODcwMzY5M30.zZ5yZODOLVkq4Ppq7OYs-X2wbZlOANYhPqPIevu6ylg";

const api = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, ...init.headers },
  });

// En-tête : fond au scroll + menu mobile
const header = document.querySelector(".header");
const burger = document.querySelector(".burger");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
burger?.addEventListener("click", () => {
  const open = header.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
});
document.querySelectorAll(".nav a").forEach((a) =>
  a.addEventListener("click", () => {
    header.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }),
);

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Bouton « Une idée ? » : uniquement sur la prévisualisation (attribut data-feedback ajouté par build.mjs --preview).
// Les suggestions arrivent dans le portail dev de l'app (/admin/portail), table feedback.
if (document.body.dataset.feedback !== undefined) {
  const KINDS = [
    ["idee", "Idée"],
    ["bug", "Problème"],
    ["question", "Question"],
  ];
  const wrap = document.createElement("div");
  wrap.className = "fb";
  wrap.innerHTML = `
    <button class="fb__tab" type="button" aria-label="Suggérer une amélioration" title="Suggérer une amélioration">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></svg>
      <span>Une idée ?</span>
    </button>
    <form class="fb__panel" role="dialog" aria-label="Suggérer une amélioration" hidden>
      <div class="fb__head">
        <div><strong>Une idée pour le site ?</strong><small>Ton message arrive directement à l'équipe de développement.</small></div>
        <button class="fb__close" type="button" aria-label="Fermer">×</button>
      </div>
      <div class="fb__kinds">${KINDS.map(([k, l], i) => `<button type="button" data-kind="${k}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
      <input class="fb__name" name="name" maxlength="80" placeholder="Ton prénom" autocomplete="given-name" required />
      <textarea class="fb__msg" name="message" maxlength="3000" placeholder="Ce que tu aimerais changer, ajouter, améliorer…" required></textarea>
      <p class="fb__hint">La page actuelle est jointe automatiquement.</p>
      <p class="fb__status" role="status" aria-live="polite"></p>
      <div class="fb__actions"><button class="fb__cancel" type="button">Annuler</button><button class="btn btn--primary fb__send" type="submit">Envoyer</button></div>
    </form>`;
  document.body.append(wrap);

  const tab = wrap.querySelector(".fb__tab");
  const panel = wrap.querySelector(".fb__panel");
  const name = wrap.querySelector(".fb__name");
  const msg = wrap.querySelector(".fb__msg");
  const status = wrap.querySelector(".fb__status");
  let kind = "idee";
  try {
    name.value = localStorage.getItem("malinery-fb-name") || "";
  } catch {}

  const open = (on) => {
    panel.hidden = !on;
    tab.hidden = on;
    if (on) (name.value ? msg : name).focus();
  };
  tab.addEventListener("click", () => open(true));
  wrap.querySelector(".fb__close").addEventListener("click", () => open(false));
  wrap.querySelector(".fb__cancel").addEventListener("click", () => open(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && !panel.hidden && open(false));
  document.addEventListener("mousedown", (e) => !panel.hidden && !wrap.contains(e.target) && open(false));
  wrap.querySelectorAll("[data-kind]").forEach((b) =>
    b.addEventListener("click", () => {
      kind = b.dataset.kind;
      wrap.querySelectorAll("[data-kind]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }),
  );

  panel.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg.value.trim().length < 3) return;
    const send = wrap.querySelector(".fb__send");
    send.disabled = true;
    status.textContent = "Envoi…";
    try {
      localStorage.setItem("malinery-fb-name", name.value.trim());
    } catch {}
    const res = await api("feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        source: "site",
        kind,
        message: msg.value.trim(),
        author_name: name.value.trim() || null,
        page: location.pathname,
        device: `${innerWidth}×${innerHeight} · ${navigator.userAgent.slice(0, 150)}`,
      }),
    }).catch(() => null);
    send.disabled = false;
    if (res && res.ok) {
      msg.value = "";
      status.textContent = "Merci ! Ta suggestion est bien arrivée.";
      setTimeout(() => {
        status.textContent = "";
        open(false);
      }, 1800);
    } else {
      status.textContent = "L'envoi n'a pas marché, réessaie dans un instant.";
    }
  });
}

// Filtre du blog : un seul écouteur pour tout le document, valable même après un nouvel affichage du contenu
let surRubrique = null;
document.addEventListener("click", (ev) => {
  const lien = ev.target.closest("[data-rubrique]");
  if (!lien || !surRubrique) return;
  ev.preventDefault();
  surRubrique(lien.dataset.rubrique || null);
});

/**
 * Met en route tout ce qui dépend du contenu de la page : apparition des blocs, soirées, annuaire, formulaire, articles.
 * Appelée au chargement, puis de nouveau quand le contenu est remplacé par une version plus récente.
 */
function initContenu() {
  surRubrique = null;
  // Apparition des blocs au scroll
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Compteurs animés
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    obs.observe(el);
  });

  // Prochaines soirées, lues en direct dans la base de l'application
  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const euro = (n) => (Number(n) === 0 ? "Gratuit" : `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: Number(n) % 1 ? 2 : 0 })} €`);

  document.querySelectorAll("[data-events]").forEach(async (list) => {
    const limit = Number(list.dataset.events) || 3;
    // Tant que l'application n'est pas annoncée, les cartes n'y renvoient pas : ni lien, ni « Réserver »
    const sansLien = list.dataset.sansLien !== undefined;
    list.innerHTML = Array.from({ length: Math.min(limit, 3) }, () => '<div class="event event--skeleton" aria-hidden="true"></div>').join("");
    try {
      const now = new Date().toISOString();
      const res = await api(
        `events?select=id,title,venue,date,ticket_price,total_capacity,open_mic_capacity&is_active=eq.true&date=gte.${now}&order=date.asc&limit=${limit}`,
      );
      if (!res.ok) throw new Error(res.statusText);
      const events = await res.json();
      if (!events.length) {
        list.innerHTML = sansLien
          ? `<p class="muted">Les prochaines dates arrivent très vite.</p>`
          : `<p class="muted">Les prochaines dates arrivent très vite. Suis-nous sur l'app pour être prévenu·e en premier.</p>`;
        return;
      }
      list.innerHTML = events
        .map((e) => {
          const d = new Date(e.date);
          const day = d.toLocaleDateString("fr-FR", { day: "2-digit", timeZone: "Europe/Paris" });
          const month = d.toLocaleDateString("fr-FR", { month: "short", timeZone: "Europe/Paris" }).replace(".", "");
          const full = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
          const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
          if (sansLien) {
            return `<div class="event reveal is-visible">
          <div class="event__date"><b>${day}</b><small>${escapeHtml(month)}</small></div>
          <div>
            <h3>${escapeHtml(e.title)}</h3>
            <div class="event__meta"><span>${escapeHtml(e.venue)}</span><span>${escapeHtml(full)} à ${time}</span>${e.open_mic_capacity > 0 ? "<span>Open mic</span>" : ""}</div>
          </div>
          <div class="event__price">${euro(e.ticket_price)}</div>
        </div>`;
          }
          return `<a class="event reveal is-visible" href="${APP_URL}/events/${encodeURIComponent(e.id)}" target="_blank" rel="noopener">
            <div class="event__date"><b>${day}</b><small>${escapeHtml(month)}</small></div>
            <div>
              <h3>${escapeHtml(e.title)}</h3>
              <div class="event__meta"><span>${escapeHtml(e.venue)}</span><span>${escapeHtml(full)} à ${time}</span>${e.open_mic_capacity > 0 ? "<span>Open mic</span>" : ""}</div>
            </div>
            <div class="event__price">${euro(e.ticket_price)}<small>Réserver</small></div>
          </a>`;
        })
        .join("");
    } catch {
      list.innerHTML = sansLien
        ? `<p class="muted">Impossible de charger la programmation pour le moment.</p>`
        : `<p class="muted">Impossible de charger la programmation pour le moment. <a class="accent" href="${APP_URL}/events" target="_blank" rel="noopener">Voir les soirées sur l'app</a></p>`;
    }
  });

  // Formulaire de contact → app (/api/contact) : table contact_messages + alerte e-mail à l'équipe
  const form = document.querySelector("#contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    // Liens du site du type contact.html?sujet=devis&profil=creatif : la liste est déjà positionnée.
    const params = new URLSearchParams(location.search);
    for (const key of ["sujet", "profil"]) {
      const v = params.get(key);
      if (v && form[key].querySelector(`option[value="${CSS.escape(v)}"]`)) form[key].value = v;
    }

    // La table contact_messages n'accepte que huit sujets (ceux du back-office). On y range les deux listes du formulaire :
    // « Devis » devient « conseil », ce qui crée automatiquement une demande de devis dans le back-office.
    const toSubject = (sujet, profil) => {
      if (sujet === "devis") return "conseil";
      if (sujet === "partenariat") return "partenariat";
      if (profil === "presse") return "presse";
      if (sujet === "rejoindre") return profil === "creatif" ? "partenaire" : profil === "artiste" ? "artiste" : "autre";
      return "autre";
    };
    const label = (select) => select.options[select.selectedIndex].textContent.trim();

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      status.className = "form-status";
      if (form.website.value) return; // champ piège anti-robots
      const text = form.message.value.trim();
      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: toSubject(form.sujet.value, form.profil.value),
        // Les deux choix sont recopiés en clair : rien n'est perdu pour l'équipe qui lit le message.
        message: `[Tu es : ${label(form.profil)} · Sujet : ${label(form.sujet)}]\n${text}`,
      };
      if (text.length < 10) {
        status.textContent = "Ton message est un peu court : dis-nous en un peu plus (10 caractères minimum).";
        status.classList.add("is-error");
        return;
      }
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Envoi…";
      try {
        // Passe par l'app : le message est enregistré et l'équipe est prévenue par e-mail
        const res = await fetch(`${APP_URL}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        form.reset();
        status.textContent = "Message reçu ! Pauline & Naïma te répondent au plus vite.";
        status.classList.add("is-ok");
      } catch {
        status.textContent = "L'envoi n'a pas fonctionné. Vérifie ton e-mail et réessaie dans un instant.";
        status.classList.add("is-error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Envoyer";
      }
    });
  }

  // Aperçu de l'annuaire (accueil) : mêmes règles que l'app (fiches validées, Premium mis en avant).
  document.querySelectorAll("[data-network]").forEach(async (box) => {
    const kinds = { artist: "Artiste", partner: "Partenaire", provider: "Prestataire" };
    box.innerHTML = '<p class="muted">Chargement du réseau…</p>';
    try {
      const [res, hubsRes] = await Promise.all([
        api("rpc/search_directory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p_per_page: Number(box.dataset.network) || 6 }) }),
        api("hub_categories?select=slug,name"),
      ]);
      if (!res.ok || !hubsRes.ok) throw new Error();
      const rows = await res.json();
      const hubs = Object.fromEntries((await hubsRes.json()).map((h) => [h.slug, h.name]));
      if (!rows.length) {
        box.innerHTML = '<p class="muted">Le réseau se construit : les premières fiches arrivent bientôt.</p>';
        return;
      }
      const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      box.innerHTML = rows
        .map((r) => {
          const initials = esc(r.display_name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase());
          const avatar = r.avatar_path
            ? `<img src="${SUPABASE_URL}/storage/v1/object/public/profile-media/${esc(r.avatar_path)}" alt="" loading="lazy" />`
            : initials;
          return `<a class="member reveal is-visible" href="${APP_URL}/annuaire/${encodeURIComponent(r.slug)}" target="_blank" rel="noopener">
            <span class="member__avatar">${avatar}</span>
            <span class="member__body"><b>${esc(r.display_name)}${r.plan === "premium" ? ' <span class="member__badge">Premium</span>' : ""}</b>
            <small>${r.kind === "artist" ? "" : `${esc(kinds[r.kind])}, `}${esc(hubs[r.hub] ?? r.hub)}${r.city ? `, ${esc(r.city)}` : ""}</small>
            ${r.tags?.length ? `<span class="member__tags">${r.tags.slice(0, 3).map((t) => `#${esc(t)}`).join(" ")}</span>` : ""}</span>
          </a>`;
        })
        .join("");
    } catch {
      box.innerHTML = `<p class="muted">L'annuaire est momentanément indisponible. <a class="accent" href="${APP_URL}/annuaire" target="_blank" rel="noopener">Ouvrir l'annuaire</a></p>`;
    }
  });

  // Blog : articles publiés depuis le back-office de l'application (table articles, lecture publique des seuls articles publiés)
  const articlesList = document.querySelector("#articles-list");
  if (articlesList) {
    const RUBRIQUES = {
      image: "Image & réseaux sociaux",
      production: "Production",
      scene: "Scène & performance",
      business: "Business & droits",
      portraits: "Portraits",
      veille: "Veille industrie",
    };
    // Le texte vient de la base : il est toujours échappé avant d'être affiché, jamais interprété comme du HTML.
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const gras = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Même mise en forme que dans l'application : « ## » intertitre, « - » liste, ligne vide entre deux paragraphes
    const corps = (body) =>
      body
        .replace(/\r\n/g, "\n")
        .split(/\n{2,}/)
        .map((part) => {
          const lines = part.split("\n").map((l) => l.trim()).filter(Boolean);
          if (!lines.length) return "";
          let html = "";
          if (lines[0].startsWith("## ")) html += `<h4>${esc(lines.shift().slice(3))}</h4>`;
          if (!lines.length) return html;
          return lines.every((l) => l.startsWith("- "))
            ? html + `<ul>${lines.map((l) => `<li>${gras(l.slice(2))}</li>`).join("")}</ul>`
            : html + `<p>${gras(lines.join(" "))}</p>`;
        })
        .join("");

    // Un clic sur une rubrique affiche ses articles ; « Toutes les rubriques » les réaffiche tous.
    const section = document.querySelector("#articles");
    const filtre = document.querySelector("#articles-filtre");
    let articles = [];
    const afficher = (rubrique) => {
      const liste = rubrique ? articles.filter((a) => a.rubrique === rubrique) : articles;
      articlesList.innerHTML = liste
        .map(
          (a) => `<article class="article" id="${esc(a.slug)}">
            <p class="article__rubrique">${esc(RUBRIQUES[a.rubrique] ?? a.rubrique)}</p>
            <h3>${esc(a.title)}</h3>
            <p class="muted">${esc(a.excerpt)}</p>
            <details><summary>Lire l'article</summary><div class="article__corps">${corps(a.body)}</div></details>
          </article>`,
        )
        .join("");
      filtre.hidden = !rubrique && liste.length > 0;
      filtre.innerHTML = filtre.hidden
        ? ""
        : !liste.length
        ? rubrique
          ? `Pas encore d'article dans la rubrique « ${esc(RUBRIQUES[rubrique])} ». <a class="accent" href="#articles" data-rubrique="">Toutes les rubriques</a>`
          : "Les premiers articles arrivent bientôt."
        : `Rubrique « ${esc(RUBRIQUES[rubrique])} ». <a class="accent" href="#articles" data-rubrique="">Toutes les rubriques</a>`;
      section.hidden = false;
    };
    surRubrique = (rubrique) => {
      afficher(rubrique);
      section.scrollIntoView({ behavior: "smooth" });
    };

    api("articles?select=slug,rubrique,title,excerpt,body,published_at&order=published_at.desc&limit=30")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        articles = Array.isArray(rows) ? rows : [];
        if (!articles.length) return;
        afficher(null);
        // Lien direct vers un article : blog.html#adresse-de-l-article
        const cible = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (cible && cible.classList.contains("article")) {
          cible.querySelector("details").open = true;
          cible.scrollIntoView();
        }
      })
      .catch(() => {});
  }
}

initContenu();

// ─── Contenu modifiable depuis le back-office (« Site web ») ────────────────────────────────────
// La page a été générée avec une version publiée (data-version). Si l'équipe a publié depuis, le contenu le plus
// récent est affiché à la place, sans attendre une nouvelle mise en ligne du site.
// Avec ?apercu=<jeton> dans l'adresse, c'est le brouillon en cours qui est affiché (lien donné par le back-office).
(async () => {
  const main = document.querySelector("main[data-page]");
  if (!main || !window.MalinerySite) return;
  const page = main.dataset.page;
  const jeton = new URLSearchParams(location.search).get("apercu");
  const rpc = (nom, corps = {}) =>
    api(`rpc/${nom}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) }).then((r) => (r.ok ? r.json() : null));
  try {
    let donnees = null;
    if (jeton) {
      donnees = await rpc("site_draft", { p_token: jeton });
      if (!donnees) return bandeau("Aperçu indisponible : le lien n'est plus valable. Rouvre l'aperçu depuis le back-office.");
    } else {
      const version = await rpc("site_published_version");
      if (!(Number(version) > Number(main.dataset.version || 0))) return;
      donnees = await rpc("site_published");
    }
    const contenu = donnees && donnees.contenu;
    const html = contenu && window.MalinerySite.rendrePage(page, contenu, { appUrl: APP_URL });
    if (!html) return;
    main.innerHTML = html;
    const p = contenu.pages[page];
    if (p.titre) document.title = p.titre;
    const pied = document.querySelector("[data-pied]");
    if (pied && contenu.reglages && contenu.reglages.piedDePage) pied.textContent = contenu.reglages.piedDePage;
    initContenu();
    if (jeton) {
      bandeau("Aperçu du brouillon : les visiteurs ne voient pas encore ces modifications.");
      // Les liens internes gardent le jeton, pour parcourir tout le site en aperçu
      document.querySelectorAll('a[href^="/"]').forEach((a) => {
        const u = new URL(a.href);
        if (u.origin === location.origin && !u.pathname.startsWith("/assets/")) {
          u.searchParams.set("apercu", jeton);
          a.href = u.pathname + u.search + u.hash;
        }
      });
    }
    if (location.hash.length > 1) {
      const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (cible) cible.scrollIntoView();
    }
  } catch {
    // Base injoignable : la page garde le contenu avec lequel elle a été générée
  }

  function bandeau(texte) {
    const b = document.createElement("div");
    b.className = "apercu-bandeau";
    b.setAttribute("role", "status");
    b.textContent = texte;
    document.body.append(b);
  }
})();
