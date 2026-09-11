const SUPABASE_URL = "https://shcpoeetynboddtvyzwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2HlifU9OKRsH1EDYMabrSA_2VIGHQR5";
const CLAIMS_ENDPOINT = `${SUPABASE_URL}/rest/v1/reclamaciones`;
const SUBMISSION_COOLDOWN_KEY = "my-first-baby-last-claim";

const form = document.querySelector("#claimsForm");
const submitButton = form.querySelector(".submit-claim");
const formStatus = document.querySelector("#formStatus");
const dateOutput = document.querySelector("#claimDate");
const minorCheckbox = document.querySelector("#isMinor");
const representativeField = document.querySelector("#representativeField");
const representativeInput = representativeField.querySelector("input");
const confirmation = document.querySelector("#claimConfirmation");
const trackingCodeOutput = document.querySelector("#trackingCode");
const receiptDetails = document.querySelector("#receiptDetails");
const printButton = document.querySelector("#printClaim");

const currentDate = new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(new Date());
dateOutput.textContent = currentDate;

function createTrackingCode() {
  const date = new Date();
  const stamp = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("");
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 6).padStart(6, "0");
  return `MFB-${stamp}-${random}`;
}

function setMinorFields() {
  const isMinor = minorCheckbox.checked;
  representativeField.classList.toggle("is-hidden", !isMinor);
  representativeInput.required = isMinor;
  if (!isMinor) representativeInput.value = "";
}

function addReceiptDetail(label, value) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  wrapper.append(term, description);
  receiptDetails.appendChild(wrapper);
}

function showConfirmation(payload) {
  trackingCodeOutput.textContent = payload.tracking_code;
  receiptDetails.innerHTML = "";
  addReceiptDetail("Fecha", currentDate);
  addReceiptDetail("Consumidor", payload.full_name);
  addReceiptDetail("Documento", `${payload.document_type} ${payload.document_number}`);
  addReceiptDetail("Tipo", payload.claim_type);
  addReceiptDetail("Producto o servicio", payload.item_description);
  addReceiptDetail("Monto", `S/ ${Number(payload.amount).toFixed(2)}`);
  addReceiptDetail("Detalle", payload.detail);
  addReceiptDetail("Pedido", payload.request);
  form.classList.add("is-hidden");
  confirmation.classList.remove("is-hidden");
  confirmation.scrollIntoView({ behavior: "smooth", block: "start" });
}

minorCheckbox.addEventListener("change", setMinorFields);
printButton.addEventListener("click", () => window.print());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "";

  if (!form.reportValidity()) return;

  const lastSubmission = Number(localStorage.getItem(SUBMISSION_COOLDOWN_KEY) || 0);
  if (Date.now() - lastSubmission < 60000) {
    formStatus.textContent = "Espera un minuto antes de registrar otra reclamación.";
    return;
  }

  const data = new FormData(form);
  const payload = {
    tracking_code: createTrackingCode(),
    full_name: String(data.get("full_name")).trim().slice(0, 120),
    document_type: String(data.get("document_type")).slice(0, 30),
    document_number: String(data.get("document_number")).trim().slice(0, 20),
    phone: String(data.get("phone")).trim().slice(0, 20),
    email: String(data.get("email")).trim().slice(0, 120),
    address: String(data.get("address")).trim().slice(0, 180),
    is_minor: minorCheckbox.checked,
    representative_name: minorCheckbox.checked ? representativeInput.value.trim().slice(0, 120) : null,
    item_type: String(data.get("item_type")).slice(0, 20),
    item_description: String(data.get("item_description")).trim().slice(0, 500),
    amount: Number(data.get("amount")),
    claim_type: String(data.get("claim_type")).slice(0, 20),
    detail: String(data.get("detail")).trim().slice(0, 1500),
    request: String(data.get("request")).trim().slice(0, 1000),
  };

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  formStatus.textContent = "Estamos registrando tu reclamación.";

  try {
    const response = await fetch(CLAIMS_ENDPOINT, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    localStorage.setItem(SUBMISSION_COOLDOWN_KEY, String(Date.now()));
    showConfirmation(payload);
  } catch {
    formStatus.textContent = "No pudimos registrar tu reclamación. Inténtalo nuevamente o comunícate al +51 904 226 429.";
    submitButton.disabled = false;
    submitButton.textContent = "Enviar reclamación";
  }
});

setMinorFields();
