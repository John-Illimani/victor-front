import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Blocks,
  Lock,
  Sparkles,
  RefreshCw,
  Camera,
  X,
  User,
  CreditCard,
  FileText,
  Scan,
  Upload
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

import { blockchainService } from "../../services/blockchainService";
import { userService } from "../../services/userService";

export const BlockchainIntegrityManagement = () => {
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [resultadoVerificacion, setResultadoVerificacion] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorVerificacion, setErrorVerificacion] = useState("");

  // Estados de Cámara / Escáner
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [codigoDetectado, setCodigoDetectado] = useState(false); // true en cuanto el lector reconoce el PDF417
  const [procesandoArchivo, setProcesandoArchivo] = useState(false);

  const scannerRef = useRef(null);
  const inputArchivoRef = useRef(null);

  // =========================================================================
  // EXTRACCIÓN Y LIMPIEZA EXACTA DEL TX HASH
  // =========================================================================
  const extraerTxHashDeCadena = (cadena) => {
    if (!cadena) return "";
    let texto = String(cadena).trim();

    // Extrae exactamente el hash que empieza con 0x después de TX_HASH:
    const txHashMatch = texto.match(/TX_HASH:(0x[a-fA-F0-9]+)/);
    if (txHashMatch && txHashMatch[1]) {
      return txHashMatch[1].trim();
    }

    // Fallback: Si el usuario escanea o pega solo el HASH LOCAL
    const localHashMatch = texto.match(/HASH_LOCAL:(0x[a-fA-F0-9]+)/);
    if (localHashMatch && localHashMatch[1]) {
      return localHashMatch[1].trim();
    }

    // Fallback 2: si ingresan el hash suelto
    return texto;
  };

  // =========================================================================
  // CONSULTA A BLOCKCHAIN Y SINCRO CON USER SERVICE (NOMBRE + CARNET C.I.)
  // =========================================================================
  const ejecutarVerificacion = async (hashOrCode) => {
    if (!hashOrCode || !hashOrCode.trim()) return;

    const queryLimpia = extraerTxHashDeCadena(hashOrCode);
    setIsSearching(true);
    setResultadoVerificacion(null);
    setErrorVerificacion("");

    try {
      // 1. Consultar verificación pública en Blockchain
      const resWeb3 = await blockchainService.verificarPublico(queryLimpia);

      if (resWeb3 && (resWeb3.existe || resWeb3.autentico)) {
        let ciEstudiante = resWeb3.ci || "S/C";
        let nombreEstudiante = resWeb3.nombre_estudiante || "No registrado";

        // 2. Si existe estudiante_id, cruzamos datos con userService.getUsers()
        if (resWeb3.estudiante_id) {
          try {
            const listaUsuarios = await userService.getUsers();
            const usuariosArr = Array.isArray(listaUsuarios)
              ? listaUsuarios
              : listaUsuarios?.datos || [];

            const userObj = usuariosArr.find(
              (u) => String(u.id) === String(resWeb3.estudiante_id)
            );

            if (userObj) {
              ciEstudiante = userObj.ci || ciEstudiante;
              nombreEstudiante = `${userObj.nombre || ""} ${userObj.apellido || ""}`.trim().toUpperCase();
            }
          } catch (errUser) {
            console.warn("No se pudieron sincronizar los datos del usuario:", errUser);
          }
        }

        setResultadoVerificacion({
          autentico: true,
          estatus: resWeb3.estatus,
          hashLocal: resWeb3.hash_local,
          txHash: resWeb3.tx_hash,
          nombreEstudiante: nombreEstudiante,
          ciEstudiante: ciEstudiante,
          especialidad: resWeb3.especialidad || "Educación Superior",
          fecha: resWeb3.fecha
            ? new Date(resWeb3.fecha * 1000).toLocaleString()
            : "Fecha no disponible"
        });
      } else {
        setErrorVerificacion(
          "El código PDF417 o Tx-Hash no figura en la red Blockchain o el documento ha sido modificado."
        );
      }
    } catch (err) {
      console.error("Error en verificación de integridad:", err);
      setErrorVerificacion(
        err.message || err.estatus || "No se pudo verificar la transacción solicitada."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerificarHash = (e) => {
    e.preventDefault();
    ejecutarVerificacion(codigoBusqueda);
  };

  // =========================================================================
  // MANEJADOR ÚNICO DE ÉXITO (cámara en vivo Y subida de imagen)
  // Muestra "¡Hash Encontrado!" de inmediato y luego cierra y verifica.
  // =========================================================================
  const manejarDeteccionExitosa = (decodedText) => {
    const txHashExtraido = extraerTxHashDeCadena(decodedText);
    setCodigoBusqueda(txHashExtraido);
    setCodigoDetectado(true); // <-- dispara el aviso "¡Hash Encontrado!" debajo del visor

    // Pequeña pausa (600ms) para que el usuario VEA la confirmación antes de que
    // se cierre el modal; después cerramos cámara y disparamos la verificación.
    setTimeout(async () => {
      await detenerCamara();
      setShowCameraModal(false);
      setCodigoDetectado(false);
      ejecutarVerificacion(txHashExtraido);
    }, 600);
  };

  // =========================================================================
  // LÓGICA DE CÁMARA (CORREGIDA PARA INTERFAZ Y LECTURA PDF417)
  // =========================================================================
  const iniciarCamaraPdf417 = async () => {
    setCameraError("");
    setCamaraActiva(false);

    setTimeout(async () => {
      try {
        // Se fuerza a la librería a priorizar PDF417 y QR CODE.
        const html5QrCode = new Html5Qrcode("reader-camera", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.PDF_417,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });

        scannerRef.current = html5QrCode;

        // Configuración afinada para PDF417: éste es un código MUCHO más denso que un QR.
        // Los 3 problemas más comunes por los que "no lee" son:
        //  1) Resolución de cámara insuficiente para la densidad de puntos del PDF417.
        //  2) Caja de escaneo (qrbox) demasiado angosta/baja que recorta el código.
        //  3) El detector NATIVO del navegador (BarcodeDetector) no soporta PDF417 en
        //     la mayoría de navegadores, así que hay que forzar a la librería a usar
        //     su motor propio (ZXing), que sí lo soporta.
        const configCamara = {
          fps: 8, // Un poco más lento que 10: decodificar PDF417 exige más cómputo por cuadro
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Caja ancha y proporcional, pensada para el formato horizontal del PDF417
            let width = Math.floor(viewfinderWidth * 0.92);
            let height = Math.floor(width * 0.34); // proporción típica ancho:alto de un PDF417 denso
            if (height > viewfinderHeight * 0.8) height = Math.floor(viewfinderHeight * 0.8);
            if (height < 130) height = 130; // nunca recortar demasiado la altura
            return { width, height };
          },
          videoConstraints: {
            facingMode: "environment", // Intenta usar cámara trasera por defecto
            width: { ideal: 1920 }, // Full HD: clave para que se lean los puntos densos del PDF417
            height: { ideal: 1080 },
            advanced: [{ focusMode: "continuous" }] // ayuda a mantener el enfoque en códigos impresos
          },
          // Fuerza el uso del motor interno (ZXing) en vez del BarcodeDetector nativo del
          // navegador, que en Chrome/Safari normalmente NO decodifica PDF417.
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: false
          },
          disableFlip: false
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          configCamara,
          (decodedText) => {
            // ÉXITO AL LEER CÓDIGO
            manejarDeteccionExitosa(decodedText);
          },
          (errorMessage) => {
            // Los errores de lectura cuadro por cuadro se ignoran silenciosamente
          }
        );

        setCamaraActiva(true);
      } catch (err) {
        console.error("Error al encender la cámara para PDF417:", err);
        setCameraError(
          "No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios en tu navegador."
        );
        setCamaraActiva(false);
      }
    }, 250);
  };

  // =========================================================================
  // FALLBACK: LEER PDF417 DESDE UNA FOTO/IMAGEN SUBIDA
  // La lectura en vivo por cámara a veces falla con códigos MUY densos por
  // compresión de video y poca luz. Subir una foto fija (mejor resolución,
  // sin compresión de video) suele leer códigos que la cámara en vivo no logra.
  // =========================================================================
  const manejarArchivoSeleccionado = async (e) => {
    const archivo = e.target.files && e.target.files[0];
    if (!archivo) return;

    setCameraError("");
    setProcesandoArchivo(true);

    let html5QrCodeArchivo;
    try {
      html5QrCodeArchivo = new Html5Qrcode("reader-camera-oculto", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        verbose: false
      });

      const resultado = await html5QrCodeArchivo.scanFile(archivo, false);
      manejarDeteccionExitosa(resultado);
    } catch (err) {
      console.error("No se pudo leer el código desde la imagen:", err);
      setCameraError(
        "No se detectó ningún código PDF417 en la imagen. Prueba con una foto más nítida, bien iluminada y sin reflejos."
      );
    } finally {
      try {
        if (html5QrCodeArchivo) await html5QrCodeArchivo.clear();
      } catch (_) {
        /* noop */
      }
      setProcesandoArchivo(false);
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    }
  };

  const detenerCamara = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error al detener la cámara:", err);
      }
    }
    setCamaraActiva(false);
  };

  // Administrador del ciclo de vida del modal
  useEffect(() => {
    if (showCameraModal) {
      iniciarCamaraPdf417();
    } else {
      detenerCamara();
    }

    return () => {
      detenerCamara();
    };
  }, [showCameraModal]);

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER PRINCIPAL ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Blocks size={14} className="text-[#6B9E1E]" /> Consola de Integridad Inmutable
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Integridad Blockchain
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Verificación inalterable mediante código PDF417 de certificados. PostgreSQL almacena la información principal y Blockchain conserva el Hash SHA-256 de verificación.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: VERIFICACIÓN DE INTEGRIDAD */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* BUSCADOR DE VERIFICACIÓN (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#801B28]" />
              Verificación de Integridad Criptográfica
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Escanea el código de barras PDF417 con la cámara o ingresa el Tx-Hash / Hash Local para auditar el documento.
            </p>
          </div>

          <form onSubmit={handleVerificarHash} className="space-y-4">
            <div className="relative">
              <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                TX-HASH O CÓDIGO LOCAL
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tx-Hash o Hash local (Ej: 0x5d6d... / 0x1da3...)"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0 shadow-sm"
                    title="Escanear Código PDF417 con Cámara"
                  >
                    <Camera size={16} className="text-[#C9A751]" />
                    <span>Escanear PDF417</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isSearching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                    <span>[ Buscar ]</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* RESULTADO DE LA VERIFICACIÓN */}
          {resultadoVerificacion && (
            <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in space-y-4">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
                Resultado de Validación Oficial
              </span>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                      ✓ INTEGRIDAD VERIFICADA EN BLOCKCHAIN
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-800">
                      {resultadoVerificacion.estatus}
                    </p>
                  </div>
                </div>

                {/* DATOS DEL ESTUDIANTE VERIFICADO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-start gap-2">
                    <User size={16} className="text-[#801B28] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Estudiante Verificado:</span>
                      <span className="font-extrabold text-slate-900 block">{resultadoVerificacion.nombreEstudiante}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard size={16} className="text-[#801B28] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Carnet de Identidad (C.I.):</span>
                      <span className="font-mono font-extrabold text-slate-900 block">{resultadoVerificacion.ciEstudiante}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 col-span-1 sm:col-span-2 pt-2 border-t border-slate-100">
                    <FileText size={16} className="text-[#8C731A] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Especialidad:</span>
                      <span className="font-bold text-slate-800 block">{resultadoVerificacion.especialidad}</span>
                    </div>
                  </div>
                </div>

                {/* HASHES TÉCNICOS */}
                <div className="space-y-2 text-xs font-mono bg-white/90 p-3.5 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Hash Criptográfico Local (SHA-256):</span>
                    <span className="text-slate-800 font-bold break-all">{resultadoVerificacion.hashLocal || "N/A"}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-100">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Transacción en Blockchain (Tx Hash):</span>
                    <span className="text-emerald-700 font-bold break-all">{resultadoVerificacion.txHash || "N/A"}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-100 text-[10px] font-sans text-slate-500 font-semibold">
                    Fecha de Registro / Minado: {resultadoVerificacion.fecha}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MENSAJE DE ERROR */}
          {errorVerificacion && (
            <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in">
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider">
                      ⚠ VERIFICACIÓN FALLIDA
                    </h3>
                    <p className="text-[11px] font-bold text-rose-800">
                      {errorVerificacion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* REGLA DE NEGOCIO Y ESTADO TÉCNICO (1 COL) */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8C731A]/20 text-[#8C731A] border border-[#8C731A]/40">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#F3EFCF]">Política de Seguridad</h3>
                <p className="text-[11px] text-slate-400">Inmutabilidad Garantizada</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                El Administrador <strong className="text-[#F3EFCF]">no puede editar ni alterar los datos almacenados en Blockchain</strong>.
              </p>
              <p className="text-[11px] text-slate-400">
                PostgreSQL gestiona la persistencia operativa y la red Blockchain respalda las firmas digitales mediante Hash SHA-256 para auditorías forenses.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 mt-6 space-y-1">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Algoritmo de Hash</span>
            <span className="block text-sm font-black text-[#6B9E1E] font-mono">SHA-256 Inmutable</span>
          </div>
        </div>
      </div>

      {/* MODAL AMPLIADA Y LIMPIA: ESCÁNER DE CÁMARA PARA CÓDIGOS PDF417 */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <button
              onClick={() => {
                detenerCamara();
                setShowCameraModal(false);
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors z-50"
            >
              <X size={22} />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-[#801B28] mb-2">
                <Scan size={14} /> LECTOR PANORÁMICO PDF417
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Escanear Código de Barras PDF417
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                Alinea el código PDF417 del documento impreso horizontalmente dentro de las líneas de enfoque para extraer el Tx-Hash.
              </p>
            </div>

            {/* VISOR DE CÁMARA (Estructura Limpia sin Clases Conflictivas) */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-black w-full min-h-[300px]">
              {!camaraActiva && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white text-xs font-semibold z-10 bg-slate-900/90">
                  <RefreshCw className="animate-spin text-[#C9A751]" size={32} />
                  <span>Encendiendo cámara en alta resolución...</span>
                </div>
              )}

              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2 z-10 bg-slate-900">
                  <AlertTriangle size={38} className="text-rose-500 mx-auto" />
                  <p className="text-xs font-bold text-rose-300">{cameraError}</p>
                </div>
              ) : (
                <div id="reader-camera" className="w-full h-auto"></div>
              )}
            </div>

            {/* AVISO "HASH ENCONTRADO" — aparece justo abajo del visor apenas se detecta el código */}
            {codigoDetectado && (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-300 py-3 px-4 animate-in fade-in">
                <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                <span className="text-sm font-black text-emerald-700 uppercase tracking-wide">
                  ¡Hash Encontrado!
                </span>
              </div>
            )}

            {/* Elemento oculto usado por Html5Qrcode para decodificar imágenes subidas */}
            <div id="reader-camera-oculto" className="hidden"></div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => inputArchivoRef.current && inputArchivoRef.current.click()}
                disabled={procesandoArchivo}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#8C731A] py-3 text-xs font-extrabold text-white hover:bg-[#75600F] transition-all cursor-pointer shadow-md disabled:opacity-50"
                title="Si la cámara no logra leer el código, sube una foto nítida del mismo"
              >
                {procesandoArchivo ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Upload size={16} />
                )}
                <span>{procesandoArchivo ? "Leyendo imagen..." : "Subir Foto del Código"}</span>
              </button>

              <button
                onClick={() => {
                  detenerCamara();
                  setShowCameraModal(false);
                }}
                className="flex-1 rounded-2xl bg-slate-900 py-3 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md"
              >
                Cerrar Cámara
              </button>
            </div>

            <input
              ref={inputArchivoRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={manejarArchivoSeleccionado}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};