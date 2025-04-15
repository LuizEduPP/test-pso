"use client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table, Button, Space, Dropdown, Menu, Checkbox } from "antd";
import { useState } from "react";
import { ArrowLeftOutlined, ArrowRightOutlined, DownOutlined } from "@ant-design/icons";
import LinhaForm from "./LinhaForm";
import LinhaTarefa from "./LinhaTarefa";
import dados from "./dadosAtividades.json";
import dynamic from "next/dynamic";

const DragProvider = dynamic(() => import("../context/DragProvider"), { ssr: false });

const DraggableRow = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props["data-row-key"],
      disabled: false,
    });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "move",
  };

  // Desativar drag se o clique for em um botão/input
  const preventDragOnInteractive = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (["input", "button", "textarea", "select", "svg", "path"].includes(tag)) {
      e.stopPropagation();
    }
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      onPointerDownCapture={preventDragOnInteractive}
      {...attributes}
      {...listeners}
    />
  );
};


export default function TabelaAtividades() {
  const [data, setData] = useState(dados);
  const [collapsed, setCollapsed] = useState({});
  const [selecionados, setSelecionados] = useState({});
  const [agruparPor, setAgruparPor] = useState("projeto");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    record: null,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const mover = active.id;
    const destino = over.id;
  
    const itemMover =
      data.find((item) => item.key === mover) ||
      data.flatMap((i) => i.children || []).find((i) => i.key === mover);
  
    const itemDestino =
      data.find((item) => item.key === destino) ||
      data.flatMap((i) => i.children || []).find((i) => i.key === destino);
  
    if (!itemMover || !itemDestino) return;
  
    // Atualizar projeto do itemMover
    if (itemMover.projeto !== itemDestino.projeto) {
      itemMover.projeto = itemDestino.projeto;
    }
  
    // Remover item da posição antiga
    const novoData = data.map((tarefa) => {
      if (tarefa.key === mover) return null;
      if (tarefa.children) {
        return {
          ...tarefa,
          children: tarefa.children.filter((c) => c.key !== mover),
        };
      }
      return tarefa;
    }).filter(Boolean);
  
    // Inserir item na nova posição do grupo de destino
    const destinoIndex = novoData.findIndex((t) => t.key === itemDestino.key);
    const inserido = !!novoData[destinoIndex];
  
    if (inserido) {
      novoData.splice(destinoIndex + 1, 0, itemMover);
    } else {
      novoData.push(itemMover);
    }
  
    setData(novoData);
  };
  

  const agrupar = (lista) => {
    const grupos = {};
    lista.forEach((tarefa) => {
      const chave = tarefa[agruparPor] || "Outro";
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(tarefa);
    });
    return Object.entries(grupos).map(([nome, tarefas]) => ({ nome, tarefas }));
  };

  const toggleSelecionarGrupo = (nome, tarefas) => {
    const todosSelecionados = tarefas.every((t) => selecionados[t.key]);
    const novos = { ...selecionados };
    tarefas.forEach((t) => {
      novos[t.key] = !todosSelecionados;
      t.children?.forEach((c) => (novos[c.key] = !todosSelecionados));
    });
    setSelecionados(novos);
  };

  const toggleCollapse = (nome) => {
    setCollapsed({ ...collapsed, [nome]: !collapsed[nome] });
  };

  const handleContextMenu = (e, record) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, record });
  };

  const menuItems = [
    { key: "editar", label: "✏️ Editar" },
    { key: "remover", label: "🗑️ Remover" },
    { type: "divider" },
    { key: "acima", label: "➕ Adicionar acima" },
    { key: "abaixo", label: "➕ Adicionar abaixo" },
    { key: "filha", label: "↳ Adicionar filha" },
    { type: "divider" },
    { key: "agile-proj", label: "🔗 Projeto do Agile" },
    { key: "agile-sprint", label: "🔗 Sprint do Agile" },
    { key: "agile-epic", label: "🔗 Épico do Agile" },
    { key: "agile-card", label: "🔗 Card do Agile" },
  ];

  const colunas = [
    {
      title: "",
      dataIndex: "selecionado",
      width: 50,
      render: (_, record) => (
        <Checkbox className=""
        checked={!!record?.key && selecionados[record.key]}
          onChange={(e) =>
            setSelecionados({
              ...selecionados,
              [record.key]: e.target.checked,
            })
          }
        />
      ),
    },
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: "Nome",
      dataIndex: "name",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="name" onUpdate={setData} />
      ),
    },
    {
      title: "Duração",
      dataIndex: "duration",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="duration" onUpdate={setData} />
      ),
    },
    {
      title: "Início",
      dataIndex: "start",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="start" onUpdate={setData} />
      ),
    },
    {
      title: "Fim",
      dataIndex: "end",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="end" onUpdate={setData} />
      ),
    },
  ];

  return (
    <div onClick={() => setContextMenu({ ...contextMenu, visible: false })}>
      <div style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}>
        <Button
          type={agruparPor === "projeto" ? "primary" : "default"}
          onClick={() => setAgruparPor("projeto")}
        >
          Agrupar por Projeto
        </Button>
        <Button
          type={agruparPor === "status" ? "primary" : "default"}
          onClick={() => setAgruparPor("status")}
          style={{ marginLeft: 8 }}
        >
          Agrupar por Status
        </Button>
      </div>

      <DragProvider onDragEnd={handleDragEnd}>
      {agrupar(data).map(({ nome, tarefas }) => {
        const grupoTarefas = collapsed[nome]
          ? []
          : tarefas.map((t) => ({
              ...t,
              children: t.children?.filter(() => !collapsed[nome]),
            }));

        return (
          <div key={nome} style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>{agruparPor.toUpperCase()}: {nome}</h3>
              <Space>
                <Checkbox
                  checked={tarefas.every((t) => selecionados[t.key])}
                  onChange={() => toggleSelecionarGrupo(nome, tarefas)}
                >
                  Selecionar Todos
                </Checkbox>
                <Button
                  size="small"
                  onClick={() => toggleCollapse(nome)}
                  icon={<DownOutlined rotate={collapsed[nome] ? -90 : 0} />}
                />
              </Space>
            </div>

            <SortableContext
              items={grupoTarefas.map((t) => t.key)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                columns={colunas}
                dataSource={grupoTarefas}
                pagination={false}
                rowKey="key"
                bordered
                onRow={(record) => ({
                  onContextMenu: (e) => handleContextMenu(e, record),
                })}
                components={{
                  body: {
                    row: DraggableRow,
                  },
                }}
              />
            </SortableContext>
          </div>
        );
      })}

      {contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #ccc",
            padding: 4,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <Menu
            items={menuItems}
            onClick={() => setContextMenu({ ...contextMenu, visible: false })}
          />
        </div>
      )}
      </DragProvider>
    </div>
  );
}

