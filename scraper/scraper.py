"""
Script de scraping para banknotescollection.com
Extrae toda la información de billetes de países que empiezan por una letra dada.
Guarda catálogo en JSON con URLs de imágenes originales.

USO: python scraper.py B
"""

import argparse
import json
import re
import time
import logging
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# ─── Configuración ──────────────────────────────────────────────
BASE_URL = "https://banknotescollection.com"
LIST_URL = f"{BASE_URL}/list"
OUTPUT_DIR = Path(__file__).parent / "data"

# Delays entre peticiones para no sobrecargar el servidor
DELAY_BETWEEN_COUNTRIES = 2   # segundos
DELAY_BETWEEN_BANKNOTES = 1   # segundos

REQUEST_TIMEOUT = 30  # segundos

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
    """Realiza GET y devuelve el BeautifulSoup parseado."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        log.error("Error al obtener %s: %s", url, e)
        return None


# ─── Paso 1: Obtener países que empiezan por una letra ──────────

def get_countries_starting_with(letter: str) -> list[dict]:
    """Devuelve lista de {name, url} de países que empiezan por la letra dada."""
    letter = letter.upper()
    log.info("Obteniendo lista de países con letra '%s'...", letter)
    soup = get_soup(LIST_URL)
    if not soup:
        return []

    countries = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        # Los enlaces de países usan rutas relativas: ./list/{country}
        # Normalizar a URL absoluta
        if href.startswith("./list/"):
            slug = href.replace("./list/", "")
        elif href.startswith("/list/"):
            slug = href.replace("/list/", "")
        elif href.startswith(f"{LIST_URL}/"):
            slug = href.replace(f"{LIST_URL}/", "")
        else:
            continue

        name = link.get_text(strip=True)
        # Filtrar sólo los que son enlaces directos a país (sin sub-ruta)
        if "/" in slug or not name or not slug:
            continue
        # Ignorar enlaces que no sean países
        if slug.lower() in ("blog", "cookies.php"):
            continue

        if name.upper().startswith(letter):
            full_url = f"{LIST_URL}/{slug}"
            countries.append({"name": name, "slug": slug, "url": full_url})

    log.info("Encontrados %d países con letra %s: %s",
             len(countries), letter, ", ".join(c["name"] for c in countries))
    return countries


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

def parse_banknote_detail(url: str, country_name: str, country_slug: str) -> dict | None:
    """Parsea la página de detalle de un billete y devuelve un dict."""
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


# ─── Pipeline principal ────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Scraper de banknotescollection.com — descarga billetes por letra de país."
    )
    parser.add_argument(
        "letter",
        help="Letra inicial de los países a descargar (ej: A, B, C...)",
    )
    args = parser.parse_args()
    letter = args.letter.strip().upper()

    if len(letter) != 1 or not letter.isalpha():
        log.error("Debes proporcionar exactamente una letra (A-Z). Recibido: '%s'", args.letter)
        return

    # Crear directorio de salida
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    log.info("=" * 60)
    log.info("SCRAPER DE BANKNOTESCOLLECTION.COM")
    log.info("Países: letra %s", letter)
    log.info("Directorio de salida: %s", OUTPUT_DIR.resolve())
    log.info("=" * 60)

    # 1) Lista de países con la letra indicada
    countries = get_countries_starting_with(letter)
    if not countries:
        log.error("No se encontraron países con letra %s. Abortando.", letter)
        return

    json_file = OUTPUT_DIR / f"billetes_{letter.lower()}.json"

    all_banknotes = []
    stats = {"countries": 0, "banknotes": 0, "images": 0, "errors": 0}

    total_countries = len(countries)
    for ci, country in enumerate(countries, 1):
        log.info("")
        log.info("━" * 50)
        log.info("PAÍS [%d/%d]: %s", ci, total_countries, country["name"])
        log.info("━" * 50)

        # 2) Lista de billetes del país
        banknote_links = get_banknotes_for_country(country)
        time.sleep(DELAY_BETWEEN_COUNTRIES)

        for i, bn_link in enumerate(banknote_links, 1):
            log.info("")
            log.info("  [%s] [%d/%d] %s — %s",
                     country["name"], i, len(banknote_links), bn_link["pick"], bn_link["link_text"])

            # 3) Detalle del billete
            detail = parse_banknote_detail(
                bn_link["url"], country["name"], country["slug"]
            )
            if not detail:
                log.warning("    ⚠ No se pudo parsear. Saltando.")
                stats["errors"] += 1
                time.sleep(DELAY_BETWEEN_BANKNOTES)
                continue

            # Filtrar entradas basura (cabeceras de sección, tests, etc.)
            if is_garbage(detail.get("title"), detail.get("country")):
                log.warning("    ⚠ Entrada basura detectada: %s. Saltando.",
                           detail.get("title", "(sin título)")[:60])
                stats["errors"] += 1
                time.sleep(DELAY_BETWEEN_BANKNOTES)
                continue

            # Contar imágenes encontradas
            img_count = len(detail.get("images", []))
            for v in detail.get("variants", []):
                img_count += len(v.get("images", []))
            stats["images"] += img_count

            all_banknotes.append(detail)
            stats["banknotes"] += 1

            log.info("    ✓ %d imágenes | Total acumulado: %d billetes, %d imágenes",
                     img_count, stats["banknotes"], stats["images"])

            time.sleep(DELAY_BETWEEN_BANKNOTES)

        stats["countries"] += 1

        # Guardar JSON después de cada país (progreso incremental)
        _save_json(json_file, letter, stats, all_banknotes)
        log.info("")
        log.info("  ── Resumen parcial ──")
        log.info("  Países: %d/%d | Billetes: %d | Imágenes: %d | Errores: %d",
                 stats["countries"], total_countries, stats["banknotes"],
                 stats["images"], stats["errors"])
        log.info("  ✓ JSON guardado en: %s", json_file.name)

    # Resumen final
    log.info("")
    log.info("=" * 60)
    log.info("RESUMEN FINAL")
    log.info("  Países procesados: %d", stats["countries"])
    log.info("  Billetes guardados: %d", stats["banknotes"])
    log.info("  URLs de imágenes: %d", stats["images"])
    log.info("  Errores: %d", stats["errors"])
    log.info("  JSON en: %s", json_file.resolve())
    log.info("=" * 60)


def _save_json(json_file: Path, letter: str, stats: dict, all_banknotes: list):
    """Guarda el JSON con los datos recopilados hasta el momento."""
    output = {
        "metadata": {
            "source": "banknotescollection.com",
            "filter": f"Países con letra {letter}",
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
