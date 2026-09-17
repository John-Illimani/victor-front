import React from "react";
import { useParams } from "react-router-dom";
import { ActaAnoView } from "./ActaAnoView";

export const ActaAnoContainer = () => {
  // Extrae los valores directamente de la URL
  const { gestion, ano } = useParams();

  return <ActaAnoView gestion={gestion} ano={ano} />;
};