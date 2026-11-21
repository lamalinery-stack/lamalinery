// La Malinery — rendu des pages à partir du contenu modifiable (back-office de l'application → « Site web »).
// Ce fichier sert deux fois : build.mjs s'en sert pour fabriquer les pages, et le navigateur s'en sert pour afficher
// une version publiée plus récente (ou l'aperçu d'un brouillon) sans attendre une nouvelle mise en ligne.
// Tout texte venant du contenu est échappé : rien de ce que saisit l'équipe n'est interprété comme du HTML.
(function (global) {
  // Icônes au trait (style Lucide)
  const ICONS = {
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.3 1.2 2.3 2.5 2.8"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    map: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2Z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    pen: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;

  const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  /** Titre : le passage entre astérisques (*de demain*) prend le dégradé. */
  const titre = (t) => esc(t).replace(/\*([^*]+)\*/g, '<span class="grad-text">$1</span>');
  /** 4.99 → « 4,99 € » ; 49.9 → « 49,90 € » ; 29 → « 29 € ». */
  const euro = (n) => `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 })} €`;
  const soon = (b) => (b ? ` <span class="soon">${b === true ? "bientôt" : esc(b)}</span>` : "");
  const visible = (list) => (list ?? []).filter((x) => !x.masque);
  const liste = (v) => (Array.isArray(v) ? v : []);

  /**
   * Adresse d'un lien ou d'une image. « {app} » désigne l'application, « {email} » et « {instagram} » les réglages du site.
   * Seules les adresses web, les pages du site, les ancres et les e-mails sont acceptées : tout le reste devient « # ».
   */
  const url = (v, ctx) => {
    const s = String(v ?? "")
      .trim()
      .replace("{app}", ctx.appUrl)
      .replace("{email}", ctx.email)
      .replace("{instagram}", ctx.instagram);
    return /^(https?:\/\/|\/|#|mailto:)/i.test(s) ? esc(s) : "#";
  };
  const externe = (v) => /^(https?:\/\/|\{app\}|\{instagram\})/i.test(String(v ?? "").trim());
  const cible = (v) => (externe(v) ? ' target="_blank" rel="noopener"' : "");

  const bouton = (b, ctx, defaut = "primary") => {
    if (!b || !b.texte) return "";
    const avant = b.icone === "download" ? `${icon("download")} ` : "";
    const apres = b.icone === "arrow" ? ` ${icon("arrow")}` : "";
    const dl = /\.(apk|pdf|zip)$/i.test(String(b.lien ?? "")) ? " download" : "";
    return `<a class="btn btn--${esc(b.style || defaut)}" href="${url(b.lien, ctx)}"${cible(b.lien)}${dl}>${avant}${esc(b.texte)}${apres}</a>`;
  };
  const boutons = (list, ctx, attrs = ' class="btn-row reveal"') => {
    const html = liste(list)
      .map((b, i) => bouton(b, ctx, i === 0 ? "primary" : "ghost"))
      .join("");
    return html ? `<div${attrs}>${html}</div>` : "";
  };
  const image = (im, ctx, lazy = true) => {
    if (!im || !im.src) return "";
    const dims = im.w && im.h ? ` width="${Number(im.w)}" height="${Number(im.h)}"` : "";
    return `<img src="${url(im.src, ctx)}" alt="${esc(im.alt)}"${lazy ? ' loading="lazy"' : ""}${dims} />`;
  };
  const telephones = (images, ctx, attrs = "", lazy = true) => {
    const list = liste(images).filter((im) => im.src);
    if (!list.length) return "";
    const tilt = (i) => (list.length > 1 && i === 0 ? " phone--tilt-l" : list.length > 2 && i === list.length - 1 ? " phone--tilt-r" : "");
    return `<div class="phones reveal"${attrs}>${list.map((im, i) => `<div class="phone${tilt(i)}">${image(im, ctx, lazy)}</div>`).join("")}</div>`;
  };
  const tete = (b, niveau = "h2") => {
    const parts = [
      b.surtitre ? `<span class="kicker">${esc(b.surtitre)}</span>` : "",
      b.titre ? `<${niveau}>${titre(b.titre)}</${niveau}>` : "",
      b.texte ? `<p class="lead">${esc(b.texte)}</p>` : "",
    ].filter(Boolean);
    return parts.length ? `<div class="section-head reveal">${parts.join("")}</div>` : "";
  };
  const section = (b, inner, extra = "") => `<section class="section${b.fond ? " section--alt" : ""}${extra}"${b.ancre ? ` id="${esc(b.ancre)}"` : ""}>${inner}</section>`;
  const points = (list, cls = "checklist") => (liste(list).length ? `<ul class="${cls}">${liste(list).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : "");

  // ─── Blocs de texte et d'image ────────────────────────────────────────────────────────────────
  const BLOCS = {
    hero: (b, ctx) => `<section class="hero">
  <div class="hero__logo" aria-hidden="true"><img src="/assets/img/logo.webp" alt="" width="640" height="640" /></div>
  <div class="wrap">
    ${liste(b.pastilles).length ? `<div class="hero__badges reveal">${liste(b.pastilles).map((p, i) => `<span class="pill">${i === 0 ? '<span class="dot"></span>' : ""}${esc(p)}</span>`).join("")}</div>` : ""}
    <h1 class="reveal">${titre(b.titre)}</h1>
    ${b.texte ? `<p class="lead reveal">${esc(b.texte)}</p>` : ""}
    ${boutons(b.boutons, ctx)}
  </div>
</section>`,

    entete: (b, ctx) => {
      const texte = `${b.surtitre ? `<span class="kicker reveal">${esc(b.surtitre)}</span>` : ""}<h1 class="reveal">${titre(b.titre)}</h1>${b.texte ? `<p class="lead reveal">${esc(b.texte)}</p>` : ""}${boutons(b.boutons, ctx)}${b.note ? `<p class="muted reveal" style="margin-top:16px;font-size:0.92rem">${esc(b.note)}</p>` : ""}`;
      const phones = telephones(b.images, ctx, "", false);
      return `<section class="page-hero"><div class="wrap${phones ? " split" : ""}">${phones ? `<div>${texte}</div>${phones}` : texte}</div></section>`;
    },

    cartes: (b, ctx) => {
      const cards = liste(b.cartes).map((c) => {
        const inner = `${c.icone ? `<div class="card__icon">${icon(c.icone)}</div>` : ""}<h3>${esc(c.titre)}</h3>${c.sous ? `<p class="card__sub">${esc(c.sous)}</p>` : ""}${c.texte ? `<p class="muted">${esc(c.texte)}</p>` : ""}${points(c.points)}`;
        return c.lien
          ? `<a class="card card--link reveal" href="${url(c.lien, ctx)}"${cible(c.lien)}>${inner}${c.lienTexte ? `<span class="more">${esc(c.lienTexte)}</span>` : ""}</a>`
          : `<div class="card reveal">${inner}</div>`;
      });
      const cols = Number(b.colonnes) === 2 ? " grid--2" : Number(b.colonnes) === 1 ? "" : " grid--3";
      return section(b, `<div class="wrap">${tete(b)}<div class="grid${cols}">${cards.join("")}</div>${boutons(b.boutons, ctx, ' class="btn-row reveal" style="margin-top:28px"')}</div>`);
    },

    "texte-image": (b, ctx) => {
      const imgs = liste(b.images).filter((im) => im.src);
      let media = "";
      if (b.media === "telephones") media = telephones(imgs, ctx);
      else if (b.media === "ecran" && imgs[0]) media = `<div class="laptop reveal"><div class="laptop__screen">${image(imgs[0], ctx)}</div><div class="laptop__base"></div></div>`;
      else if (imgs[0]) media = `<figure class="photo${b.media === "portrait" ? " photo--portrait" : ""} reveal">${image(imgs[0], ctx)}</figure>`;
      const cartes = liste(b.cartes).length
        ? `<div class="grid" style="margin-top:28px">${liste(b.cartes).map((c) => `<div class="card reveal">${c.icone ? `<div class="card__icon">${icon(c.icone)}</div>` : ""}<h3>${esc(c.titre)}</h3><p class="muted">${esc(c.texte)}</p></div>`).join("")}</div>`
        : "";
      const personnes = liste(b.personnes).length
        ? `<div class="duo" style="margin-top:28px">${liste(b.personnes).map((p, i) => `<div class="card person reveal"><div class="avatar${i % 2 ? " avatar--alt" : ""}">${esc(String(p.nom ?? "").trim().charAt(0).toUpperCase())}</div><div><h3>${esc(p.nom)}</h3><p class="muted">${esc(p.role)}</p></div></div>`).join("")}</div>`
        : "";
      const vignettes = liste(b.vignettes).filter((im) => im.src).length
        ? `<div class="thumbs reveal">${liste(b.vignettes).filter((im) => im.src).map((im) => image(im, ctx)).join("")}</div>`
        : "";
      const texte = `<div>${b.surtitre ? `<span class="kicker reveal">${esc(b.surtitre)}</span>` : ""}<h2 class="reveal">${titre(b.titre)}</h2>${b.texte ? `<p class="lead reveal">${esc(b.texte)}</p>` : ""}${liste(b.points).length ? points(b.points).replace('class="checklist"', 'class="checklist reveal"') : ""}${cartes}${personnes}${boutons(b.boutons, ctx)}${vignettes}</div>`;
      return section(b, `<div class="wrap split${b.inverse ? " split--rev" : ""}">${texte}${media}</div>`);
    },

    texte: (b, ctx) => section(b, `<div class="wrap">${tete(b)}${boutons(b.boutons, ctx)}</div>`),

    etapes: (b, ctx) =>
      section(
        b,
        `<div class="wrap">${tete(b)}<div class="steps">${liste(b.etapes).map((e) => `<div class="step reveal"><h3>${esc(e.titre)}</h3><p class="muted">${esc(e.texte)}</p></div>`).join("")}</div>${telephones(b.images, ctx, ' style="margin-top:56px"')}${boutons(b.boutons, ctx, ' class="btn-row reveal" style="justify-content:center;margin-top:48px"')}</div>`,
      ),

    faq: (b) =>
      section(b, `<div class="wrap">${tete(b)}<div class="faq">${liste(b.questions).map((q) => `<details class="reveal"><summary>${esc(q.question)}</summary><p>${esc(q.reponse)}</p></details>`).join("")}</div></div>`),

    appel: (b, ctx) =>
      section(
        b,
        `<div class="wrap"><div class="cta${b.bandeau ? " cta--band" : ""} reveal"><h2>${titre(b.titre)}</h2>${b.texte ? `<p class="lead">${esc(b.texte)}</p>` : ""}${liste(b.boutons).length ? `<div class="btn-row">${liste(b.boutons).map((x, i) => bouton(x, ctx, b.bandeau ? "light" : i === 0 ? "primary" : "ghost")).join("")}</div>` : ""}</div></div>`,
      ),

    video: (b, ctx) =>
      section(
        b,
        `<div class="wrap"><div class="section-head reveal" style="text-align:center;margin-inline:auto">${b.surtitre ? `<span class="kicker">${esc(b.surtitre)}</span>` : ""}<h2>${titre(b.titre)}</h2></div><div class="video-frame reveal"><video controls preload="none"${b.affiche ? ` poster="${url(b.affiche, ctx)}"` : ""} playsinline><source src="${url(b.video, ctx)}" type="video/mp4" /></video></div></div>`,
      ),

    // ─── Blocs alimentés en direct par l'application ───────────────────────────────────────────
    reseau: (b, ctx) =>
      section(b, `<div class="wrap">${tete(b)}<div class="network" data-network="${Number(b.nombre) || 6}"></div>${boutons(b.boutons, ctx, ' class="btn-row" style="margin-top:28px"')}</div>`),

    agenda: (b, ctx) =>
      section(b, `<div class="wrap">${tete(b)}<div class="events" data-events="${Number(b.nombre) || 3}"${b.sansLien ? " data-sans-lien" : ""}></div>${boutons(b.boutons, ctx, ' class="btn-row" style="margin-top:28px"')}</div>`),

    rubriques: (b) =>
      section(
        b,
        `<div class="wrap"><div class="grid grid--3">${liste(b.cartes).map((c) => `<a class="card card--lien reveal" href="#articles" data-rubrique="${esc(c.rubrique)}"><div class="card__icon">${icon(c.icone)}</div><h3>${esc(c.titre)}</h3><p class="muted">${esc(c.texte)}</p></a>`).join("")}</div></div>`,
      ),

    articles: (b) =>
      `<section class="section" id="articles" hidden><div class="wrap"><h2 class="reveal">${titre(b.titre)}</h2><p class="muted" id="articles-filtre" hidden></p><div class="articles" id="articles-list"></div></div></section>`,

    // ─── Blocs fabriqués à partir des tarifs et des fiches artistes ───────────────────────────
    abonnements: (b, ctx) => {
      const { formules, roster, profils } = ctx.tarifs.abonnements;
      const cards = formules.map(
        (f) => `<article class="card offer${f.vedette ? " offer--featured" : ""} reveal">
        <p class="offer__flag">${f.vedette ? esc(f.vedette) : "&nbsp;"}</p>
        <div class="offer__head offer__head--stack"><h3>${esc(f.nom)}</h3><div class="offer__price">${euro(f.mois)}${f.mois ? "<small>par mois</small>" : ""}</div></div>
        <p class="muted offer__alt">${f.an ? `ou ${euro(f.an)} par an` : "&nbsp;"}</p>
        <ul class="checklist">${visible(f.points).map((pt) => `<li><span>${esc(pt.texte)}${soon(pt.bientot)}</span></li>`).join("")}</ul>
      </article>`,
      );
      const detail = liste(profils)
        .map((p, i) => {
          const rows = visible(p.lignes).map((l) => `<tr><th scope="row">${esc(l.nom)}${soon(l.bientot)}</th>${liste(l.valeurs).map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`);
          return `<details class="reveal"${i === 0 ? " open" : ""}><summary><span>${esc(p.titre)} <span class="muted summary__more">· ${esc(p.precision)}</span></span></summary>
      <div class="table-scroll"><table class="price-table">
        <thead><tr><th></th>${formules.map((f) => `<th>${esc(f.nom)}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table></div>
    </details>`;
        })
        .join("");
      return section(
        b,
        `<div class="wrap">${tete(b)}<div class="grid grid--4">${cards.join("")}</div><p class="muted reveal" style="margin-top:22px">${esc(roster)}</p>${boutons(b.boutons, ctx, ' class="btn-row reveal" style="margin-top:28px"')}<div class="faq faq--wide" style="margin-top:48px">${detail}</div>${b.note ? `<p class="footnote reveal">${esc(b.note)}</p>` : ""}</div>`,
      );
    },

    community: (b, ctx) => {
      const f = ctx.tarifs.cm.formules;
      const cards = f.map(
        (x) => `<article class="card offer${x.vedette ? " offer--featured" : ""} reveal">
        <p class="offer__flag">${x.vedette ? esc(x.vedette) : "&nbsp;"}</p>
        <div class="offer__head"><h3>${esc(x.nom)}</h3><div class="offer__price">${euro(x.mois)}<small>par mois HT</small></div></div>
        <ul class="checklist">${String(x.resume ?? "").split(" · ").map((y) => `<li>${esc(y)}</li>`).join("")}</ul>
        <ul class="tier-list">
          <li><b>3 mois payés en une fois</b><span>${euro(x.trimestre)} HT</span></li>${x.roster ? `<li><b>Artistes du roster (−10 %)</b><span>${euro(x.roster)} / mois HT</span></li>` : ""}
        </ul>
      </article>`,
      );
      // Économie réelle du paiement en une fois : trois mensualités moins le prix des trois mois
      const enum_ = (fn) => f.map(fn).join(", ").replace(/, ([^,]*)$/, " ou $1");
      const engagement = `Engagement 3 mois minimum · Paiement 3 mois en une fois : ${enum_((x) => euro(x.trimestre))} HT, soit ${enum_((x) => euro(x.mois * 3 - x.trimestre))} d'économie.`;
      return section(
        b,
        `<div class="wrap">${tete(b)}<div class="grid grid--3">${cards.join("")}</div><p class="reveal" style="margin-top:28px;max-width:860px">${esc(engagement)}${b.complement ? ` ${esc(b.complement)}` : ""}</p>${boutons(b.boutons, ctx)}</div>`,
      );
    },

    carte: (b, ctx) => {
      const cards = liste(ctx.tarifs.carte.rubriques).map(
        (r) => `<article class="card reveal">
        <h3>${esc(r.titre)}</h3>
        <ul class="menu">${liste(r.lignes).map((l) => `<li><div><b>${esc(l.nom)}</b><span>${esc(l.description)}${l.duree && l.duree !== "—" ? ` · ${esc(l.duree)}` : ""}</span></div><em>${esc(l.tarif)}</em></li>`).join("")}</ul>
      </article>`,
      );
      return section(
        b,
        `<div class="wrap">${tete(b)}<div class="grid grid--2">${cards.join("")}</div><p class="muted reveal" style="margin-top:22px">${esc(ctx.tarifs.carte.mention)}</p>${boutons(b.boutons, ctx, ' class="btn-row reveal" style="margin-top:28px"')}</div>`,
      );
    },

    artistes: (b, ctx) => {
      const LIENS = [
        ["reseaux", "Réseaux sociaux"],
        ["ecouter", "Écouter"],
        ["dates", "Prochaines dates"],
      ];
      // Une photo est soit un nom de fichier du site (« hyppo-1 »), soit une adresse complète (image envoyée depuis le back-office)
      const photo = (p, alt) => `<img src="${/^(https?:\/\/|\/)/.test(p) ? url(p, ctx) : `/assets/img/artistes/${esc(p)}.webp`}" alt="${esc(alt)}" loading="lazy" />`;
      // Une fiche sans nom n'est pas affichée ; un lien sans adresse non plus
      const fiches = liste(ctx.artistes)
        .filter((x) => x.nom)
        .map((x) => {
          const liens = LIENS.filter(([k]) => x.liens && x.liens[k]);
          return `<article class="card artist reveal" id="${esc(String(x.nom).toLowerCase())}">
      <div class="artist__media">${x.photo ? photo(x.photo, `${x.nom}, artiste La Malinery`) : `<div class="artist__blank" aria-hidden="true">${esc(x.nom)}</div>`}</div>
      <div class="artist__body">
        <h2>${esc(x.nom)}</h2>
        <p class="artist__meta">${esc(x.ville)} · ${esc(x.style)}</p>
        ${liste(x.bio).map((t) => `<p>${esc(t)}</p>`).join("")}
        <p class="artist__tags">${liste(x.tags).map((t) => `#${esc(t)}`).join(" ")}</p>${liens.length ? `<div class="btn-row">${liens.map(([k, label]) => `<a class="btn btn--ghost btn--sm" href="${url(x.liens[k], ctx)}" target="_blank" rel="noopener">${label}</a>`).join("")}</div>` : ""}${liste(x.galerie).length ? `<div class="artist__gallery">${liste(x.galerie).map((g) => photo(g, x.nom)).join("")}</div>` : ""}
      </div>
    </article>`;
        });
      return section(b, `<div class="wrap artists">${fiches.join("")}</div>`);
    },

    // Le formulaire lui-même est fixe : il écrit dans la table contact_messages de l'application (assets/js/main.js)
    contact: (b, ctx) =>
      section(
        b,
        `<div class="wrap split" style="align-items:start">
    <form class="card form reveal" id="contact-form" novalidate>
      <div class="row">
        <div class="field"><label for="name">Prénom / Nom</label><input id="name" name="name" autocomplete="name" required minlength="2" maxlength="80" /></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required maxlength="160" /></div>
      </div>
      <div class="row">
        <div class="field"><label for="profil">Tu es</label><select id="profil" name="profil" required><option value="artiste">Artiste</option><option value="creatif">Créatif / Prestataire</option><option value="presse">Presse</option><option value="autre">Autre</option></select></div>
        <div class="field"><label for="sujet">Sujet</label><select id="sujet" name="sujet" required><option value="rejoindre">Rejoindre le réseau</option><option value="devis">Devis</option><option value="partenariat">Partenariat</option><option value="question">Question générale</option></select></div>
      </div>
      <div class="field"><label for="message">Message</label><textarea id="message" name="message" required minlength="10" maxlength="2800"></textarea></div>
      <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <div class="form-status" role="status" aria-live="polite"></div>
      <button class="btn btn--primary" type="submit">Envoyer</button>
      <p class="muted" style="font-size:0.85rem;margin:0">Tes informations servent uniquement à te répondre. Voir la <a href="/confidentialite.html">politique de confidentialité</a>.</p>
    </form>
    <div>
      <ul class="contact-list">
        <li class="reveal"><div class="card__icon">${icon("mail")}</div><div><h3>E-mail</h3><p class="muted"><a class="accent" href="mailto:${esc(ctx.email)}">${esc(ctx.email)}</a></p></div></li>
        ${b.ville ? `<li class="reveal"><div class="card__icon">${icon("map")}</div><div><h3>${esc(b.ville)}</h3></div></li>` : ""}
        ${ctx.instagram ? `<li class="reveal"><div class="card__icon">${icon("instagram")}</div><div><h3>Instagram</h3><p class="muted"><a class="accent" href="${url(ctx.instagram, ctx)}" target="_blank" rel="noopener">${esc(b.instagramTexte || "Instagram")}</a></p></div></li>` : ""}
      </ul>
    </div>
  </div>`,
      ),
  };

  /** Contexte de rendu : adresses, tarifs et fiches viennent du contenu ; l'adresse de l'application de la configuration. */
  const contexte = (contenu, config) => ({
    appUrl: (config && config.appUrl) || "",
    email: (contenu.reglages && contenu.reglages.email) || "",
    instagram: (contenu.reglages && contenu.reglages.instagram) || "",
    tarifs: contenu.tarifs,
    artistes: contenu.artistes,
  });

  /** Corps d'une page (les blocs masqués ou de type inconnu sont ignorés). */
  const rendrePage = (pageId, contenu, config) => {
    const page = contenu.pages && contenu.pages[pageId];
    if (!page) return null;
    const ctx = contexte(contenu, config);
    return liste(page.blocs)
      .filter((b) => b && !b.masque && BLOCS[b.type])
      .map((b) => BLOCS[b.type](b, ctx))
      .join("\n\n");
  };

  global.MalinerySite = { rendrePage, icon, euro, esc, types: Object.keys(BLOCS) };
})(typeof window !== "undefined" ? window : globalThis);
