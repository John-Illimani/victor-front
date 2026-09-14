import React, { useState } from 'react';
import { FileText, Award, CheckCircle } from 'lucide-react';

import { ActaConformacion1erAno } from './ActaConformacion1erAno';
import { FichaF1_1erAno } from './FichaF1_1erAno';
import { FichaF2_1erAno } from './FichaF2_1erAno';
import { FichaF3_1erAno } from './FichaF3_1erAno';
import { FichaF4_1erAno } from './FichaF4_1erAno';
import { FichaF5_1erAno } from './FichaF5_1erAno';
import { Centralizador1erAno } from './Centralizador1erAno';

export const GestionFichas1erAnoPadre = ({ estudianteSeleccionado, listaDocentes = [] }) => {
  const [modalActivo, setModalActivo] = useState(null);

  // Estados de datos independientes por ficha
  const [datosActa, setDatosActa] = useState({});
  const [datosF1, setDatosF1] = useState({});
  const [datosF2, setDatosF2] = useState({});
  const [datosF3, setDatosF3] = useState({});
  const [datosF4, setDatosF4] = useState({});
  const [datosF5, setDatosF5] = useState({});
  const [datosCentralizador, setDatosCentralizador] = useState({});

  const modalesFichas = [
    { key: 'ACTA', titulo: 'Acta de Conformación de Equipo', sub: 'Registro inicial de integrantes PEC', icon: FileText, color: 'border-l-slate-600' },
    { key: 'F1', titulo: 'Ficha F-1: Elaboración y Validación de Instrumentos', sub: 'Evaluación de Plan de Acción e Instrumentos', icon: FileText, color: 'border-l-blue-600' },
    { key: 'F2', titulo: 'Ficha F-2: Control de Asistencia PEC', sub: 'Registro diario de 10 días PEC', icon: FileText, color: 'border-l-amber-600' },
    { key: 'F3', titulo: 'Ficha F-3: Aplicación de Técnicas e Instrumentos', sub: 'Evaluación en Comunidad, UE y Aula', icon: FileText, color: 'border-l-emerald-600' },
    { key: 'F4', titulo: 'Ficha F-4: Seguimiento Docente Guía y Director', sub: 'Evaluación por Dimensiones (Ser, Saber, Hacer, Decidir)', icon: FileText, color: 'border-l-purple-600' },
    { key: 'F5', titulo: 'Ficha F-5: Valoración de Producción de Conocimientos', sub: 'Sistematización de Experiencias IEPC-PEC', icon: FileText, color: 'border-l-rose-600' },
    { key: 'CENTRALIZADOR', titulo: 'Cuadro Centralizador de Evaluación', sub: 'Consolidado Final 1er Año de Formación', icon: Award, color: 'border-l-[#801B28] bg-rose-50/30' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-[#801B28] uppercase">
            GESTOR DE FICHAS Y ACTAS - 1ER AÑO DE FORMACIÓN
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Estudiante: <strong className="text-slate-800">{estudianteSeleccionado ? `${estudianteSeleccionado.nombre} ${estudianteSeleccionado.apellido}` : 'No seleccionado'}</strong>
          </p>
        </div>
      </div>

      {/* Grid de botones para abrir los modales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modalesFichas.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setModalActivo(item.key)}
              className={`p-4 bg-white rounded-2xl border border-slate-200 border-l-4 ${item.color} shadow-sm hover:shadow-md transition-all text-left flex justify-between items-center group`}
            >
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 text-xs block group-hover:text-[#801B28] transition-colors">
                  {item.titulo}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {item.sub}
                </span>
              </div>
              <Icon size={20} className="text-slate-400 group-hover:text-[#801B28] transition-colors shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Renderizado Condicional de Modales */}
      <ActaConformacion1erAno
        isOpen={modalActivo === 'ACTA'}
        onClose={() => setModalActivo(null)}
        fichaData={datosActa}
        setFichaData={setDatosActa}
        estudianteSeleccionado={estudianteSeleccionado}
      />

      <FichaF1_1erAno
        isOpen={modalActivo === 'F1'}
        onClose={() => setModalActivo(null)}
        fichaData={datosF1}
        setFichaData={setDatosF1}
        listaDocentes={listaDocentes}
        estudianteSeleccionado={estudianteSeleccionado}
      />

      <FichaF2_1erAno
        isOpen={modalActivo === 'F2'}
        onClose={() => setModalActivo(null)}
        fichaData={datosF2}
        setFichaData={setDatosF2}
        listaDocentes={listaDocentes}
        estudianteSeleccionado={estudianteSeleccionado}
      />

      <FichaF3_1erAno
        isOpen={modalActivo === 'F3'}
        onClose={() => setModalActivo(null)}
        fichaData={datosF3}
        setFichaData={setDatosF3}
        listaDocentes={listaDocentes}
        estudianteSeleccionado={estudianteSeleccionado}
      />

      <FichaF4_1erAno
        isOpen={modalActivo === 'F4'}
        onClose={() => setModalActivo(null)}
        fichaData={datosF4}
        setFichaData={setDatosF4}
        listaDocentes={listaDocentes}
        estudianteSeleccionado={estudianteSeleccionado}
      />

      <FichaF5_1erAno
        isOpen={modalActivo === 'F5'}
        onClose={() => setModalActivo(null)}
        fichaData={datosF5}
        setFichaData={setDatosF5}
        listaDocentes={listaDocentes}
        estudianteSeleccionado={estudianteSeleccionado}
      />

      <Centralizador1erAno
        isOpen={modalActivo === 'CENTRALIZADOR'}
        onClose={() => setModalActivo(null)}
        fichaData={datosCentralizador}
        setFichaData={setDatosCentralizador}
        listaDocentes={listaDocentes}
        estudianteSeleccionado={estudianteSeleccionado}
      />
    </div>
  );
};