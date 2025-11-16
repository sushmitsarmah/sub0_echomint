// Load polyfills first
import "./polyfills";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import { LunoKitProvider } from '@luno-kit/ui'
import { defineChain } from '@luno-kit/react/utils'
import { createConfig } from '@luno-kit/react'
import { paseo } from '@luno-kit/react/chains'
import { polkadotjsConnector, subwalletConnector, talismanConnector } from '@luno-kit/react/connectors'
import '@luno-kit/ui/styles.css'

const passetHub = defineChain({
  genesisHash: '0xfd974cf9eaf028f5e44b9fdd1949ab039c6cf9cc54449b0b60d71b042e79aeb6',
  name: 'Paseo - Passet Hub',
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 12,
  },
  rpcUrls: {
    webSocket: ['wss://testnet-passet-hub.polkadot.io'],
  },
  ss58Format: 42,
  testnet: true,
  chainIconUrl: 'https://raw.githubusercontent.com/polkadot-js/apps/master/packages/apps-config/src/ui/logos/chains/paseo.svg',
})

const config = createConfig({
  appName: 'EchoMint',
  chains: [passetHub],
  connectors: [polkadotjsConnector(), subwalletConnector(), talismanConnector()],
})

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <LunoKitProvider config={config}>
    <Outlet />
  </LunoKitProvider>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
