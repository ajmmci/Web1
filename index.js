// Sections
function toggleSection(id) {
  const sections = ["about","services","Réalisation","fileservice","CGV"];
  const hero = document.getElementById("hero");
  sections.forEach(sid => document.getElementById(sid).style.display = (sid === id) ? "block" : "none");
  hero.style.display = "none";
}

function showHome() {
  const sections = ["about","services","Réalisation","fileservice","CGV"];
  sections.forEach(sid => document.getElementById(sid).style.display = "none");
  document.getElementById("hero").style.display = "block";
}

// Pop-up
function openPopup(){document.getElementById("popupForm").style.display="flex";}
function closePopup(){document.getElementById("popupForm").style.display="none";document.getElementById("confirmationPopup").style.display="none";}

// Pop-up MS
function openPopupMS() {
   document.getElementById("textPopupMS").style.display = "flex";
}

function closePopupMS() {
    document.getElementById("textPopupMS").style.display = "none";
}

// Pop-up GO
function openPopupGO() {
   document.getElementById("textPopupGO").style.display = "flex";
}

function closePopupGO() {
    document.getElementById("textPopupGO").style.display = "none";
}

// Prix et formulaire
document.addEventListener("DOMContentLoaded", function() {
  const requestType = document.getElementById("requestType");
  const rentBench = document.getElementById("rentBench");
  const gestionSection = document.getElementById("gestionOuverteOptions");
  const estimatedPriceEl = document.getElementById("estimatedPrice");
  const form = document.getElementById("requestForm");

  function updatePrice() {
    const rt = requestType.value;
    const rent = rentBench.checked;

    if (!rt) {
      gestionSection.style.display = "none";
      estimatedPriceEl.textContent = "Prix estimatif : --";
      return;
    }

    let basePrice = 0;
    if (rt === "gestionOuverte") {
      basePrice = 300;
      gestionSection.style.display = "block";
      if (rent) basePrice += 250;
    } else if (rt === "300") basePrice = 300;
    else if (rt === "150") basePrice = 150;
    else basePrice = 0;

    estimatedPriceEl.textContent = `Prix estimatif : ${basePrice > 0 ? basePrice + "€" : "--"}`;
  }

  requestType.addEventListener("change", updatePrice);
  rentBench.addEventListener("change", updatePrice);
  updatePrice();

  // Formulaire
(function(){ emailjs.init("tj78crzPN0_rmmjFS"); })();
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
   const data = {
  firstname: document.getElementById("firstname").value,
  lastname: document.getElementById("lastname").value,
  email: document.getElementById("email").value,
  brand: document.getElementById("brand").value,
  model: document.getElementById("model").value,
  requestType: requestType.selectedOptions[0].text,
  description: document.getElementById("description").value,
  gestionBrand: document.getElementById("gestionBrand") ? document.getElementById("gestionBrand").value : "",
  rentBench: document.getElementById("rentBench") ? document.getElementById("rentBench").checked : false
};


    emailjs.send("service_bsoe5lw","template_y1s1oe6", data)
      .then(() => {
        closePopup();
        document.getElementById("confirmationPopup").style.display = "flex";
      })
      .catch(() => { alert("Erreur lors de l'envoi du formulaire."); });
  });

 // Slideréalisation
/* ===== SLIDER REALISATIONS ===== */

let slideIndex = 0;

window.showSlide = function (index) {
  const slidesContainer = document.querySelector("#Réalisation .slides");
  const slides = document.querySelectorAll("#Réalisation .slide");

  if (!slidesContainer || slides.length === 0) return;

  if (index >= slides.length) slideIndex = 0;
  if (index < 0) slideIndex = slides.length - 1;

  slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
};

window.nextSlide = function () {
  slideIndex++;
  window.showSlide(slideIndex);
};

window.prevSlide = function () {
  slideIndex--;
  window.showSlide(slideIndex);
};

});




