"""Builds the README's animated flow diagrams (docs/readme/*.svg) in the portal's style.

Usage: python3 docs/readme/diagramas.py docs/readme
Edit the texts here and run it again; never edit the generated SVGs by hand.
"""
import sys
from xml.sax.saxutils import escape as esc

DESTINO = sys.argv[1]
CICLO = 10  # seconds per loop

ESTILO = f"""
  <style>
    .fondo {{ fill: #f7f9f7; }}
    .card {{ fill: #fff; stroke: #dde3df; stroke-width: 1.5; }}
    .t {{ font-family: 'Segoe UI','Helvetica Neue',Arial,sans-serif; }}
    .titulo {{ font-size: 22px; font-weight: 700; fill: #262b35; }}
    .texto {{ font-size: 16px; fill: #4a515c; }}
    .chip {{ font-size: 12.5px; font-weight: 700; }}
    .num {{ font-size: 17px; font-weight: 800; fill: #fff; }}
    .base {{ fill: none; stroke: #dde3df; stroke-width: 6; stroke-linecap: round; }}
    .trazo {{ fill: none; stroke: #074a1f; stroke-width: 6; stroke-linecap: round;
             stroke-dasharray: 1; stroke-dashoffset: 1; animation: dibujar {CICLO}s ease-in-out infinite; }}
    .rama {{ fill: none; stroke: #074a1f; stroke-opacity: .55; stroke-width: 2.5; stroke-dasharray: 7 7;
            animation: fluir 1s linear infinite; }}
    .nodo {{ fill: #c9d6cd; animation: nodo {CICLO}s ease-in-out infinite; }}
    .marco {{ fill: none; stroke: #074a1f; stroke-width: 2.5; opacity: 0; animation: marco {CICLO}s ease-in-out infinite; }}
    .halo {{ fill: #074a1f; opacity: 0; transform-box: fill-box; transform-origin: center;
            animation: halo {CICLO}s ease-out infinite; }}
    @keyframes dibujar {{ 0% {{ stroke-dashoffset: 1; }} 62% {{ stroke-dashoffset: 0; }} 88% {{ stroke-dashoffset: 0; opacity: 1; }} 97% {{ opacity: 0; }} 100% {{ stroke-dashoffset: 1; opacity: 0; }} }}
    @keyframes fluir {{ to {{ stroke-dashoffset: -14; }} }}
    @keyframes nodo {{ 0%, 4% {{ fill: #c9d6cd; }} 8%, 86% {{ fill: #074a1f; }} 96%, 100% {{ fill: #c9d6cd; }} }}
    @keyframes marco {{ 0%, 4% {{ opacity: 0; }} 8%, 86% {{ opacity: 1; }} 96%, 100% {{ opacity: 0; }} }}
    @keyframes halo {{ 0%, 4% {{ opacity: 0; transform: scale(1); }} 6% {{ opacity: .35; }} 16%, 100% {{ opacity: 0; transform: scale(2.1); }} }}
    @media (prefers-reduced-motion: reduce) {{
      .trazo {{ animation: none; stroke-dashoffset: 0; }} .nodo {{ animation: none; fill: #074a1f; }}
      .marco {{ animation: none; opacity: 1; }} .halo, .rama, .viajero {{ animation: none; display: none; }}
    }}
  </style>"""

ACTORES = {
    "empresa": ("🏢 Empresa", "#e8f1eb", "#052f14"),
    "oficina": ("🏛️ Oficina de Empleo", "#074a1f", "#ffffff"),
    "vecino": ("👤 Vecino", "#d7ebdd", "#052f14"),
    "portal": ("🌐 Portal", "#ffffff", "#074a1f"),
    "curso": ("📚 Cursos", "#e8f1eb", "#052f14"),
}


def chip(x, y, actor):
    texto, fondo, color = ACTORES[actor]
    ancho = len(texto) * 7.6 + 22
    borde = ' stroke="#074a1f" stroke-width="1.2"' if fondo == "#ffffff" else ""
    return (f'<rect x="{x}" y="{y}" width="{ancho:.0f}" height="24" rx="12" fill="{fondo}"{borde}/>'
            f'<text x="{x + 11}" y="{y + 16.5}" class="t chip" fill="{color}">{esc(texto)}</text>')


def tarjeta(x, y, w, h, retraso, actor, titulo, lineas, numero=None, cx=None):
    """A step card; `retraso` (s) is when the travelling line reaches it."""
    d = f'style="animation-delay:{retraso:.2f}s"'
    partes = [f'<rect class="card" x="{x}" y="{y}" width="{w}" height="{h}" rx="18"/>',
              f'<rect class="marco" {d} x="{x}" y="{y}" width="{w}" height="{h}" rx="18"/>',
              chip(x + 20, y + 16, actor),
              f'<text x="{x + 20}" y="{y + 68}" class="t titulo">{esc(titulo)}</text>']
    for i, linea in enumerate(lineas):
        partes.append(f'<text x="{x + 20}" y="{y + 94 + i * 21}" class="t texto">{esc(linea)}</text>')
    if numero is not None:
        partes += [f'<circle class="halo" {d} cx="{cx}" cy="{y + h / 2}" r="22"/>',
                   f'<circle class="nodo" {d} cx="{cx}" cy="{y + h / 2}" r="22" stroke="#f7f9f7" stroke-width="5"/>',
                   f'<text x="{cx}" y="{y + h / 2 + 6}" text-anchor="middle" class="t num">{numero}</text>']
    return "\n".join(partes)


def svg(ancho, alto, cuerpo, etiqueta):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" width="{ancho}" height="{alto}" '
            f'role="img" aria-label="{esc(etiqueta)}">{ESTILO}\n<rect class="fondo" width="{ancho}" height="{alto}" rx="28"/>\n{cuerpo}\n</svg>')


def viajero(camino, fin=0.62):
    """A dot that rides the main line once per loop (SMIL, plays inside <img>)."""
    return (f'<circle class="viajero" r="9" fill="#fff" stroke="#074a1f" stroke-width="4">'
            f'<animateMotion dur="{CICLO}s" repeatCount="indefinite" path="{camino}" '
            f'keyPoints="0;1;1" keyTimes="0;{fin};1" calcMode="linear"/>'
            f'<animate attributeName="opacity" dur="{CICLO}s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;{fin};{fin + 0.04};1"/></circle>')


# ---------------------------------------------------------------- 1. How it works
def como_funciona():
    pasos = [
        ("empresa", "Carga una oferta", ["La guarda como borrador y la", "envía a revisión cuando está lista."]),
        ("oficina", "La revisa y la publica", ["Si algo no está bien, le explica", "a la empresa qué corregir."]),
        ("portal", "La oferta queda visible", ["Cualquier vecino la ve,", "incluso sin tener cuenta."]),
        ("vecino", "Se postula", ["Con su CV armado en el portal", "o subido, en un solo toque."]),
        ("oficina", "Preselecciona perfiles", ["Revisa cada postulación. Los", "vecinos de Funes, primero."]),
        ("empresa", "Entrevista y contrata", ["Solo ve a los preseleccionados", "y confirma su decisión."]),
    ]
    x0, y0, w, h, sep, cx = 96, 40, 476, 150, 34, 50
    cuerpo = []
    paso_y = [y0 + i * (h + sep) for i in range(len(pasos))]
    centro = [y + h / 2 for y in paso_y]
    camino = f"M {cx} {centro[0]} L {cx} {centro[-1]}"
    cuerpo += [f'<path class="base" d="{camino}"/>', f'<path class="trazo" pathLength="1" d="{camino}"/>']
    for i, (actor, titulo, lineas) in enumerate(pasos):
        retraso = (i / (len(pasos) - 1)) * 0.62 * CICLO
        cuerpo.append(tarjeta(x0, paso_y[i], w, h, retraso, actor, titulo, lineas, i + 1, cx))
    # Two outcomes after the last step
    yb = paso_y[-1] + h + 70
    fin = 0.62 * CICLO
    cuerpo += [
        f'<path class="rama" d="M {cx} {centro[-1] + 24} C {cx} {yb - 20}, 160 {yb - 30}, 190 {yb}"/>',
        f'<path class="rama" d="M {cx} {centro[-1] + 24} C {cx} {yb - 40}, 420 {yb - 50}, 440 {yb}"/>',
        tarjeta(40, yb, 260, 130, fin + 0.3, "curso", "Si no queda", ["Recibe materiales", "para prepararse."]),
        tarjeta(316, yb, 256, 130, fin + 0.6, "oficina", "Si lo contratan", ["La Oficina lo suma", "a sus indicadores."]),
        viajero(camino),
    ]
    return svg(612, yb + 170, "\n".join(cuerpo), "Cómo funciona el portal, paso a paso")


# ---------------------------------------------------------------- 2. An application's path
def postulacion():
    etapas = [
        ("vecino", "Enviada", ["La Oficina de Empleo", "revisa tu perfil."]),
        ("oficina", "Preseleccionada", ["La Oficina recomendó", "tu perfil a la empresa."]),
        ("empresa", "Entrevista", ["La empresa quiere", "conocerte y te contacta."]),
        ("empresa", "¡Contratado! 🎉", ["Conseguiste el trabajo.", "¡Éxitos en esta etapa!"]),
    ]
    x0, y0, w, h, sep, cx = 96, 40, 300, 130, 30, 50
    paso_y = [y0 + i * (h + sep) for i in range(len(etapas))]
    centro = [y + h / 2 for y in paso_y]
    camino = f"M {cx} {centro[0]} L {cx} {centro[-1]}"
    cuerpo = [f'<path class="base" d="{camino}"/>', f'<path class="trazo" pathLength="1" d="{camino}"/>']
    for i, (actor, titulo, lineas) in enumerate(etapas):
        cuerpo.append(tarjeta(x0, paso_y[i], w, h, (i / 3) * 0.62 * CICLO, actor, titulo, lineas, i + 1, cx))
    # Side branch: not selected, from any of the first three stages
    bx, by = 430, paso_y[1] - 10
    for i in range(3):
        cuerpo.append(f'<path class="rama" d="M {x0 + w} {centro[i]} C {x0 + w + 20} {centro[i]}, {bx - 20} {by + 90}, {bx} {by + 90}"/>')
    cuerpo += [
        f'<rect class="card" x="{bx}" y="{by}" width="222" height="214" rx="18"/>',
        chip(bx + 18, by + 16, "oficina"),
        f'<text x="{bx + 18}" y="{by + 70}" class="t titulo">No seleccionada</text>',
        f'<text x="{bx + 18}" y="{by + 96}" class="t texto">Siempre con motivo:</text>',
        f'<text x="{bx + 18}" y="{by + 122}" class="t texto">• cupo completo</text>',
        f'<text x="{bx + 18}" y="{by + 145}" class="t texto">• no seleccionado</text>',
        f'<rect x="{bx + 14}" y="{by + 162}" width="194" height="34" rx="10" fill="#e8f1eb"/>',
        f'<text x="{bx + 30}" y="{by + 184}" class="t texto" fill="#052f14">📚 Puede ir a un curso</text>',
        viajero(camino),
    ]
    return svg(684, paso_y[-1] + h + 40, "\n".join(cuerpo), "El camino de una postulación")


# ---------------------------------------------------------------- 3. An offer's path
def oferta():
    etapas = [
        ("empresa", "Borrador", ["La empresa la carga y la", "edita todas las veces que quiera."]),
        ("empresa", "En revisión", ["La envía a la Oficina.", "Mientras tanto no se edita."]),
        ("oficina", "Publicada", ["Aprobada por la Oficina:", "se ve en el portal."]),
        ("empresa", "Cerrada", ["Se completó o se cerró.", "No recibe más postulaciones."]),
    ]
    x0, y0, w, h, sep, cx = 96, 40, 330, 130, 30, 50
    paso_y = [y0 + i * (h + sep) for i in range(len(etapas))]
    centro = [y + h / 2 for y in paso_y]
    camino = f"M {cx} {centro[0]} L {cx} {centro[-1]}"
    cuerpo = [f'<path class="base" d="{camino}"/>', f'<path class="trazo" pathLength="1" d="{camino}"/>']
    for i, (actor, titulo, lineas) in enumerate(etapas):
        cuerpo.append(tarjeta(x0, paso_y[i], w, h, (i / 3) * 0.62 * CICLO, actor, titulo, lineas, i + 1, cx))
    bx, by = 456, paso_y[1] + 10
    cuerpo += [
        # In review -> rejected (with reason)
        f'<path class="rama" d="M {x0 + w} {centro[1]} L {bx} {by + 70}"/>',
        f'<rect class="card" x="{bx}" y="{by}" width="190" height="140" rx="18"/>',
        chip(bx + 16, by + 16, "oficina"),
        f'<text x="{bx + 16}" y="{by + 70}" class="t titulo">Rechazada</text>',
        f'<text x="{bx + 16}" y="{by + 96}" class="t texto">con el motivo,</text>',
        f'<text x="{bx + 16}" y="{by + 117}" class="t texto">para corregirla</text>',
        # Rejected -> back to draft ("usar como base") and in review -> draft (taken back)
        f'<path class="rama" d="M {bx + 95} {by} C {bx + 95} {paso_y[0] + 20}, {x0 + w + 60} {centro[0]}, {x0 + w} {centro[0]}"/>',
        f'<rect x="{bx - 6}" y="{paso_y[0] + 10}" width="170" height="30" rx="15" fill="#fff" stroke="#074a1f" stroke-width="1.2"/>',
        f'<text x="{bx + 79}" y="{paso_y[0] + 30}" text-anchor="middle" class="t chip" fill="#074a1f">↺ Usar como base</text>',
        f'<rect x="{x0 + w - 150}" y="{paso_y[1] - 22}" width="140" height="26" rx="13" fill="#fff" stroke="#dde3df"/>',
        f'<text x="{x0 + w - 80}" y="{paso_y[1] - 4}" text-anchor="middle" class="t chip" fill="#4a515c">↑ la puede retirar</text>',
        viajero(camino),
    ]
    return svg(676, paso_y[-1] + h + 40, "\n".join(cuerpo), "El camino de una oferta")


for nombre, contenido in [("flujo", como_funciona()), ("postulacion", postulacion()), ("oferta", oferta())]:
    with open(f"{DESTINO}/{nombre}.svg", "w") as archivo:
        archivo.write(contenido)
    print(nombre)
