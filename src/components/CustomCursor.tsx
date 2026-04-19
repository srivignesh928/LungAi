import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);
    resize();

    const mouse = { x: -1000, y: -1000, radius: 180 };
    let isMouseActive = false;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMouseActive = true;
    };
    
    // Hide interaction when mouse leaves window
    const onMouseOut = () => {
      isMouseActive = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseOut);

    // Determines how many dots are on screen based on size
    const numParticles = Math.floor((width * height) / 12000); // e.g. ~160 on a 1080p screen
    
    class Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1; // 1 to 3 pixels
        // Slow constant drift speed
        this.vx = (Math.random() - 0.5) * 0.8; 
        this.vy = (Math.random() - 0.5) * 0.8;
      }

      update() {
        // Bounce off walls
        if (this.x > width || this.x < 0) this.vx = -this.vx;
        if (this.y > height || this.y < 0) this.vy = -this.vy;

        // Subtle repel effect from the mouse to make it feel highly interactive but slow
        if (isMouseActive) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            // Push away logic
            const forceDirectionX = dx / dist;
            const forceDirectionY = dy / dist;
            const force = (mouse.radius - dist) / mouse.radius;
            // The 1.2 multiplier is repulsion strength
            this.x -= forceDirectionX * force * 1.2;
            this.y -= forceDirectionY * force * 1.2;
          }
        }

        // Apply normal drift
        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        // Soft blue dots
        ctx!.fillStyle = 'rgba(14, 165, 233, 0.7)'; 
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    const particlesArray: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particlesArray.push(new Particle());
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        // Connect nodes to each other with lines! This forms the "mesh" network.
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // If dots are close enough, draw a line between them
          if (dist < 130) {
            ctx.beginPath();
            // Line opacity fades as they separate (using modern rgba)
            const opacity = 1 - (dist / 130);
            // Cyan/Blue lines to match the light theme
            ctx.strokeStyle = `rgba(14, 165, 233, ${opacity * 0.4})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
        
        // Connect to mouse cursor with a slightly brighter line if near
        if (isMouseActive) {
            const mdx = particlesArray[i].x - mouse.x;
            const mdy = particlesArray[i].y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 160) {
                ctx.beginPath();
                const mOpacity = 1 - (mDist / 160);
                ctx.strokeStyle = `rgba(59, 130, 246, ${mOpacity * 0.6})`;
                ctx.lineWidth = 1.0;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <style>{`
        /* 
          Maintains the custom SVG arrow cursor matching the mesh network colors!
        */
        body, a, button, input, select, .cursor-pointer { 
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><defs><filter id="glow"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M4 4l7.07 16.97 2.51-7.39 7.39-2.51L4 4z" fill="%230ea5e9" stroke="%23ffffff" stroke-width="1.5" filter="url(%23glow)"/></svg>') 4 4, auto !important; 
        }
      `}</style>
      
      {/* 
        Network Node Mesh Canvas 
        Z-index is strictly 1 so it sits perfectly behind the white glass cards.
      */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[1]"
      />
    </>
  );
}
