/**
 * Animated Background Logo
 * Displays the EchoMint logo in the background with low opacity and subtle animations
 */

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary logo - center with slow rotation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow">
        <img
          src="/logo.png"
          alt=""
          className="w-[500px] h-[500px] opacity-20 object-contain"
        />
      </div>

      {/* Secondary logo - top right with pulse */}
      <div className="absolute top-20 right-20 animate-pulse-slow">
        <img
          src="/logo.png"
          alt=""
          className="w-[300px] h-[300px] opacity-15 object-contain"
        />
      </div>

      {/* Tertiary logo - bottom left with float */}
      <div className="absolute bottom-20 left-20 animate-float">
        <img
          src="/logo.png"
          alt=""
          className="w-[300px] h-[300px] opacity-15 object-contain"
        />
      </div>

      {/* Gradient overlay for better content visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/40" />
    </div>
  );
}
