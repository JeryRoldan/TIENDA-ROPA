const products = {
  primer: {
    tag: "0 a 3 meses",
    title: "Set Primer Abrazo",
    image: "assets/bebe-0-3-meses.png",
    alt: "Set de ropa para bebe de 0 a 3 meses",
    description:
      "Un conjunto delicado para los primeros dias del bebe, pensado para vestirlo facil y mantenerlo comodo sin irritar su piel.",
    features: [
      "Tela: algodon suave y respirable, ideal para piel sensible.",
      "Incluye: body, gorrito y manoplas coordinadas.",
      "Acabados: costuras suaves y broches seguros para cambio rapido.",
      "Tallas: recien nacido, 0-1 mes, 1-3 meses y medidas especiales.",
    ],
  },
  nube: {
    tag: "3 a 6 meses",
    title: "Set Nube Suave",
    image: "assets/bebe-3-6-meses.png",
    alt: "Set de ropa para bebe de 3 a 6 meses",
    description:
      "Ropa practica para el movimiento diario del bebe, con piezas ligeras que se sienten suaves y mantienen buena forma despues del lavado.",
    features: [
      "Tela: algodon jersey con elasticidad ligera.",
      "Incluye: enterizo, pantalon y medias combinadas.",
      "Acabados: broches a presion, puno rib y cintura flexible.",
      "Detalle: bordado pequeno y delicado, sin contacto incomodo con la piel.",
    ],
  },
  pasitos: {
    tag: "6 a 12 meses",
    title: "Set Pasitos",
    image: "assets/bebe-6-12-meses.png",
    alt: "Set de ropa para bebe de 6 a 12 meses",
    description:
      "Conjunto abrigador para bebes que ya se mueven mas, con textura acogedora y piezas faciles de combinar para salidas o uso diario.",
    features: [
      "Tela: tejido de algodon con interior suave y calido.",
      "Incluye: polo manga larga, pantalon, cardigan y botitas.",
      "Acabados: elasticos suaves, botones seguros y costuras reforzadas.",
      "Tallas: 6-9 meses, 9-12 meses y opciones para mas meses.",
    ],
  },
};

const modal = document.querySelector("#productModal");
const modalImage = document.querySelector("#modalImage");
const modalTag = document.querySelector("#modalTag");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalFeatures = document.querySelector("#modalFeatures");
const closeButton = document.querySelector(".modal-close");
const detailButtons = document.querySelectorAll(".detail-button");

function openModal(productKey) {
  const product = products[productKey];

  if (!product) return;

  modalImage.src = product.image;
  modalImage.alt = product.alt;
  modalTag.textContent = product.tag;
  modalTitle.textContent = product.title;
  modalDescription.textContent = product.description;
  modalFeatures.innerHTML = "";

  product.features.forEach((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    modalFeatures.appendChild(item);
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  closeButton.focus();
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

detailButtons.forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.product));
});

closeButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});
