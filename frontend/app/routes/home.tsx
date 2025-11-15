import type { Route } from "./+types/home";
import { Dashboard } from "../components/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EchoMint - Living Market Mood NFTs" },
    { name: "description", content: "NFTs that evolve in real-time based on market sentiment and volatility. Powered by Arkiv, Hyperbridge, and Kusama." },
  ];
}

export default function Home() {
  return <Dashboard />;
}
