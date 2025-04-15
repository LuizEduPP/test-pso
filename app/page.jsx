"use client";

import TabelaAtividades from "./components/TabelaAtividades";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Painel de Atividades</h1>
      <TabelaAtividades />
    </main>
  );
}
