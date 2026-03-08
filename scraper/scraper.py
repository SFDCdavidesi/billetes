"""
Script de scraping para banknotescollection.com
Extrae toda la información de billetes de países que empiezan por una letra dada,
o de un país concreto si se pasa su nombre.
Guarda catálogo en JSON con URLs de imágenes originales.

USO: python scraper.py B              # todos los países con letra B
     python scraper.py France          # sólo Francia
     python scraper.py "Costa Rica"    # país con espacios
     python scraper.py B --workers 15
"""

import argparse
import asyncio
import json
import re
import logging
import time
from pathlib import Path
from urllib.parse import urljoin

import aiohttp
from bs4 import BeautifulSoup

# ─── Configuración ──────────────────────────────────────────────
BASE_URL = "https://banknotescollection.com"
LIST_URL = f"{BASE_URL}/list"
OUTPUT_DIR = Path(__file__).parent / "data"

# Concurrencia: número de peticiones HTTP simultáneas
DEFAULT_WORKERS = 10

# Delay mínimo entre peticiones (por worker) para no saturar
DELAY_PER_REQUEST = 0.3  # segundos

REQUEST_TIMEOUT = 30  # segundos

# Reintentos: si una petición falla, reintenta con backoff exponencial
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2.0  # segundos (se multiplica x2 en cada reintento)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-ES,es;q=0.9",
}

# ─── Logging ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


# ─── Fracciones Unicode ─────────────────────────────────────────
FRAC_MAP = {
    "\u00BD": 0.5, "\u00BC": 0.25, "\u00BE": 0.75,
    "\u2153": 1/3, "\u2154": 2/3, "\u2155": 0.2,
    "\u215B": 0.125, "\u215C": 0.375, "\u215D": 0.625, "\u215E": 0.875,
}
FRAC_CHARS = "".join(FRAC_MAP.keys())


# ─── Funciones auxiliares ───────────────────────────────────────

def parse_denomination(title: str, country: str) -> float | None:
    """Extrae el valor facial (denominación) del título del billete.
    
    Maneja: fracciones unicode (½), fracciones con / (1/2), miles con punto (1.000),
    miles con coma (1,000), decimales con coma (0,50), números pegados a texto (1Jiao).
    Devuelve None si no se puede parsear (entrada basura).
    """
    if not title or not country:
        return None

    # Normalizar espacios y saltos de línea
    t = re.sub(r"[\r\n\t]+", " ", title)
    t = re.sub(r"\s+", " ", t).strip()

    # Quitar el país del inicio
    if t.startswith(country):
        t = t[len(country):]

    # Quitar separadores iniciales (espacios, pipes)
    t = re.sub(r"^[\s|]+", "", t)
    if not t:
        return None

    # Caso 1: fracción unicode sola al inicio: "½ Real..."
    frac_re = re.compile(f"^([{re.escape(FRAC_CHARS)}])")
    fm = frac_re.match(t)
    if fm and (len(t) == 1 or t[1] == " "):
        return FRAC_MAP.get(fm.group(1))

    # Caso 2: fracción con /: "1/2 Real..."
    sf = re.match(r"^(\d+)/(\d+)(?:\s|$)", t)
    if sf:
        denom = int(sf.group(2))
        if denom != 0:
            return int(sf.group(1)) / denom
        return None

    # Caso 3: número + fracción opcional + fracción / opcional
    num_re = re.compile(
        rf"^(\d[\d.,]*?)([{re.escape(FRAC_CHARS)}])?(?:\s+(\d+)/(\d+))?(?:\s|[A-Za-z]|$)"
    )
    m = num_re.match(t)
    if not m:
        return None

    raw_num = m.group(1)

    # Miles con puntos: 1.000, 10.000, 100.000
    if re.match(r"^\d{1,3}(\.\d{3})+$", raw_num):
        value = float(raw_num.replace(".", ""))
    # Miles con comas: 1,000, 10,000
    elif re.match(r"^\d{1,3}(,\d{3})+$", raw_num):
        value = float(raw_num.replace(",", ""))
    # Número normal (coma como decimal)
    else:
        value = float(raw_num.replace(",", "."))

    if value != value:  # NaN check
        return None

    # Sumar fracción unicode: "2½" → 2.5
    if m.group(2):
        value += FRAC_MAP.get(m.group(2), 0)

    # Sumar fracción /: "2 1/2" → 2.5
    if m.group(3) and m.group(4):
        denom = int(m.group(4))
        if denom != 0:
            value += int(m.group(3)) / denom

    return value if value > 0 else None


def is_garbage(title: str, country: str) -> bool:
    """Detecta si una entrada es basura (cabecera de sección, test, etc.)."""
    if not title or not title.strip():
        return True
    if not country or country.startswith("Continente"):
        return True
    # Cabeceras de sección: contienen PCOUNTRY - \n
    if re.search(r"\sP[A-Z].*\s*-\s", title):
        return True
    # Datos de test
    if re.search(r"test", title, re.IGNORECASE):
        return True
    # Sin denominación parseable
    return parse_denomination(title, country) is None


def get_soup(url: str) -> BeautifulSoup | None:
    """Realiza GET síncrono (para listados iniciales) y devuelve BeautifulSoup."""
    import requests as _requests
    try:
        resp = _requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except _requests.RequestException as e:
        log.error("Error al obtener %s: %s", url, e)
        return None


async def async_get_soup(session: aiohttp.ClientSession, url: str,
                         semaphore: asyncio.Semaphore) -> BeautifulSoup | None:
    """Realiza GET asíncrono con semáforo de concurrencia y reintentos."""
    for attempt in range(1, MAX_RETRIES + 1):
        async with semaphore:
            await asyncio.sleep(DELAY_PER_REQUEST)
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        return BeautifulSoup(html, "html.parser")
                    # Error HTTP recuperable (429, 5xx) → reintentar
                    if resp.status in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES:
                        delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                        log.warning("HTTP %d en %s — reintento %d/%d en %.1fs",
                                    resp.status, url, attempt, MAX_RETRIES, delay)
                        await asyncio.sleep(delay)
                        continue
                    # Error HTTP no recuperable o último intento
                    log.error("HTTP %d al obtener %s (intento %d/%d)",
                              resp.status, url, attempt, MAX_RETRIES)
                    return None
            except (asyncio.TimeoutError, aiohttp.ClientError) as e:
                if attempt < MAX_RETRIES:
                    delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                    log.warning("Error en %s: %s — reintento %d/%d en %.1fs",
                                url, e, attempt, MAX_RETRIES, delay)
                    await asyncio.sleep(delay)
                    continue
                log.error("Error al obtener %s tras %d intentos: %s",
                          url, MAX_RETRIES, e)
                return None
            except Exception as e:
                log.error("Error inesperado al obtener %s: %s", url, e)
                return None
    return None


# ─── Paso 1: Obtener países que empiezan por una letra ──────────

def _parse_country_list(soup: BeautifulSoup) -> list[dict]:
    """Extrae todos los países del listado general de banknotescollection."""
    countries = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if href.startswith("./list/"):
            slug = href.replace("./list/", "")
        elif href.startswith("/list/"):
            slug = href.replace("/list/", "")
        elif href.startswith(f"{LIST_URL}/"):
            slug = href.replace(f"{LIST_URL}/", "")
        else:
            continue

        name = link.get_text(strip=True)
        if "/" in slug or not name or not slug:
            continue
        if slug.lower() in ("blog", "cookies.php"):
            continue

        full_url = f"{LIST_URL}/{slug}"
        countries.append({"name": name, "slug": slug, "url": full_url})
    return countries


def get_countries_starting_with(letter: str) -> list[dict]:
    """Devuelve lista de {name, url} de países que empiezan por la letra dada."""
    letter = letter.upper()
    log.info("Obteniendo lista de países con letra '%s'...", letter)
    soup = get_soup(LIST_URL)
    if not soup:
        return []

    countries = [c for c in _parse_country_list(soup) if c["name"].upper().startswith(letter)]

    log.info("Encontrados %d países con letra %s: %s",
             len(countries), letter, ", ".join(c["name"] for c in countries))
    return countries


def get_country_by_name(country_name: str) -> dict | None:
    """Busca un país concreto por nombre (case-insensitive) en el listado."""
    log.info("Buscando país '%s'...", country_name)
    soup = get_soup(LIST_URL)
    if not soup:
        return None

    all_countries = _parse_country_list(soup)
    target = country_name.strip().lower()

    # Búsqueda exacta
    for c in all_countries:
        if c["name"].lower() == target:
            log.info("País encontrado: %s → %s", c["name"], c["url"])
            return c

    # Búsqueda parcial (el nombre introducido está contenido en el nombre real)
    matches = [c for c in all_countries if target in c["name"].lower()]
    if len(matches) == 1:
        log.info("País encontrado (coincidencia parcial): %s → %s", matches[0]["name"], matches[0]["url"])
        return matches[0]
    if len(matches) > 1:
        log.error("Múltiples coincidencias para '%s': %s",
                  country_name, ", ".join(m["name"] for m in matches))
        log.error("Especifica el nombre completo del país.")
        return None

    log.error("No se encontró el país '%s'.", country_name)
    log.info("Países disponibles: %s", ", ".join(c["name"] for c in all_countries))
    return None


# ─── Paso 2: Obtener billetes de un país ────────────────────────

def get_banknotes_for_country(country: dict) -> list[dict]:
    """Devuelve lista de {pick, title, url} para un país."""
    log.info("Obteniendo catálogo de %s...", country["name"])
    soup = get_soup(country["url"])
    if not soup:
        return []

    banknotes = []
    seen_picks = set()
    slug = country["slug"]

    for link in soup.find_all("a", href=True):
        href = link["href"]
        # Normalizar: enlaces pueden ser relativos o absolutos
        if href.startswith(f"./list/{slug}/"):
            pick_part = href.replace(f"./list/{slug}/", "")
        elif href.startswith(f"/list/{slug}/"):
            pick_part = href.replace(f"/list/{slug}/", "")
        elif href.startswith(f"{country['url']}/"):
            pick_part = href.replace(f"{country['url']}/", "")
        else:
            continue

        if "/" in pick_part or not pick_part:
            continue
        if pick_part.lower() in ("blog", "cookies.php"):
            continue
        if pick_part in seen_picks:
            continue

        seen_picks.add(pick_part)
        text = link.get_text(strip=True)
        full_url = f"{country['url']}/{pick_part}"
        banknotes.append({
            "pick": pick_part,
            "link_text": text,
            "url": full_url,
        })

    log.info("  → %d billetes encontrados en %s", len(banknotes), country["name"])
    return banknotes


# ─── Paso 3: Extraer detalle de un billete ──────────────────────

def parse_banknote_detail(url: str, country_name: str, country_slug: str,
                          soup: BeautifulSoup = None) -> dict | None:
    """Parsea la página de detalle de un billete y devuelve un dict.
    Si soup no se pasa, hace GET síncrono (retrocompatibilidad).
    """
    if soup is None:
        soup = get_soup(url)
    if not soup:
        return None

    data = {
        "url": url,
        "country": country_name,
        "country_slug": country_slug,
        "continent": None,
        "pick_number": None,
        "denomination": None,
        "date": None,
        "issuer": None,
        "printer": None,
        "obverse_info": None,
        "reverse_info": None,
        "title": None,
        "notes": None,
        "images": [],
        "variants": [],
    }

    # Título principal: "Afghanistan 5 Afghanis 1305 P7"
    h1 = soup.find("h1")
    if h1:
        data["title"] = h1.get_text(strip=True)
        title_text = data["title"]

        # Extraer pick number del título
        parts = title_text.split()
        for p in parts:
            if re.match(r'^P\d', p, re.IGNORECASE):
                data["pick_number"] = p
                break

        # Extraer valor facial (denominación) del título
        data["denomination"] = parse_denomination(title_text, country_name)

    # Buscar campos estructurados en el texto de la página
    page_text = soup.get_text()

    # Extraer campos clave-valor de la ficha técnica
    field_patterns = {
        "country": r'País:\s*(.+?)(?:Continente|Referencia|$)',
        "continent": r'Continente:\s*(.+?)(?:Referencia|País|$)',
        "pick_number": r'Referencia:\s*(.+?)(?:Fecha|País|$)',
        "date": r'Fecha:\s*(.+?)(?:Emisor|País|$)',
        "issuer": r'Emisor:\s*(.+?)(?:Imprenta|País|$)',
        "printer": r'Imprenta:\s*(.+?)(?:Informacion|País|$)',
    }

    for field, pattern in field_patterns.items():
        match = re.search(pattern, page_text, re.IGNORECASE)
        if match:
            val = match.group(1).strip()
            if val:
                data[field] = val

    # Info anverso/reverso
    obverse_match = re.search(
        r'Informacion del anverso:\s*(.+?)(?:Informacion del reverso|Notas|$)',
        page_text, re.IGNORECASE | re.DOTALL,
    )
    if obverse_match:
        data["obverse_info"] = obverse_match.group(1).strip()[:500]

    reverse_match = re.search(
        r'Informacion del reverso:\s*(.+?)(?:Notas|$)',
        page_text, re.IGNORECASE | re.DOTALL,
    )
    if reverse_match:
        data["reverse_info"] = reverse_match.group(1).strip()[:500]

    # Imágenes principales del billete
    images_found = set()
    for img in soup.find_all("img", src=True):
        src = img["src"]
        if "images/billetes/" in src and "nofoto" not in src:
            full_url = urljoin(BASE_URL, src)
            if full_url not in images_found:
                images_found.add(full_url)
                data["images"].append(full_url)

    # Variantes (h2 con subvariantes como 7a, 7b, etc.)
    for h2 in soup.find_all("h2"):
        variant_text = h2.get_text(strip=True)
        if not variant_text or not re.match(r'^\d+\w*$', variant_text):
            continue
        variant = {"variant_id": variant_text, "notes": None, "images": []}

        # Buscar el siguiente elemento con notas
        sibling = h2.find_next_sibling()
        while sibling and sibling.name != "h2":
            text = sibling.get_text(strip=True)
            if text.startswith("Notas:"):
                variant["notes"] = text.replace("Notas:", "").strip()
            # Imágenes de la variante
            for img in sibling.find_all("img", src=True) if sibling.name else []:
                src = img["src"]
                if "images/billetes/" in src and "nofoto" not in src:
                    full_url = urljoin(BASE_URL, src)
                    if full_url not in images_found:
                        images_found.add(full_url)
                        variant["images"].append(full_url)
            sibling = sibling.find_next_sibling()

        data["variants"].append(variant)

    return data


# ─── Pipeline principal (asíncrono) ─────────────────────────────

async def process_banknote(session, semaphore, bn_link, country, stats, progress):
    """Procesa un billete individual de forma asíncrona."""
    soup = await async_get_soup(session, bn_link["url"], semaphore)
    if not soup:
        stats["errors"] += 1
        progress["done"] += 1
        return None

    detail = parse_banknote_detail(
        bn_link["url"], country["name"], country["slug"], soup=soup
    )
    if not detail:
        stats["errors"] += 1
        progress["done"] += 1
        return None

    if is_garbage(detail.get("title"), detail.get("country")):
        stats["errors"] += 1
        progress["done"] += 1
        return None

    img_count = len(detail.get("images", []))
    for v in detail.get("variants", []):
        img_count += len(v.get("images", []))
    stats["images"] += img_count
    stats["banknotes"] += 1
    progress["done"] += 1

    if progress["done"] % 20 == 0 or progress["done"] == progress["total"]:
        log.info("  Progreso: %d/%d billetes procesados (%d%%)",
                 progress["done"], progress["total"],
                 int(progress["done"] / progress["total"] * 100))

    return detail


async def async_main(letter: str, max_workers: int):
    """Pipeline principal asíncrono — procesa todos los países de una letra."""
    start_time = time.monotonic()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    log.info("=" * 60)
    log.info("SCRAPER DE BANKNOTESCOLLECTION.COM (async, %d workers)", max_workers)
    log.info("Países: letra %s", letter)
    log.info("Directorio de salida: %s", OUTPUT_DIR.resolve())
    log.info("=" * 60)

    countries = get_countries_starting_with(letter)
    if not countries:
        log.error("No se encontraron países con letra %s. Abortando.", letter)
        return

    json_file = OUTPUT_DIR / f"billetes_{letter.lower()}.json"
    all_banknotes = []
    stats = {"countries": 0, "banknotes": 0, "images": 0, "errors": 0}

    await _process_countries(countries, json_file, letter, stats, max_workers)

    _log_summary(stats, json_file, start_time)


async def async_main_country(country_name: str, max_workers: int):
    """Pipeline principal asíncrono — procesa un solo país por nombre."""
    start_time = time.monotonic()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    log.info("=" * 60)
    log.info("SCRAPER DE BANKNOTESCOLLECTION.COM (async, %d workers)", max_workers)
    log.info("País: %s", country_name)
    log.info("Directorio de salida: %s", OUTPUT_DIR.resolve())
    log.info("=" * 60)

    country = get_country_by_name(country_name)
    if not country:
        log.error("No se pudo encontrar el país '%s'. Abortando.", country_name)
        return

    slug = country["slug"]
    json_file = OUTPUT_DIR / f"billetes_{slug.lower()}.json"
    label = country["name"]
    stats = {"countries": 0, "banknotes": 0, "images": 0, "errors": 0}

    await _process_countries([country], json_file, label, stats, max_workers)

    _log_summary(stats, json_file, start_time)


async def _process_countries(countries: list[dict], json_file: Path, label: str,
                             stats: dict, max_workers: int):
    """Procesa una lista de países, guardando resultados en json_file."""
    all_banknotes = []
    semaphore = asyncio.Semaphore(max_workers)

    connector = aiohttp.TCPConnector(limit=max_workers, limit_per_host=max_workers)
    async with aiohttp.ClientSession(headers=HEADERS, connector=connector) as session:

        total_countries = len(countries)
        for ci, country in enumerate(countries, 1):
            log.info("")
            log.info("━" * 50)
            log.info("PAÍS [%d/%d]: %s", ci, total_countries, country["name"])
            log.info("━" * 50)

            banknote_links = get_banknotes_for_country(country)
            if not banknote_links:
                stats["countries"] += 1
                continue

            progress = {"done": 0, "total": len(banknote_links)}
            log.info("  Lanzando %d peticiones con %d workers...",
                     len(banknote_links), max_workers)

            tasks = [
                process_banknote(session, semaphore, bn_link, country, stats, progress)
                for bn_link in banknote_links
            ]
            results = await asyncio.gather(*tasks)

            country_banknotes = [r for r in results if r is not None]
            all_banknotes.extend(country_banknotes)

            stats["countries"] += 1

            _save_json(json_file, label, stats, all_banknotes)
            log.info("")
            log.info("  ── Resumen parcial ──")
            log.info("  Países: %d/%d | Billetes: %d | Imágenes: %d | Errores: %d",
                     stats["countries"], total_countries, stats["banknotes"],
                     stats["images"], stats["errors"])
            log.info("  ✓ JSON guardado en: %s", json_file.name)


def _log_summary(stats: dict, json_file: Path, start_time: float):
    """Imprime el resumen final."""
    log.info("")
    log.info("=" * 60)
    log.info("RESUMEN FINAL")
    log.info("  Países procesados: %d", stats["countries"])
    log.info("  Billetes guardados: %d", stats["banknotes"])
    log.info("  URLs de imágenes: %d", stats["images"])
    log.info("  Errores: %d", stats["errors"])
    log.info("  JSON en: %s", json_file.resolve())
    elapsed = time.monotonic() - start_time
    minutes, seconds = divmod(int(elapsed), 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        log.info("  Tiempo total: %dh %dm %ds", hours, minutes, seconds)
    elif minutes:
        log.info("  Tiempo total: %dm %ds", minutes, seconds)
    else:
        log.info("  Tiempo total: %ds", seconds)
    log.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Scraper de banknotescollection.com — descarga billetes por letra o por país."
    )
    parser.add_argument(
        "target",
        help="Letra (A-Z) para descargar todos los países de esa letra, "
             "o nombre de país para descargar sólo ese (ej: France, 'Costa Rica')",
    )
    parser.add_argument(
        "--workers", "-w",
        type=int,
        default=DEFAULT_WORKERS,
        help=f"Número de peticiones simultáneas (default: {DEFAULT_WORKERS})",
    )
    args = parser.parse_args()
    target = args.target.strip()

    if len(target) == 1 and target.isalpha():
        # Modo letra: descargar todos los países que empiezan por esa letra
        asyncio.run(async_main(target.upper(), args.workers))
    elif len(target) > 1:
        # Modo país: descargar un país concreto
        asyncio.run(async_main_country(target, args.workers))
    else:
        log.error("Debes proporcionar una letra (A-Z) o un nombre de país. Recibido: '%s'", target)
        return


def _save_json(json_file: Path, label: str, stats: dict, all_banknotes: list):
    """Guarda el JSON con los datos recopilados hasta el momento."""
    output = {
        "metadata": {
            "source": "banknotescollection.com",
            "filter": label,
            "total_countries": stats["countries"],
            "total_banknotes": stats["banknotes"],
            "total_images": stats["images"],
            "errors": stats["errors"],
        },
        "banknotes": all_banknotes,
    }
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
