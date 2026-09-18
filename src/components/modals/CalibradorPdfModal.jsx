import React, { useState, useEffect, useRef } from 'react';
import { Sliders, X, RefreshCw, Copy, Check, Eye } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const CalibradorPdfModal = ({ show, onClose, pdfUrl, datosDemo }) => {
  // Estado de Coordenadas
  const [coords, setCoords] = useState({
    lugarY: 619,
    prediosY: 603,
    horaY: 587,
    espY: 556,
    tablaY: 478,
    pieY: 210,
  });

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const [pdfPage, setPdfPage] = useState(null);

  // Cargar Render de la primera página del PDF base
  useEffect(() => {
    if (!show || !pdfUrl) return;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        setPdfPage(page);
      } catch (err) {
        console.error("Error al cargar canvas del PDF:", err);
      }
    };

    loadPdf();
  }, [show, pdfUrl]);

  // Dibujar Canvas en Tiempo Real cuando cambien los sliders o la página
  useEffect(() => {
    if (!pdfPage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const viewport = pdfPage.getViewport({ scale: 1.2 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    pdfPage.render(renderContext).promise.then(() => {
      // DIBUJAR CAPA DE SOBREPOSICIÓN
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#0000FF'; // Color azul para diferenciar

      const scale = viewport.height / 792; // Factor de conversión respecto a 792 pt

      // Conversor de coordenada PDF Y (origen abajo) a Canvas Y (origen arriba)
      const toCanvasY = (pdfY) => viewport.height - (pdfY * scale);

      // 1. Ciudad / Dpto
      ctx.fillText(datosDemo?.lugar_ciudad || 'El Alto', 220 * scale, toCanvasY(coords.lugarY));
      ctx.fillText(datosDemo?.departamento || 'La Paz', 420 * scale, toCanvasY(coords.lugarY));

      // 2. Predios
      ctx.font = '10px sans-serif';
      ctx.fillText(datosDemo?.esfm_predios || 'ESFM Simón Bolívar / UA El Alto', 220 * scale, toCanvasY(coords.prediosY));

      // 3. Hora / Día / Mes / Gestión
      ctx.fillText(datosDemo?.hora || '09:00', 135 * scale, toCanvasY(coords.horaY));
      ctx.fillText(datosDemo?.dia || '17', 215 * scale, toCanvasY(coords.horaY));
      ctx.fillText(datosDemo?.mes || 'septiembre', 310 * scale, toCanvasY(coords.horaY));
      ctx.fillText(datosDemo?.gestion || '2026', 480 * scale, toCanvasY(coords.horaY));

      // 4. Especialidad
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText((datosDemo?.especialidad || 'EDUCACIÓN PRIMARIA').toUpperCase(), 110 * scale, toCanvasY(coords.espY));

      // 5. Tabla
      const integrantes = datosDemo?.integrantes || [{ nombre: 'Juan', apellido: 'Pérez', ci: '1234567' }];
      integrantes.forEach((int, idx) => {
        const yPos = coords.tablaY - (idx * 18.5);
        ctx.fillText(`${idx + 1}`, 195 * scale, toCanvasY(yPos));
        ctx.fillText(`${int.nombre} ${int.apellido}`.toUpperCase(), 235 * scale, toCanvasY(yPos));
        ctx.fillText(`${int.ci}`, 410 * scale, toCanvasY(yPos));
      });

      // 6. Pie
      ctx.font = '10px sans-serif';
      ctx.fillText(`${datosDemo?.lugar_ciudad || 'El Alto'}, ${datosDemo?.dia || '17'} de ${datosDemo?.mes || 'septiembre'} de ${datosDemo?.gestion || '2026'}`, 260 * scale, toCanvasY(coords.pieY));
    });

  }, [pdfPage, coords, datosDemo]);

  if (!show) return null;

  const copyCode = () => {
    const text = `firstPage.drawText(..., { y: ${coords.lugarY} }); // Lugar\nfirstPage.drawText(..., { y: ${coords.prediosY} }); // Predios\nfirstPage.drawText(..., { y: ${coords.horaY} }); // Hora\nfirstPage.drawText(..., { y: ${coords.espY} }); // Especialidad\nlet startY = ${coords.tablaY}; // Tabla\nfirstPage.drawText(..., { y: ${coords.pieY} }); // Pie`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="relative flex w-full max-w-6xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        
        {/* PANEL IZQUIERDO: VISUALIZADOR EN TIEMPO REAL */}
        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex justify-center items-start border-r border-slate-200">
          <canvas ref={canvasRef} className="shadow-lg border border-slate-300 rounded-lg bg-white" />
        </div>

        {/* PANEL DERECHO: CONTROLES DE SLIDERS */}
        <div className="w-80 p-6 bg-white overflow-y-auto space-y-5 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Sliders size={18} className="text-[#801B28]" /> Calibrador PDF
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="flex justify-between mb-1">
                  <span>1. Ciudad/Dpto Y:</span>
                  <span className="font-mono text-[#801B28]">{coords.lugarY}</span>
                </label>
                <input type="range" min="550" max="680" value={coords.lugarY} onChange={(e) => setCoords({ ...coords, lugarY: Number(e.target.value) })} className="w-full accent-[#801B28] cursor-pointer" />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>2. Predios ESFM Y:</span>
                  <span className="font-mono text-[#801B28]">{coords.prediosY}</span>
                </label>
                <input type="range" min="530" max="660" value={coords.prediosY} onChange={(e) => setCoords({ ...coords, prediosY: Number(e.target.value) })} className="w-full accent-[#801B28] cursor-pointer" />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>3. Hora/Día/Mes/Año Y:</span>
                  <span className="font-mono text-[#801B28]">{coords.horaY}</span>
                </label>
                <input type="range" min="500" max="640" value={coords.horaY} onChange={(e) => setCoords({ ...coords, horaY: Number(e.target.value) })} className="w-full accent-[#801B28] cursor-pointer" />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>4. Especialidad Y:</span>
                  <span className="font-mono text-[#801B28]">{coords.espY}</span>
                </label>
                <input type="range" min="470" max="600" value={coords.espY} onChange={(e) => setCoords({ ...coords, espY: Number(e.target.value) })} className="w-full accent-[#801B28] cursor-pointer" />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>5. Tabla Integrantes Y:</span>
                  <span className="font-mono text-[#801B28]">{coords.tablaY}</span>
                </label>
                <input type="range" min="400" max="520" value={coords.tablaY} onChange={(e) => setCoords({ ...coords, tablaY: Number(e.target.value) })} className="w-full accent-[#801B28] cursor-pointer" />
              </div>

              <div>
                <label className="flex justify-between mb-1">
                  <span>6. Pie (Lugar/Fecha) Y:</span>
                  <span className="font-mono text-[#801B28]">{coords.pieY}</span>
                </label>
                <input type="range" min="150" max="280" value={coords.pieY} onChange={(e) => setCoords({ ...coords, pieY: Number(e.target.value) })} className="w-full accent-[#801B28] cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button onClick={copyCode} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-extrabold py-2.5 rounded-2xl text-xs hover:bg-slate-800 transition-all cursor-pointer">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? "Coordenadas Copiadas" : "Copiar Valores Y"}
            </button>
            <button onClick={onClose} className="w-full bg-slate-100 text-slate-700 font-extrabold py-2.5 rounded-2xl text-xs hover:bg-slate-200 transition-all cursor-pointer">
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};