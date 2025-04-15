import "antd/dist/reset.css";
import "./globals.css";
import AntdProvider from "./context/AntdProvider";

export const metadata = {
  title: "Painel de Atividades",
  description: "Tabela com drag, edição inline e formulários inteligentes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
