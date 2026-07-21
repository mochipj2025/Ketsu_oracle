import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import OracleRoom from "../../app/oracle-room";
import "../../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Oracle root element was not found");
}

createRoot(root).render(
  <StrictMode>
    <OracleRoom />
  </StrictMode>,
);
