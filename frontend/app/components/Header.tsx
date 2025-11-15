import { Link } from "react-router";
import { Button } from "./ui/button";
import { ConnectButton } from '@luno-kit/ui'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo and brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-primary-foreground">E</span>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent opacity-0 blur-md group-hover:opacity-50 transition-opacity" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Echo<span className="text-primary">Mint</span>
            </h1>
            <p className="text-xs text-muted-foreground">Market Mood NFTs</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#">Gallery</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#">About</a>
          </Button>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}
