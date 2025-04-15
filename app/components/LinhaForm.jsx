"use client";
import { Input, Button, Space } from "antd";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";

export default function LinhaForm({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    duration: "",
    start: "",
    end: "",
  });

  const adicionar = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form });
    setForm({ name: "", duration: "", start: "", end: "" });
  };

  return (
    <Space>
      <Input
        size="small"
        placeholder="Nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        size="small"
        placeholder="Duração"
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />
      <Input
        size="small"
        placeholder="Início"
        value={form.start}
        onChange={(e) => setForm({ ...form, start: e.target.value })}
      />
      <Input
        size="small"
        placeholder="Fim"
        value={form.end}
        onChange={(e) => setForm({ ...form, end: e.target.value })}
      />
      <Button icon={<PlusOutlined />} onClick={adicionar} />
    </Space>
  );
}
