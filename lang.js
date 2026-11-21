// =====================================================
//  Traductions FR / EN (même principe que la page MS43)
//  - Textes courts : attribut data-i18n="cle" (et data-i18n-ph pour les placeholders)
//  - Longs blocs (pop-ups, CGV) : deux versions dans la page, data-only="fr" / data-only="en"
//  Pour modifier un texte : changer la valeur dans "fr" ET dans "en".
// =====================================================
window.AJM = (function () {
  var I18N = {
    fr: {
      nav_real: "Réalisations",
      nav_services: "Prestations",
      nav_requests: "Demandes",
      nav_cgv: "CGV",
      hero: "Bienvenue chez AJM Tune",

      services_h2: "Nos Services",
      svc_go: "Réglage gestion ouverte / Calibration moteur",
      svc_install: "Installation ECU programmable",
      svc_parts: "Vente de pièces performances",
      svc_diag: "Diagnostic moteur",
      svc_ms: "Ecu Siemens MS42/MS43/MS45 ImmoOff",
      svc_ms43: "Espace client MS43 en ligne &mdash; préparez votre fichier",

      fs_h2: "Comment profiter de notre expertise ?",
      fs_form: "Obtenez votre devis grâce au formulaire suivant :",
      fs_here: "ici",
      fs_or: "ou",
      fs_insta: "Laissez nous un message sur Instagram :",

      form_h3: "Formulaire de Demande",
      f_first: "Prénom :",
      f_last: "Nom :",
      f_email: "Email :",
      f_brand: "Marque :",
      f_model: "Modèle :",
      f_type: "Type de demande :",
      opt_choose: "Choisissez une option",
      opt_go: "Cartographie Gestion ouverte (300€)",
      opt_ms: "Calculateur MS42/MS43/MS45 (200€)",
      opt_diag: "Diagnostic (150€)",
      opt_other: "Autre (0€)",
      f_gbrand: "Marque de la gestion ouverte :",
      f_gbrand_ph: "Ex : MaxxEcu, Link, Motorsport Electronics, K-Data",
      f_bench: "Souhaitez-vous la location du banc ? (+250€)",
      f_bench_note: "1/2 journée sur Valence (26)",
      f_desc: "Description :",
      price: "Prix estimatif : ",
      terms_before: "Je comprends et accepte les",
      terms_link: "CGV",
      submit: "Envoyer la demande",
      sending: "Envoi en cours…",
      info_note: "* Les prix affichés sont donnés à titre indicatif et peuvent varier.",
      conf_h3: "Demande envoyée !",
      conf_p: "Votre demande a bien été envoyée. Nous vous contacterons sous peu.",

      about_h2: "À propos",
      about_p: "Avec une expertise reconnue...",
      real_h2: "Voici quelques-unes de nos réalisations",
      footer_rights: "© 2025 AJM Service - Tous droits réservés",

      err_title: "Erreur lors de l'envoi du formulaire :",
      err_not_loaded: "Erreur lors de l'envoi du formulaire : le service d'envoi n'a pas pu être chargé. Rechargez la page.",
      err_gmail: "La connexion Gmail du service EmailJS a expiré (le propriétaire du site doit la reconnecter).",
      err_scopes: "Le compte Gmail n'a pas autorisé EmailJS à envoyer des e-mails.",
      err_recipient: "Le modèle EmailJS n'a pas d'adresse de destination (champ « To Email »).",
      err_sdk: "La version d'EmailJS chargée par la page est trop ancienne (mettre à jour la balise <script> dans index.html).",
      err_limit: "La limite d'envoi EmailJS est atteinte. Réessayez plus tard.",
      err_network: "Problème de connexion Internet. Vérifiez votre connexion et réessayez.",
      err_unknown: "Erreur inconnue."
    },
    en: {
      nav_real: "Projects",
      nav_services: "Services",
      nav_requests: "Requests",
      nav_cgv: "T&amp;Cs",
      hero: "Welcome to AJM Tune",

      services_h2: "Our Services",
      svc_go: "Standalone ECU tuning / Engine calibration",
      svc_install: "Programmable ECU installation",
      svc_parts: "Performance parts sales",
      svc_diag: "Engine diagnostics",
      svc_ms: "Siemens MS42/MS43/MS45 ECU ImmoOff",
      svc_ms43: "MS43 online client area &mdash; prepare your file",

      fs_h2: "How to benefit from our expertise?",
      fs_form: "Get your quote using the following form:",
      fs_here: "here",
      fs_or: "or",
      fs_insta: "Send us a message on Instagram:",

      form_h3: "Request Form",
      f_first: "First name:",
      f_last: "Last name:",
      f_email: "Email:",
      f_brand: "Make:",
      f_model: "Model:",
      f_type: "Request type:",
      opt_choose: "Choose an option",
      opt_go: "Standalone ECU map (€300)",
      opt_ms: "MS42/MS43/MS45 ECU (€200)",
      opt_diag: "Diagnostics (€150)",
      opt_other: "Other (€0)",
      f_gbrand: "Standalone ECU brand:",
      f_gbrand_ph: "E.g. MaxxEcu, Link, Motorsport Electronics, K-Data",
      f_bench: "Would you like to rent the dyno? (+€250)",
      f_bench_note: "Half a day in Valence (26), France",
      f_desc: "Description:",
      price: "Estimated price: ",
      terms_before: "I understand and accept the",
      terms_link: "T&amp;Cs",
      submit: "Send request",
      sending: "Sending…",
      info_note: "* Prices shown are indicative and may vary.",
      conf_h3: "Request sent!",
      conf_p: "Your request has been sent. We will get back to you shortly.",

      about_h2: "About",
      about_p: "With recognised expertise...",
      real_h2: "Here are some of our projects",
      footer_rights: "© 2025 AJM Service - All rights reserved",

      err_title: "Error while sending the form:",
      err_not_loaded: "Error while sending the form: the sending service could not be loaded. Please reload the page.",
      err_gmail: "The EmailJS Gmail connection has expired (the site owner needs to reconnect it).",
      err_scopes: "The Gmail account has not allowed EmailJS to send emails.",
      err_recipient: "The EmailJS template has no recipient address (\"To Email\" field).",
      err_sdk: "The EmailJS version loaded by the page is too old (update the <script> tag in index.html).",
      err_limit: "The EmailJS sending limit has been reached. Please try again later.",
      err_network: "Internet connection problem. Check your connection and try again.",
      err_unknown: "Unknown error."
    }
  };

  // Langue de départ : celle choisie lors d'une visite précédente, sinon le français.
  var lang = "fr";
  try {
    var saved = localStorage.getItem("ajm_lang");
    if (saved && I18N[saved]) lang = saved;
  } catch (e) {}
  document.documentElement.lang = lang;

  var listeners = [];

  function t(key) {
    var v = I18N[lang][key];
    return v === undefined ? I18N.fr[key] : v;
  }

  // Texte français, quelle que soit la langue affichée (pour l'e-mail reçu par AJM).
  function tFr(key) { return I18N.fr[key]; }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-ph"));
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang") === lang);
    });
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }

  function setLang(l) {
    if (!I18N[l]) return;
    lang = l;
    try { localStorage.setItem("ajm_lang", l); } catch (e) {}
    applyStatic();
  }

  function onChange(fn) { listeners.push(fn); }

  document.addEventListener("DOMContentLoaded", applyStatic);

  return {
    t: t,
    tFr: tFr,
    setLang: setLang,
    applyStatic: applyStatic,
    onChange: onChange,
    get lang() { return lang; }
  };
})();
