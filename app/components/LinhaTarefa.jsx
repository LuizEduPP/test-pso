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

  const estilo = {
    display: "flex",
    alignItems: "center",
    paddingLeft: isSubtarefa ? 24 : 0,
    fontWeight: isSubtarefa ? "normal" : "bold",
    color: isSubtarefa ? "#ff6600" : "#000",
    cursor: "pointer",
   };

  return (
    <div
      style={estilo}
      onClick={() => setEditando(true)}
     >
      {campo === "name" && (
        <Icon
          icon={isSubtarefa ? "mdi:file" : "mdi:folder"}
        />
      )}
      {valor}
    </div>
  );
}
