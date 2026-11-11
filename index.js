// =====================================================
//  Configuration EmailJS
//  (si vous créez un nouveau service, changez seulement SERVICE_ID)
// =====================================================
const EMAILJS_PUBLIC_KEY = "tj78crzPN0_rmmjFS";
const EMAILJS_SERVICE_ID = "service_bsoe5lw";
const EMAILJS_TEMPLATE_ID = "template_y1s1oe6";

const SECTIONS = ["about", "services", "Réalisation", "fileservice", "CGV"];

// =====================================================
//  Navigation entre les sections
// =====================================================
function toggleSection(id) {
  SECTIONS.forEach(function (sid) {
    const el = document.getElementById(sid);
    if (el) el.style.display = sid === id ? "block" : "none";
  });
  const hero = document.getElementById("hero");
  if (hero) hero.style.display = "none";
}

function showHome() {
  SECTIONS.forEach(function (sid) {
    const el = document.getElementById(sid);
    if (el) el.style.display = "none";
  });
  const hero = document.getElementById("hero");
  if (hero) hero.style.display = "block";
}

// =====================================================
//  Pop-ups
// =====================================================
function showEl(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function hideEl(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function openPopup() { showEl("popupForm"); }
function closePopup() { hideEl("popupForm"); hideEl("confirmationPopup"); }

function openPopupMS() { showEl("textPopupMS"); }
function closePopupMS() { hideEl("textPopupMS"); }

function openPopupGO() { showEl("textPopupGO"); }
function closePopupGO() { hideEl("textPopupGO"); }

// =====================================================
//  Messages d'erreur EmailJS compréhensibles
// =====================================================
function explainEmailJsError(err) {
  const status = err && err.status;
  const text = (err && (err.text || err.message)) || String(err || "");

  if (/invalid grant|reconnect your gmail/i.test(text)) {
    return "La connexion Gmail du service EmailJS a expiré (le propriétaire du site doit la reconnecter).";
  }
  if (/insufficient authentication scopes/i.test(text)) {
    return "Le compte Gmail n'a pas autorisé EmailJS à envoyer des e-mails.";
  }
  if (/recipients address is empty/i.test(text)) {
    return "Le modèle EmailJS n'a pas d'adresse de destination (champ « To Email »).";
  }
  if (/sdk version is unsupported/i.test(text)) {
    return "La version d'EmailJS chargée par la page est trop ancienne (mettre à jour la balise <script> dans index.html).";
  }
  if (/limit|quota/i.test(text) || status === 426 || status === 429) {
    return "La limite d'envoi EmailJS est atteinte. Réessayez plus tard.";
  }
  if (status === 0 || /network|failed to fetch/i.test(text)) {
    return "Problème de connexion Internet. Vérifiez votre connexion et réessayez.";
  }
  return text || "Erreur inconnue.";
}

// =====================================================
//  Prix estimatif + formulaire
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  const requestType = document.getElementById("requestType");
  const rentBench = document.getElementById("rentBench");
  const gestionSection = document.getElementById("gestionOuverteOptions");
  const estimatedPriceEl = document.getElementById("estimatedPrice");
  const form = document.getElementById("requestForm");

  if (!form || !requestType) return;

  function computePrice() {
    const rt = requestType.value;
    const rent = rentBench && rentBench.checked;

    if (rt === "gestionOuverte") return 300 + (rent ? 250 : 0);
    if (rt === "200") return 200;
    if (rt === "150") return 150;
    return 0;
  }

  function updatePrice() {
    const rt = requestType.value;
    if (gestionSection) {
      gestionSection.style.display = rt === "gestionOuverte" ? "block" : "none";
    }
    const price = computePrice();
    if (estimatedPriceEl) {
      estimatedPriceEl.textContent = "Prix estimatif : " + (price > 0 ? price + "€" : "--");
    }
  }

  requestType.addEventListener("change", updatePrice);
  if (rentBench) rentBench.addEventListener("change", updatePrice);
  updatePrice();

  // --- EmailJS ---
  if (typeof emailjs === "undefined") {
    console.error("EmailJS n'est pas chargé : vérifiez la balise <script> dans index.html.");
  } else {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  const submitLabel = submitBtn ? (submitBtn.textContent || submitBtn.value) : "";

  function setSending(isSending) {
    if (!submitBtn) return;
    submitBtn.disabled = isSending;
    const label = isSending ? "Envoi en cours…" : submitLabel;
    if (submitBtn.tagName === "INPUT") submitBtn.value = label;
    else submitBtn.textContent = label;
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (typeof emailjs === "undefined") {
      alert("Erreur lors de l'envoi du formulaire : le service d'envoi n'a pas pu être chargé. Rechargez la page.");
      return;
    }

    const isGestion = requestType.value === "gestionOuverte";
    const price = computePrice();

    const data = {
      firstname: val("firstname"),
      lastname: val("lastname"),
      email: val("email"),
      reply_to: val("email"),
      brand: val("brand"),
      model: val("model"),
      requestType: requestType.selectedOptions[0] ? requestType.selectedOptions[0].text : "",
      description: val("description"),
      gestionBrand: isGestion ? val("gestionBrand") : "",
      rentBench: isGestion && rentBench && rentBench.checked ? "Oui" : "Non",
      estimatedPrice: price > 0 ? price + "€" : "--"
    };

    setSending(true);

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data, { publicKey: EMAILJS_PUBLIC_KEY })
      .then(function () {
        form.reset();
        updatePrice();
        closePopup();
        showEl("confirmationPopup");
      })
      .catch(function (err) {
        console.error("Erreur EmailJS :", err);
        alert("Erreur lors de l'envoi du formulaire :\n" + explainEmailJsError(err));
      })
      .finally(function () {
        setSending(false);
      });
  });
});
