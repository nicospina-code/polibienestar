

// ─── CONFIGURACIÓN ───────────────────────────────────────────
const comentarios = [
  "@emmanuel24cruz",
  "@san_tiago9",
  "@s_mercure_",
  "@juan__esteban18",
  "@sebas.ruuiz",
  "@julian_slas",
  "@rimazmr",
  "@un_bohemiomas27",
  "@idanirestrepo",
  "@dae.sapra_",
  "@sti.ven_",
  "@_juan_broken_inside_",
  "@cristiano",
  "@amy_moreno17 ",
  "@art7hur__47 ,",
  "@nicolledaiam",
  "@juaanstiveen",
  "@vldmrdbshkn",
];

const CONFIG = {
  minDelay: 3000,
  maxDelay: 7000,
  charDelay: 80,
  waitAfterWrite: 1000,
  reintentos: 3, // intentos por comentario antes de saltar
};
// ─────────────────────────────────────────────────────────────

let totalEnviados = 0;
let indiceActual = 0;
let corriendo = true; // para detener: corriendo = false

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function escribirComentario(textarea, texto) {
  textarea.click();
  textarea.focus();
  await sleep(600);

  textarea.select();
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);
  await sleep(400);

  document.execCommand('insertText', false, texto);
  await sleep(300);

  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));

  await sleep(CONFIG.waitAfterWrite);
}

async function esperarBotonActivo(maxIntentos = 40) {
  for (let i = 0; i < maxIntentos; i++) {
    const botones = document.querySelectorAll('div[role="button"][tabindex="0"]');
    for (const boton of botones) {
      if (
        boton.textContent.trim() === 'Publicar' &&
        !boton.hasAttribute('aria-disabled')
      ) {
        return boton;
      }
    }
    await sleep(300);
  }
  return null;
}

async function publicarComentario(texto) {
  // Reintenta varias veces si falla
  for (let intento = 1; intento <= CONFIG.reintentos; intento++) {
    if (intento > 1) {
      console.log(`🔄 Reintento ${intento}/${CONFIG.reintentos}...`);
      await sleep(1000);
    }

    const textarea = document.querySelector('textarea[aria-label="Agrega un comentario..."]');
    if (!textarea) {
      console.error('❌ No se encontró el textarea');
      continue;
    }

    await escribirComentario(textarea, texto);

    const valorActual = textarea.value;
    if (!valorActual || valorActual.trim() === '') {
      console.error('❌ El textarea quedó vacío, reintentando...');
      continue;
    }

    const boton = await esperarBotonActivo();
    if (!boton) {
      console.error('❌ Botón no se activó, reintentando...');
      continue;
    }

    boton.click();
    totalEnviados++;
    console.log(`🚀 Publicado! Total enviados: ${totalEnviados}`);
    await sleep(1500);
    return true;
  }

  console.warn(`⚠️ No se pudo publicar tras ${CONFIG.reintentos} intentos, saltando...`);
  return false;
}

async function iniciarBot() {
  console.log('🤖 Bot infinito iniciado. Para detener escribe: corriendo = false');

  while (corriendo) {
    // Rota los comentarios en orden cíclico
    const texto = comentarios[Math.floor(Math.random() * comentarios.length)];
    indiceActual++;

    console.log(`\n📝 Comentario #${indiceActual} → "${texto}"`);

    await publicarComentario(texto);

    if (!corriendo) break;

    const espera = randomDelay(CONFIG.minDelay, CONFIG.maxDelay);
    console.log(`⏳ Esperando ${(espera / 1000).toFixed(1)}s...`);
    await sleep(espera);
  }

  console.log(`\n🛑 Bot detenido. Total enviados: ${totalEnviados}`);
}

// ─── EJECUTAR ────────────────────────────────────────────────
// Para detener en cualquier momento escribe en consola: corriendo = false
iniciarBot();