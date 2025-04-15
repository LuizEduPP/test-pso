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
import { Table, Button, Space, Dropdown, Menu, Checkbox, Collapse } from "antd";
import { useState } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import LinhaForm from "./LinhaForm";
import LinhaTarefa from "./LinhaTarefa";
import dados from "./dadosAtividades.json";

const DraggableRow = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props["data-row-key"] });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "move",
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

export default function TabelaAtividades() {
  const [data, setData] = useState(dados);
  const [agruparPor, setAgruparPor] = useState("projeto");
  const [collapsed, setCollapsed] = useState({});
  const [selecionados, setSelecionados] = useState({});
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    record: null,
  });

  const atualizar = (novoItem) => {
    const novaLista = data.map((item) => {
      if (item.key === novoItem.key) return novoItem;
      if (item.children) {
        return {
          ...item,
          children: item.children.map((sub) =>
            sub.key === novoItem.key ? novoItem : sub
          ),
        };
      }
      return item;
    });
    setData(novaLista);
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

  const toggleSelecionarGrupo = (grupoNome, tarefas) => {
    const todosSelecionados = tarefas.every((t) => selecionados[t.key]);
    const novos = { ...selecionados };
    tarefas.forEach((t) => {
      novos[t.key] = !todosSelecionados;
      t.children?.forEach((sub) => (novos[sub.key] = !todosSelecionados));
    });
    setSelecionados(novos);
  };

  const toggleCollapse = (grupoNome) => {
    setCollapsed({ ...collapsed, [grupoNome]: !collapsed[grupoNome] });
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
        <Checkbox
          checked={selecionados[record.key]}
          onChange={(e) =>
            setSelecionados({ ...selecionados, [record.key]: e.target.checked })
          }
        />
      ),
    },
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: "Nome",
      dataIndex: "name",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="name" onUpdate={atualizar} />
      ),
    },
    {
      title: "Duração",
      dataIndex: "duration",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="duration" onUpdate={atualizar} />
      ),
    },
    {
      title: "Início",
      dataIndex: "start",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="start" onUpdate={atualizar} />
      ),
    },
    {
      title: "Fim",
      dataIndex: "end",
      render: (_, record) => (
        <LinhaTarefa record={record} campo="end" onUpdate={atualizar} />
      ),
    },
  ];

  const sensors = useSensors(useSensor(PointerSensor));

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

      {agrupar(data).map(({ nome, tarefas }) => {
        const grupoTarefas = collapsed[nome] ? [] : tarefas;
        return (
          <div key={nome} style={{ marginBottom: 48 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3>
                {agruparPor.toUpperCase()}: {nome}
              </h3>
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

            <DndContext sensors={sensors} collisionDetection={closestCenter}>
              <SortableContext
                items={grupoTarefas.map((t) => t.key)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  columns={colunas}
                  dataSource={grupoTarefas}
                  pagination={false}
                  expandable={{ defaultExpandAllRows: true }}
                  rowKey="key"
                  bordered
                  onRow={(record) => ({
                    onContextMenu: (e) => handleContextMenu(e, record),
                  })}
                  rowClassName={(record) =>
                    record.name === "Apontamento Semanal"
                      ? "linha-destaque"
                      : ""
                  }
                  components={{
                    body: {
                      row: DraggableRow,
                    },
                  }}
                />
              </SortableContext>
            </DndContext>
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
    </div>
  );
}

const handleDragEnd = (event) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const mover = active.id;
  const destino = over.id;

  const itemMover =
    data.find((item) => item.key === mover) ||
    data.flatMap((i) => i.children || []).find((i) => i.key === mover);

  const novoData = [...data];

  // Excluir da posição atual
  for (const grupo of novoData) {
    if (grupo.key === mover) {
      const index = novoData.findIndex((g) => g.key === mover);
      novoData.splice(index, 1);
      break;
    }
    if (grupo.children) {
      const idx = grupo.children.findIndex((c) => c.key === mover);
      if (idx > -1) {
        grupo.children.splice(idx, 1);
        break;
      }
    }
  }

  // Inserir em novo local
  let inserido = false;
  for (const grupo of novoData) {
    if (grupo.key === destino) {
      if (!grupo.children) grupo.children = [];
      grupo.children.push(itemMover);
      inserido = true;
      break;
    }
    if (grupo.children?.some((c) => c.key === destino)) {
      const pai = grupo.children.find((c) => c.key === destino);
      if (!pai.children) pai.children = [];
      pai.children.push(itemMover);
      inserido = true;
      break;
    }
  }

  if (!inserido) novoData.push(itemMover);

  setData(novoData);
};
