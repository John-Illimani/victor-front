// Mapeo exhaustivo adaptado estrictamente a las actas y fichas ministeriales (Gestión 2026)
export const CONFIGURACION_FICHAS = {
  // ---------------------------------------------------------------------------
  // CUADRO CENTRALIZADOR GENERAL
  // ---------------------------------------------------------------------------
  "CENTRALIZADOR": {
    titulo: "CUADRO CENTRALIZADOR DE EVALUACIÓN IEPC-PEC GESTIÓN 2026",
    esCentralizador: true,
    requiereDatosEstudiante2do: true,
    requiereDatosEstudiante: true,
    calculados: ["promedio_numeral", "promedio_literal", "puntaje_final", "promedio_final"],
    tieneLugarFecha: true,
    tieneObservaciones: true,
    docenteCampo: "docente_acompanante_id",
    docenteRol: "DOCENTE ACOMPAÑANTE / TUTOR",
    docenteGuiaCampo: "docente_guia_id"
  },

  // ---------------------------------------------------------------------------
  // 1ER AÑO DE FORMACIÓN
  // ---------------------------------------------------------------------------
  "1_ACTA_EQUIPO": {
    titulo: "ACTA DE CONFORMACIÓN DEL EQUIPO COMUNITARIO DE INVESTIGACIÓN EDUCATIVA PRODUCCIÓN DE CONOCIMIENTOS PEC (1ER AÑO)",
    esActaEquipoOficial: true,
    tieneLugarFecha: true,
    integrantesCampos: ["apellidos_nombres", "ci"]
  },

  "1_F1": {
    tabla: "ficha_f1_1er_ano_2026",
    titulo: "F-1: ELABORACIÓN Y VALIDACIÓN DE INSTRUMENTOS DE INVESTIGACIÓN",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE DE INVESTIGACIÓN",
    docenteCampo: "docente_investigacion_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "plan_accion_criterio1", label: "Plan de Acción - Elabora y presenta el plan de acción en base a información preliminar.", min: 1, max: 100 },
      { key: "plan_accion_criterio2", label: "Plan de Acción - El plan contempla los tres escenarios geográficos (comunidad, UE, aula).", min: 1, max: 100 },
      { key: "instrumentos_criterio1", label: "Instrumentos - Elabora y presenta instrumentos sellados y validados.", min: 1, max: 100 },
      { key: "instrumentos_criterio2", label: "Instrumentos - Responden a la aplicación en los 3 escenarios geográficos.", min: 1, max: 100 }
    ],
    calculados: ["promedio_numeral", "promedio_literal"],
    tieneObservaciones: true
  },

  "1_F2": {
    tabla: "ficha_f2_1er_ano_2026",
    titulo: "F-2: CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA COMUNITARIA (PEC)",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    esAsistenciaDinamica: true,
    tieneLugarFecha: true,
    diasPredeterminados: 5,
    criterios: [
      { key: "total_dias", label: "Total Días" },
      { key: "total_faltas", label: "Total Faltas" },
      { key: "total_atrasos", label: "Total Atrasos" },
      { key: "porcentaje_asistencia", label: "Porcentaje Total de Asistencia (%)" },
      { key: "valoracion_100", label: "Valoración sobre 100 Puntos", min: 1, max: 100 }
    ]
  },

  "1_F3": {
    tabla: "ficha_f3_1er_ano_2026",
    titulo: "F-3: APLICACIÓN DE TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN EDUCATIVA",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE ACOMPAÑANTE",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "instrumentos_comunidad", label: "Presenta instrumentos aplicados en el contexto de la unidad educativa", min: 1, max: 100 },
      { key: "instrumentos_ue", label: "Presenta instrumentos aplicados en la UE/CEA/CEE", min: 1, max: 100 },
      { key: "instrumentos_aula", label: "Presenta instrumentos aplicados en el AULA", min: 1, max: 100 }
    ],
    calculados: ["promedio_numeral", "promedio_literal"],
    tieneObservaciones: true
  },

  "1_F4": {
    tabla: "ficha_f4_1er_ano_2026",
    titulo: "F-4: SEGUIMIENTO DE LA/EL DOCENTE GUÍA Y DIRECTOR DE UE/CEA/CEE",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "dimension_ser", label: "SER: Demuestra puntualidad, respeto y proactividad.", min: 1, max: 100 },
      { key: "dimension_saber", label: "SABER: Demuestra conocimientos sobre la realidad educativa.", min: 1, max: 100 },
      { key: "dimension_hacer", label: "HACER: Realiza con esmero y diligencia las actividades planificadas.", min: 1, max: 100 },
      { key: "dimension_decidir", label: "DECIDIR: Muestra iniciativa, creatividad y compromiso de cambio.", min: 1, max: 100 }
    ],
    calculados: ["promedio_numeral", "promedio_literal"],
    tieneObservaciones: true
  },

  "1_F5": {
    tabla: "ficha_f5_1er_ano_2026",
    titulo: "F-5: VALORACIÓN DE LA PRODUCCIÓN DE CONOCIMIENTOS DE LA IEPC-PEC",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE ACOMPAÑANTE",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "coherencia_contenido", label: "El contenido del informe es coherente con los datos de instrumentos Describe características económicas, socioculturales, políticas, demográficas", min: 1, max: 100 },
      { key: "descripcion_comunidad", label: "Describe características económicas, socioculturales, políticas, demográficas", min: 1, max: 100 },
      { key: "ambitos_estructura", label: "Describe con amplitud los ámbitos institucionales y curriculares", min: 1, max: 100 },
      { key: "desarrollo_procesos", label: "Describe los aspectos observados en los procesos educativos", min: 1, max: 100 },
      { key: "redaccion_ortografia", label: "Redacción coherente y sin errores ortográficos", min: 1, max: 100 }
    ],
    calculados: ["promedio_numeral", "promedio_literal"],
    tieneObservaciones: true
  },

  // ---------------------------------------------------------------------------
  // 2DO AÑO DE FORMACIÓN
  // ---------------------------------------------------------------------------
  "2_ACTA_INICIO": {
    titulo: "ACTA DE INICIO - INVESTIGACIÓN EDUCATIVA Y PRODUCCIÓN DE CONOCIMIENTOS PRÁCTICA EDUCATIVA COMUNITARIA (2DO AÑO)",
    esActaInicioOficial: true,
    tieneLugarFecha: true,
    integrantesCampos: ["apellidos_nombres", "especialidad", "ci"]
  },

  "2_ACTA_EQUIPO": {
    titulo: "ACTA DE CONFORMACIÓN DEL EQUIPO COMUNITARIO DE INVESTIGACIÓN EDUCATIVA Y PRODUCCIÓN DE CONOCIMIENTOS PRÁCTICA EDUCATIVA COMUNITARIA",
    esActaEquipoOficial: true,
    tieneLugarFecha: true,
    integrantesCampos: ["apellidos_nombres", "especialidad", "ci"]
  },

  "2_F1": {
    tabla: "ficha_f1_2do_ano_2026",
    titulo: "FICHA F-1: COORDINACIÓN Y GESTIÓN COMUNITARIA CON LA UE/CEA/CEE",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE IEPC-PEC",
    docenteCampo: "docente_iepc_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "plan_accion_preliminar", label: "Elabora y presenta el Plan de Acción al docente de Investigación, tomando como base a información preliminar recabada.", min: 1, max: 100 },
      { key: "plan_accion_tres_escenarios", label: "El Plan de Acción contempla la observación a los tres escenarios geográficos: comunidad, UE/CEA/CEE y aula.", min: 1, max: 100 },
      { key: "instrumentos_sellados", label: "Elabora y presenta los instrumentos debidamente sellados y validados.", min: 1, max: 100 },
      { key: "instrumentos_tres_escenarios", label: "Los instrumentos validados responden a su aplicación en los tres escenarios geográficos definidos.", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"],
    tieneObservaciones: true
  },

  "2_F2": {
    tabla: "ficha_f2_2do_ano_2026",
    titulo: "FICHA F-2: ASISTENCIA: PRÁCTICA EDUCATIVA COMUNITARIA (PEC)",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    esAsistenciaDinamica: true,
    tieneLugarFecha: true,
    diasPredeterminados: 10
  },

  "2_F3": {
    tabla: "ficha_f3_2do_ano_2026",
    titulo: "FICHA F-3: APLICACIÓN DE TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN EDUCATIVA",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE ACOMPAÑANTE IEPC-PEC",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "instrumentos_comunidad", label: "Presenta los instrumentos diseñados y aplicados adecuadamente según el contexto de la comunidad educativa.", min: 1, max: 100 },
      { key: "instrumentos_ue", label: "Presenta los instrumentos aplicados en la UE/CEA/CEE de manera participativa y respetando los principios éticos en la investigación.", min: 1, max: 100 },
      { key: "instrumentos_aula", label: "Presenta instrumentos aplicados en el aula de manera coherente con los objetivos de la práctica.", min: 1, max: 100 },
      { key: "categorias_analisis", label: "Identifica y explica las categorías de análisis que se desprenden de la información recogida en los instrumentos.", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"],
    tieneObservaciones: true
  },

  "2_F4": {
    tabla: "ficha_f4_2do_ano_2026",
    titulo: "FICHA F-4: APOYO Y SEGUIMIENTO DEL DOCENTE GUÍA DE UE/CEA/CEE A LA CONCRECIÓN CURRICULAR",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    tieneLugarFecha: true,
    esMatrizPdc: true,
    criteriosPdc: [
      { key: "coherencia_elementos", label: "Existe coherencia entre los diferentes elementos curriculares del PDC." },
      { key: "conocimiento_contenidos", label: "Demuestra conocimiento de los contenidos de su especialidad." },
      { key: "recursos_materiales", label: "Utiliza recursos/materiales de apoyo, promoviendo la participación y desarrollo de capacidades, habilidades y/o potencialidades en las/os estudiantes." },
      { key: "estrategias_metodologicas", label: "Demuestra compromiso a través de la aplicación de estrategias metodológicas para el desarrollo de capacidades creativas, propositivas en las/los estudiantes." },
      { key: "valores_respeto", label: "Demuestra respeto, responsabilidad, puntualidad, trato cortés y amable con cada uno de los miembros de la UE/CEA/CEE." }
    ],
    calculados: ["promedio_total"],
    tieneObservaciones: true
  },

  "2_F5": {
    tabla: "ficha_f5_2do_ano_2026",
    titulo: "FICHA F-5: VALORACIÓN DE LA/EL DOCENTE ACOMPAÑANTE DE LA ESFM/UA",
    requiereDatosEstudiante2do: true,
    docenteRol: "DOCENTE ACOMPAÑANTE DE LA ESFM/UA",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: false,
    criteriosEtapas: [
      {
        etapa: "Antes de la PEC (Planificación y organización para la concreción curricular)",
        criterios: [
          { key: "presenta_pdc", label: "Presenta el Plan de Desarrollo Curricular y otros documentos de apoyo requeridos para el desarrollo de la práctica." },
          { key: "guia_concrecion", label: "Elabora la guía de concreción del PDC de manera clara, precisa y coherente con el proceso formativo." }
        ]
      },
      {
        etapa: "Durante la PEC (Concreción curricular e investigación educativa en el marco de la práctica educativa comunitaria)",
        criterios: [
          { key: "responsabilidad_puntualidad", label: "Demuestra responsabilidad y puntualidad en el desarrollo de la práctica educativa comunitaria y del proceso investigativo en la UE/CEA/CEE." },
          { key: "iniciativa_creatividad", label: "Manifiesta iniciativa, creatividad y dominio en la concreción curricular y en las actividades vinculadas al diagnóstico socioparticipativo." },
          { key: "aplica_tecnicas_instrumentos", label: "Aplica técnicas e instrumentos de investigación de manera pertinente para la identificación, análisis y priorización de necesidades, problemáticas y/o potencialidades." }
        ]
      }
    ],
    calculados: ["puntaje_final", "promedio_literal"]
  },

  "2_F6": {
    tabla: "ficha_f6_2do_ano_2026",
    titulo: "FICHA F-6: VALORACIÓN DE LA PRODUCCIÓN DE CONOCIMIENTOS DE LA IEPC-PEC",
    requiereDatosEstudiante2do: true,
    docenteRol: "DOCENTE ACOMPAÑANTE DE LA ESFM/UA",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: true,
    criteriosQualitativos: [
      { key: "coherencia_contenido", label: "El contenido del informe concuerda con los datos plasmados en los instrumentos aplicados. Describe las características económicas, socioculturales, políticas, demográficas de la comunidad." },
      { key: "ambitos_estructura", label: "Describe con amplitud los ámbitos descritos en la estructura del informe (ámbito institucional, curricular, clima institucional, gestión administrativa y otros)." },
      { key: "procesos_educativos", label: "Describe los aspectos observados en el desarrollo de los procesos educativos: Estrategias pedagógico-didácticas, gestión de aula, procesos de evaluación, etc." },
      { key: "redaccion_originalidad", label: "La redacción de la Sistematización de Experiencias es coherente y sin errores ortográficos. La redacción es original y propia." }
    ],
    calculados: ["promedio_final", "promedio_literal"],
    tieneObservaciones: true
  },

  // ---------------------------------------------------------------------------
  // 3ER AÑO DE FORMACIÓN
  // ---------------------------------------------------------------------------
  "3_ACTA_EQUIPO": {
    titulo: "ACTA DE CONFORMACIÓN Y COMPROMISO DEL EQUIPO COMUNITARIO (3ER AÑO)",
    esActaEquipoOficial: true,
    tieneLugarFecha: true,
    integrantesCampos: ["apellidos_nombres", "ci", "nro_celular"]
  },

  "3_ACTA_INICIO": {
    titulo: "ACTA DE INICIO - 3ER AÑO DE FORMACIÓN (IEPC-PEC)",
    esActaInicioOficial: true,
    tieneLugarFecha: true,
    integrantesCampos: ["apellidos_nombres", "ci"]
  },

  "3_ACTA_SOCIALIZACION": {
    titulo: "ACTA DE SOCIALIZACIÓN DEL DIAGNÓSTICO - 3ER AÑO",
    esActaSocializacionOficial: true,
    tieneLugarFecha: true
  },

  "3_A1": {
    tabla: "ficha_a1_3er_ano_2026",
    titulo: "A-1: TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE DE INVESTIGACIÓN",
    docenteCampo: "docente_investigacion_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "diseno_validacion", label: "Diseño y validación de técnicas e instrumentos de investigación", min: 1, max: 100 },
      { key: "aplicacion_tecnicas", label: "Aplicación de técnicas e instrumentos de investigación", min: 1, max: 100 },
      { key: "orden_analisis_interpretacion", label: "Orden, análisis, reflexión e interpretación de la información", min: 1, max: 100 }
    ],
    calculados: ["puntaje_final", "promedio_literal"],
    tieneObservaciones: true
  },

  "3_B1": {
    tabla: "ficha_b1_3er_ano_2026",
    titulo: "B-1: APOYO Y SEGUIMIENTO DEL DOCENTE ACOMPAÑANTE DE LA ESFM/UA",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE ACOMPAÑANTE",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "antes_pec_pdc", label: "Antes de la PEC: Presenta PDC y guía de concreción clara", min: 1, max: 100 },
      { key: "antes_pec_pdc", label: "Antes de la PEC: Presenta PDC y guía de concreción clara", min: 1, max: 100 },
      { key: "durante_pec_desempeno", label: "Durante la PEC: Responsabilidad, puntualidad y creatividad", min: 1, max: 100 },
      { key: "durante_pec_tecnicas", label: "Durante la PEC: Aplicación pertinente de instrumentos", min: 1, max: 100 }
    ],
    calculados: ["puntaje_final", "promedio_literal"],
    tieneRecomendaciones: true
  },

  "3_B2": {
    tabla: "ficha_b2_3er_ano_2026",
    titulo: "B-2: ASISTENCIA - PRÁCTICA EDUCATIVA COMUNITARIA (4 SEMANAS)",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    esAsistenciaSemanas: true,
    tieneLugarFecha: true,
    semanasPredeterminados: 4
  },

  "3_B3": {
    tabla: "ficha_b3_3er_ano_2026",
    titulo: "B-3: APOYO Y SEGUIMIENTO DEL DOCENTE GUÍA EN CONCRECIÓN CURRICULAR",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    tieneLugarFecha: true,
    esMatrizPdc: true,
    criteriosPdc: [
      { key: "coherencia_elementos", label: "Coherencia entre objetivo, contenidos, procesos pedagógicos y evaluación." },
      { key: "conocimiento_contenidos", label: "Muestra conocimiento profundo de los contenidos de su especialidad y dominio de aula." },
      { key: "estrategias_metodologicas", label: "Promueve trabajo en equipo, actividades para aprender haciendo y uso de materiales." },
      { key: "evaluacion", label: "Realiza la evaluación según el objetivo y utiliza instrumentos." }
    ],
    calculados: ["promedio_total"],
    tieneObservaciones: true
  },

  "3_B4": {
    tabla: "ficha_b4_3er_ano_2026",
    titulo: "B-4: SEGUIMIENTO Y APOYO DEL DOCENTE TUTOR / ACOMPAÑANTE",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "ser_nota", label: "Dimensión SER (Puntualidad, respeto y valores)", min: 1, max: 100 },
      { key: "saber_nota", label: "Dimensión SABER (Conocimiento curricular y especialidad)", min: 1, max: 100 },
      { key: "hacer_nota", label: "Dimensión HACER (Dominio de aula, creatividad y recursos)", min: 1, max: 100 },
      { key: "decidir_nota", label: "Dimensión DECIDIR (Asume observaciones y soluciones oportunas)", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"],
    tieneObservaciones: true
  },

  "3_B5": {
    tabla: "ficha_b5_3er_ano_2026",
    titulo: "B-5: PRESENTACIÓN DEL INFORME DEL DIAGNÓSTICO SOCIOPARTICIPATIVO",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE ACOMPAÑANTE",
    docenteCampo: "docente_acompanante_id",
    tieneLugarFecha: true,
    criteriosQualitativos: [
      { key: "contexto_educativo", label: "Descripción del contexto educativo y características de la UE/CEA/CEE", min: 1, max: 100 },
      { key: "analisis_informacion", label: "Análisis de la información (social, económico, cultural)", min: 1, max: 100 },
      { key: "nudo_problematico", label: "Formulación adecuada del nudo problemático", min: 1, max: 100 },
      { key: "preguntas_problematizadoras", label: "Preguntas problematizadoras pertinentes al nudo", min: 1, max: 100 },
      { key: "claridad_redaccion", label: "Claridad y coherencia en la redacción, uso de normas APA", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"],
    tieneObservaciones: true
  },

  // ---------------------------------------------------------------------------
  // 4TO AÑO DE FORMACIÓN Y TRABAJO DE GRADO
  // ---------------------------------------------------------------------------
  "4_A1": {
    tabla: "ficha_a1_4to_ano_2026",
    titulo: "A-1: TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE DE INVESTIGACIÓN",
    docenteCampo: "docente_investigacion_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "diseno_validacion", label: "Diseño y validación de técnicas e instrumentos de investigación", min: 1, max: 100 },
      { key: "aplicacion_tecnicas", label: "Aplicación de técnicas e instrumentos de investigación", min: 1, max: 100 },
      { key: "orden_analisis_interpretacion", label: "Orden, análisis, reflexión e interpretación de la información", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"],
    tieneObservaciones: true
  },

  "4_A2": {
    tabla: "ficha_a2_pdc_2026",
    titulo: "A-2: ELABORACIÓN DE PLANES DE DESARROLLO CURRICULAR (PDC)",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE TUTOR ACOMPAÑANTE",
    docenteCampo: "docente_tutor_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "objetivo_claridad", label: "Claridad en el planteamiento del objetivo respecto a resultados", min: 1, max: 100 },
      { key: "procesos_pedagogicos", label: "Planteamiento coherente de procesos pedagógicos según contenido", min: 1, max: 100 },
      { key: "recursos_materiales", label: "Recursos y materiales educativos pertinentes", min: 1, max: 100 },
      { key: "estrategias_evaluacion", label: "Planteamiento de estrategias e instrumentos de evaluación coherentes", min: 1, max: 100 },
      { key: "articulacion_elementos", label: "Articulación adecuada entre elementos curriculares del PDC", min: 1, max: 100 }
    ],
    calculados: ["promedio_numeral", "promedio_literal"],
    tieneObservaciones: true
  },

  "4_B1": {
    tabla: "ficha_b1_4to_ano_2026",
    titulo: "B-1: CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA COMUNITARIA (6 SEMANAS)",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    esAsistenciaSemanas: true,
    tieneLugarFecha: true,
    semanasPredeterminados: 6
  },

  "4_B6": {
    tabla: "ficha_b6_seguimiento_tutor_2026",
    titulo: "B-6: SEGUIMIENTO Y APOYO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE TUTOR",
    docenteCampo: "docente_tutor_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "primera_valoracion", label: "Primera Valoración (1 a 100 Puntos)", min: 1, max: 100 },
      { key: "segunda_valoracion", label: "Segunda Valoración (1 a 100 Puntos)", min: 1, max: 100 }
    ],
    calculados: ["promedio_parcial", "promedio_literal"],
    tieneObservaciones: true
  },

  "4_B7": {
    tabla: "ficha_b7_diagnostico_ue_2026",
    titulo: "B-7: DIAGNÓSTICO SOCIOPARTICIPATIVO DE LA UE/CEA/CEE",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE GUÍA",
    docenteCampo: "docente_guia_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "caracteristicas_contexto", label: "Características económicas, socioculturales y políticas", min: 1, max: 100 },
      { key: "descripcion_ue", label: "Descripción de la UE (ubicación, datos estadísticos)", min: 1, max: 100 },
      { key: "procesos_educativos", label: "Características del proceso educativo observadas", min: 1, max: 100 },
      { key: "gestion_institucional", label: "Características de la gestión institucional", min: 1, max: 100 },
      { key: "procesamiento_informacion", label: "Organización y procesamiento de la información", min: 1, max: 100 },
      { key: "identificacion_problemas", label: "Identificación y priorización de problemas y necesidades", min: 1, max: 100 },
      { key: "nudo_problematico", label: "Formulación del nudo problemático y preguntas", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"]
  },

  "4_C1": {
    tabla: "ficha_c1_diseno_metodologico_2026",
    titulo: "C-1: EVALUACIÓN DEL DOCUMENTO DE DISEÑO METODOLÓGICO",
    requiereDatosEstudiante: true,
    docenteRol: "DOCENTE TUTOR",
    docenteCampo: "docente_tutor_id",
    tieneLugarFecha: true,
    criterios: [
      { key: "criterio1_participativa", label: "1. Elaboración participativa y corresponsable (0-10 pts)", min: 0, max: 10 },
      { key: "criterio2_lectura_realidad", label: "2. Lectura analítica y clara de la realidad (0-10 pts)", min: 0, max: 10 },
      { key: "criterio3_problematizacion", label: "3. Planteamiento de la problematización (0-10 pts)", min: 0, max: 10 },
      { key: "criterio4_herramientas", label: "4. Herramientas e instrumentos adecuados (0-10 pts)", min: 0, max: 10 },
      { key: "criterio5_analisis_interpretacion", label: "5. Análisis e interpretación sistemática (0-10 pts)", min: 0, max: 10 },
      { key: "criterio6_lectura_textos", label: "6. Selección y lectura pertinente de textos (0-10 pts)", min: 0, max: 10 },
      { key: "criterio7_propuesta_transformadora", label: "7. Propuesta transformadora e integral (0-10 pts)", min: 0, max: 10 },
      { key: "criterio8_socializacion_comunidad", label: "8. Socialización con la comunidad educativa (0-10 pts)", min: 0, max: 10 },
      { key: "criterio9_implementacion", label: "9. Propuesta de implementación coherente (0-10 pts)", min: 0, max: 10 },
      { key: "criterio10_apa7", label: "10. Uso adecuado de normas APA 7ma edición (0-10 pts)", min: 0, max: 10 }
    ],
    textosBasicos: ["titulo_diseno", "modalidad_graduacion"],
    calculados: ["puntaje_final", "puntaje_literal"]
  },

  "4_C2": {
    tabla: "ficha_c2_socializacion_comunitaria_2026",
    titulo: "C-2: SOCIALIZACIÓN DEL DISEÑO METODOLÓGICO DE TRABAJO DE GRADO",
    esComision: true,
    requiereDatosEstudiante: true,
    tieneLugarFecha: true,
    criterios: [
      { key: "puntaje_documento", label: "Puntaje Documento Escrito (1 a 100)", min: 1, max: 100 },
      { key: "puntaje_socializacion", label: "Puntaje Socialización Oral (1 a 100)", min: 1, max: 100 }
    ],
    calculados: ["promedio_final", "promedio_literal"]
  }
};

export const DEPARTAMENTOS_BOLIVIA = ["La Paz", "Cochabamba", "Santa Cruz", "Oruro", "Potosí", "Tarija", "Chuquisaca", "Beni", "Pando"];
export const MESES_ANIO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const ESPECIALIDADES_ESFM = [
  "Educación Primaria Comunitaria Vocacional",
  "Educación Inicial en Familia Comunitaria",
  "Educación Física y Deportes",
  "Educación Musical",
  "Artes Plásticas y Visuales",
  "Cosmovisiones, Filosofía y Psicología",
  "Valores, Espiritualidad y Religiones",
  "Ciencias Sociales",
  "Lengua Extranjera (Inglés/Quechua/Aymara)",
  "Matemática",
  "Física - Química",
  "Biología - Geografía",
  "Técnica Tecnológica General / Productiva"
];

export const convertirNumeroALiteral = (num) => {
  const unidades = ["CERO", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];

  const entero = Math.floor(num || 0);
  const decimales = Math.round(((num || 0) - entero) * 100);
  const strDecimal = decimales < 10 ? `0${decimales}` : `${decimales}`;

  let textoEntero = "";
  if (entero === 100) textoEntero = "CIEN";
  else if (entero >= 10 && entero <= 19) textoEntero = especiales[entero - 10];
  else if (entero >= 20 && entero < 100) {
    const d = Math.floor(entero / 10);
    const u = entero % 10;
    textoEntero = u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
  } else if (entero < 10) {
    textoEntero = unidades[entero];
  }

  return `${textoEntero} CON ${strDecimal}/100`;
};


// src/utils/camposFichas.js

export const MODALIDADES_GRADUACION_ESFM = [
  "Investigación Educativa Producción de Conocimientos",
  "Sistematización de Experiencias Transformadoras",
  "Investigación Acción Participativa"
];