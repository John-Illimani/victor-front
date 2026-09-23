import { rgb } from "pdf-lib";

const COLOR_TEXT_DEFAULT = rgb(0, 0, 0);

/**
 * Dibuja un campo de formulario con valor en negrita y línea punteada por debajo.
 *
 * @param {Object} page - Página de pdf-lib.
 * @param {Object} config - Configuración del campo.
 */
export function drawFieldWithUnderline(page, {
  label,
  value,
  x,
  y,
  fieldWidth,
  font,
  fontBold,
  fontSize = 10,
  color = COLOR_TEXT_DEFAULT,
  dashArray = [2, 2]
}) {
  // 1. Dibujar la etiqueta fija
  page.drawText(label, {
    x,
    y,
    size: fontSize,
    font,
    color,
  });

  const labelWidth = font.widthOfTextAtSize(label, fontSize);
  const valueX = x + labelWidth + 4; // Espacio entre etiqueta y respuesta
  const lineEndX = x + fieldWidth;   // Ancho delimitado del campo

  // 2. Dibujar el valor dinámico rellenado en negrita (si existe)
  if (value) {
    page.drawText(String(value), {
      x: valueX,
      y,
      size: fontSize,
      font: fontBold,
      color,
    });
  }

  // 3. Trazar la línea punteada por debajo de la respuesta
  const lineY = y - 2; // Desfase vertical inferior
  page.drawLine({
    start: { x: valueX, y: lineY },
    end: { x: lineEndX, y: lineY },
    thickness: 0.8,
    dashArray,
    color,
  });
}