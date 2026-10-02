import React, { useEffect, useRef } from 'react';

interface DecisionGraphNodesProps {
  className?: string;
  activeStage?: number;
}

export const DecisionGraphNodes: React.FC<DecisionGraphNodesProps> = ({
  className = '',
  activeStage = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    // Nodes representing a real decision graph
    const nodes = [
      { id: 'context', label: 'CONTEXT', x: 0.15, y: 0.35, vx: 0.0001, vy: 0.0002, r: 4 },
      { id: 'role', label: 'Offer ₹8L', x: 0.28, y: 0.22, vx: -0.0002, vy: 0.0001, r: 3 },
      { id: 'commute', label: 'Commute 45m', x: 0.22, y: 0.58, vx: 0.0001, vy: -0.0001, r: 3 },
      { id: 'evidence', label: 'EVIDENCE', x: 0.45, y: 0.40, vx: 0.0002, vy: 0.0001, r: 5 },
      { id: 'wageGov', label: 'TN Wage 96%', x: 0.48, y: 0.20, vx: -0.0001, vy: 0.0002, r: 3 },
      { id: 'costLiving', label: 'Cost Index -22%', x: 0.52, y: 0.65, vx: 0.0001, vy: -0.0002, r: 3 },
      { id: 'scenarios', label: 'SCENARIOS', x: 0.68, y: 0.35, vx: 0.0001, vy: 0.0001, r: 4.5 },
      { id: 'best', label: 'Best 86', x: 0.72, y: 0.18, vx: -0.0001, vy: -0.0001, r: 3 },
      { id: 'worst', label: 'Worst 59', x: 0.75, y: 0.52, vx: 0.0002, vy: 0.0001, r: 3 },
      { id: 'verdict', label: '78 LEAN YES', x: 0.88, y: 0.38, vx: -0.0001, vy: 0.0001, r: 6 },
    ];

    const edges = [
      ['context', 'role'],
      ['context', 'commute'],
      ['role', 'evidence'],
      ['commute', 'evidence'],
      ['evidence', 'wageGov'],
      ['evidence', 'costLiving'],
      ['wageGov', 'scenarios'],
      ['costLiving', 'scenarios'],
      ['evidence', 'scenarios'],
      ['scenarios', 'best'],
      ['scenarios', 'worst'],
      ['scenarios', 'verdict'],
      ['best', 'verdict'],
      ['worst', 'verdict'],
    ];

    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connecting lines
      edges.forEach(([sourceId, targetId]) => {
        const s = nodes.find((n) => n.id === sourceId)!;
        const t = nodes.find((n) => n.id === targetId)!;

        const sx = s.x * width;
        const sy = s.y * height;
        const tx = t.x * width;
        const ty = t.y * height;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = 'rgba(185, 229, 243, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulsing packet along edge
        const packetProgress = (Math.sin(pulseTime + sx * 0.01 + sy * 0.01) + 1) / 2;
        const px = sx + (tx - sx) * packetProgress;
        const py = sy + (ty - sy) * packetProgress;

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(185, 229, 243, 0.75)';
        ctx.fill();
      });

      // Draw decision nodes
      nodes.forEach((n) => {
        const nx = n.x * width;
        const ny = n.y * height;

        // Outer glow
        const glow = ctx.createRadialGradient(nx, ny, 1, nx, ny, n.r * 3.5);
        glow.addColorStop(0, 'rgba(185, 229, 243, 0.35)');
        glow.addColorStop(1, 'rgba(185, 229, 243, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(nx, ny, n.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
        ctx.fillStyle = '#B9E5F3';
        ctx.fill();

        // Label in tiny elegant mono font
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(245, 245, 242, 0.65)';
        ctx.fillText(n.label, nx + n.r + 5, ny + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeStage]);

  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
