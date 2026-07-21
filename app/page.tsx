import type { Metadata } from "next";
import OracleRoom from "./oracle-room";

export const metadata: Metadata = {
  title: "尻ノ間｜3Dオラクル・プロトタイプ",
  description: "デッキと世界観を差し替えて使える、3Dカードシャッフルシステムの試作です。",
  other: {
    "codex-preview": "development",
  },
};

export default function Home() {
  return <OracleRoom />;
}
