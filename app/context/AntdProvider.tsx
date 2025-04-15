"use client";

import { ConfigProvider, theme } from "antd";
import ptBR from "antd/locale/pt_BR";
import React from "react";

export default function AntdProvider({ children }) {
  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          colorText: "#1f1f1f",
          borderRadius: 6,
          colorBgContainer: "#ffffff",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
