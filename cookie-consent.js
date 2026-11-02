(() => {
  'use strict';

  const measurementId = 'G-4BKCMNJFV2';
  const storageKey = 'mfb-cookie-consent-v1';
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const disableKey = `ga-disable-${measurementId}`;
  let analyticsStarted = false;
  let lastFocus = null;

  function readConsent() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (value && value.version === 1 && typeof value.analytics === 'boolean'
          && Number.isFinite(value.savedAt) && value.savedAt <= Date.now()
          && Date.now() - value.savedAt < consentLifetime) return value;
    } catch (_) {
      // Browsers may block storage. In that case, ask again on the next visit.
    }
    return null;
  }

  let consent = readConsent();
  window[disableKey] = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function clearAnalyticsCookies() {
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i += 1) {
      domains.push(`; Domain=${parts.slice(i).join('.')}`);
      domains.push(`; Domain=.${parts.slice(i).join('.')}`);
    }
    const paths = new Set(['/']);
    const segments = location.pathname.split('/').filter(Boolean);
    let path = '';
    for (const segment of segments) {
      path += `/${segment}`;
      paths.add(path);
      paths.add(`${path}/`);
    }
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
      for (const domain of domains) {
        for (const cookiePath of paths) {
          document.cookie = `${name}=; Max-Age=0; Path=${cookiePath}${domain}; SameSite=Lax`;
        }
      }
    }
  }

  function cleanUrl(value) {
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`;
    } catch (_) {
      return '';
    }
  }

  function enableAnalytics() {
    window[disableKey] = false;
    if (analyticsStarted) return;
    analyticsStarted = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_location: cleanUrl(location.href),
      page_referrer: cleanUrl(document.referrer),
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.id = 'mfb-google-analytics';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onerror = () => {
      script.remove();
      analyticsStarted = false;
    };
    document.head.append(script);
  }

  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-labelledby', 'cookieBannerTitle');
  banner.innerHTML = `
    <div class="cookie-banner-copy">
      <h2 id="cookieBannerTitle">Tú eliges tus cookies</h2>
      <p>Usamos almacenamiento necesario para las funciones de la tienda. Con tu permiso,
      Google Analytics nos ayuda a conocer las visitas y mejorar la página. Puedes rechazar
      las estadísticas y seguir comprando.</p>
    </div>
    <div class="cookie-actions">
      <button class="cookie-button" type="button" data-cookie-accept>Aceptar</button>
      <button class="cookie-button" type="button" data-cookie-reject>Rechazar</button>
      <button class="cookie-button cookie-button-outline" type="button" data-cookie-configure>Configurar</button>
    </div>`;
  banner.hidden = Boolean(consent);

  const dialog = document.createElement('dialog');
  dialog.className = 'cookie-dialog';
  dialog.setAttribute('aria-labelledby', 'cookieDialogTitle');
  dialog.setAttribute('aria-describedby', 'cookieDialogDescription');
  dialog.innerHTML = `
    <div class="cookie-dialog-heading">
      <h2 id="cookieDialogTitle">Preferencias de cookies</h2>
      <button class="cookie-close" type="button" aria-label="Cerrar preferencias">&times;</button>
    </div>
    <p id="cookieDialogDescription">Elige qué permites en este navegador.
    Puedes cambiar tu decisión desde «Configurar cookies» al pie de la página.</p>
    <div class="cookie-category">
      <div><h3>Necesarias</h3><p>Permiten funciones de la tienda y recordar tu elección de cookies.
      No dependen del permiso para estadísticas.</p></div>
      <span class="cookie-required">Siempre activas</span>
    </div>
    <div class="cookie-category">
      <div><h3><label for="cookieAnalytics">Estadísticas</label></h3>
      <p>Google Analytics mide visitas y navegación. Solo lo cargamos si aceptas esta opción.
      Sus cookies pueden incluir <code>_ga</code> y <code>_ga_4BKCMNJFV2</code>.</p></div>
      <input id="cookieAnalytics" type="checkbox" />
    </div>
    <p class="cookie-details">Guardamos esta elección durante 180 días en este navegador.
    No activamos cookies de publicidad con esta configuración.
    <a href="https://policies.google.com/technologies/partner-sites?hl=es" target="_blank" rel="noopener noreferrer">Cómo utiliza Google la información</a>.</p>
    <div class="cookie-actions">
      <button class="cookie-button" type="button" data-cookie-save>Guardar preferencias</button>
      <button class="cookie-button cookie-button-outline" type="button" data-cookie-reject>Rechazar estadísticas</button>
    </div>`;

  const status = document.createElement('p');
  status.className = 'cookie-status';
  status.setAttribute('role', 'status');
  document.body.append(banner, dialog, status);
  const checkbox = dialog.querySelector('#cookieAnalytics');
  const settingsButtons = document.querySelectorAll('[data-cookie-settings]');
  settingsButtons.forEach(button => { button.hidden = false; });

  function openSettings() {
    lastFocus = document.activeElement;
    checkbox.checked = consent?.analytics === true;
    dialog.showModal();
  }

  function closeSettings() {
    dialog.close();
  }

  dialog.addEventListener('close', () => {
    if (lastFocus && !lastFocus.closest('[hidden]')) lastFocus.focus({ preventScroll: true });
    else settingsButtons[0]?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, input, a[href]')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function saveConsent(analytics) {
    const wasRunning = analyticsStarted;
    consent = { version: 1, analytics, savedAt: Date.now() };
    let saved = false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(consent));
      saved = true;
    } catch (_) {
      // Apply the preference for this page even if persistence is unavailable.
    }
    if (analytics) enableAnalytics();
    else {
      window[disableKey] = true;
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
    }
    banner.hidden = true;
    if (dialog.open) closeSettings();
    else if (banner.contains(document.activeElement)) settingsButtons[0]?.focus({ preventScroll: true });
    status.textContent = saved ? 'Preferencias de cookies guardadas.'
      : 'Tu elección se aplica en esta página. El navegador no permite guardarla para próximas visitas.';
    // A fresh page removes the already loaded Google library after withdrawal.
    if (!analytics && wasRunning && saved) location.reload();
  }

  banner.querySelector('[data-cookie-accept]').addEventListener('click', () => saveConsent(true));
  document.querySelectorAll('[data-cookie-reject]').forEach(button => {
    button.addEventListener('click', () => saveConsent(false));
  });
  banner.querySelector('[data-cookie-configure]').addEventListener('click', openSettings);
  settingsButtons.forEach(button => button.addEventListener('click', openSettings));
  dialog.querySelector('.cookie-close').addEventListener('click', closeSettings);
  dialog.querySelector('[data-cookie-save]').addEventListener('click', () => saveConsent(checkbox.checked));

  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      const wasRunning = analyticsStarted;
      consent = readConsent();
      banner.hidden = Boolean(consent);
      checkbox.checked = consent?.analytics === true;
      if (consent?.analytics) enableAnalytics();
      else {
        window[disableKey] = true;
        clearAnalyticsCookies();
        if (wasRunning) location.reload();
      }
    }
  });

  if (consent?.analytics) enableAnalytics();
  else clearAnalyticsCookies();
})();
