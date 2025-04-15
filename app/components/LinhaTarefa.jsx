"use client";
import { useState } from "react";
import { Input, DatePicker } from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";

export default function LinhaTarefa({ record, campo, onUpdate }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(record[campo]);

  const salvar = () => {
    setEditando(false);
    if (valor !== record[campo]) {
      onUpdate({ ...record, [campo]: valor });
    }
  };

  const isDate = campo === "start" || campo === "end";
  const isSubtarefa = !!record.parentKey || record.id?.toString().includes(".");

  if (editando) {
    return isDate ? (
      <DatePicker
        defaultValue={dayjs(valor, "DD/MM/YYYY")}
        format="DD/MM/YYYY"
        size="small"
        onChange={(d, ds) => {
          setValor(ds);
          setTimeout(salvar, 100);
        }}
        onBlur={salvar}
        autoFocus
      />
    ) : (
      <Input
        size="small"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={salvar}
        onPressEnter={salvar}
        autoFocus
      />
    );
  }

  const tipoIcone = {
    validacao: "mdi:check-decagram",
    reuniao: "mdi:account-group",
    desenvolvimento: "mdi:code-tags",
    aprovacao: "mdi:clipboard-check",
    outro: "mdi:clipboard-text",
  };

  const icone = tipoIcone[record.tipo] || tipoIcone.outro;

  const estilo = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    paddingLeft: isSubtarefa ? 24 : 0,
    fontWeight: isSubtarefa ? "normal" : "bold",
    color: isSubtarefa ? "#444" : "#000",
    cursor: "pointer",
  };

  return (
    <div style={estilo} onClick={() => setEditando(true)}>
      {campo === "name" && (
        <Icon
          icon={isSubtarefa ? "mdi:subdirectory-arrow-right" : "mdi:folder"}
        />
      )}
      {valor}
    </div>
  );
}
