'use client';

import React, { useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const grainCanvasRef = useRef(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    let frameId;
    let ctxRotation;
    const params = { rotation: 0 };

    const initAnimation = () => {
      const canvas = canvasRef.current;
      const grainCanvas = grainCanvasRef.current;
      if (!canvas || !grainCanvas) {
        frameId = requestAnimationFrame(initAnimation);
        return;
      }

      const ctx = canvas.getContext('2d');
      const grainCtx = grainCanvas.getContext('2d');

      const density = ' .:-=+*#%@';

      ctxRotation = gsap.to(params, {
        rotation: Math.PI * 2,
        duration: 30,
        repeat: -1,
        ease: "none"
      });

      // Film grain generation
      const generateFilmGrain = (width, height, intensity = 0.08) => {
        const imageData = grainCtx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const grain = (Math.random() - 0.5) * intensity * 255;
          data[i] = Math.max(0, Math.min(255, 128 + grain));
          data[i + 1] = Math.max(0, Math.min(255, 128 + grain));
          data[i + 2] = Math.max(0, Math.min(255, 128 + grain));
          data[i + 3] = Math.abs(grain) * 1.5;
        }

        return imageData;
      };

      function render() {
        timeRef.current += 0.016;
        const time = timeRef.current;

        const width = canvas.width = grainCanvas.width = window.innerWidth;
        const height = canvas.height = grainCanvas.height = window.innerHeight;

        // Deep dark background
        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = (height / 2) + 80; // Shifted sphere down significantly
        const radius = Math.min(width, height) * 0.22;

        // Background dark glow
        const bgGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, Math.max(width, height) * 0.8
        );

        bgGradient.addColorStop(0, `rgba(15, 30, 45, 0.5)`);
        bgGradient.addColorStop(0.3, `rgba(8, 12, 18, 0.3)`);
        bgGradient.addColorStop(1, 'rgba(3, 3, 3, 0.9)');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Core white glow (behind the ASCII)
        const coreLightRadius = radius * 0.35;
        const coreGlow = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, coreLightRadius * 3
        );
        coreGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGlow.addColorStop(0.2, 'rgba(120, 240, 255, 0.8)'); // Deep cyan
        coreGlow.addColorStop(0.5, 'rgba(40, 100, 255, 0.2)');
        coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, coreLightRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        // Outer rings
        ctx.strokeStyle = `rgba(100, 200, 255, 0.15)`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(100, 200, 255, 0.05)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.7, 0, Math.PI * 2);
        ctx.stroke();

        // ASCII sphere particles - forming a 3D globe effect
        ctx.font = '11px "JetBrains Mono", monospace, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const spacing = 11;
        const cols = Math.floor(width / spacing);
        const rows = Math.floor(height / spacing);

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = (i - cols / 2) * spacing + centerX;
            const y = (j - rows / 2) * spacing + centerY;

            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
              // Calculate 3D sphere coordinate (z)
              const z = Math.sqrt(Math.max(0, radius * radius - dx * dx - dy * dy));

              // Rotate the coordinates globally
              const angle = params.rotation;
              const rotX = dx;
              const rotY = dy * Math.cos(0) - z * Math.sin(0); // Slight tilt
              const rotZ = dy * Math.sin(0) + z * Math.cos(0);

              // Create a pseudo-lighting effect sweeping across the sphere
              const lightAngle = angle * 2;
              const lightX = Math.cos(lightAngle) * radius;
              const lightZ = Math.sin(lightAngle) * radius;

              // Distance to light source
              const distToLight = Math.sqrt(Math.pow(rotX - lightX, 2) + Math.pow(rotZ - lightZ, 2));
              const viewBright = Math.max(0, 1 - (distToLight / (radius * 1.5)));

              // Add some base visibility to everything on the sphere
              const baseBright = Math.max(0.1, (rotZ + radius) / (radius * 2));

              // Combine with edge fade (so the text sphere blends into the background)
              const edgeFade = Math.pow(1 - (dist / radius), 0.3);

              let brightness = (baseBright * 0.4 + viewBright * 0.8) * edgeFade;

              if (brightness > 0.05) {
                // Map brightness to available density characters
                const charIndex = Math.min(
                  density.length - 1,
                  Math.max(0, Math.floor(brightness * density.length))
                );

                let char = density[charIndex];

                // Core density modifier -> if near center, force solid letters
                if (dist < coreLightRadius) {
                  char = ['#', '%', '@'][Math.floor(Math.random() * 3)];
                } else if (dist < coreLightRadius * 1.5) {
                  char = ['+', '=', '*'][Math.floor(Math.random() * 3)];
                }

                if (char !== ' ' && char !== '.') {
                  const alpha = Math.max(0.1, brightness * 1.5);
                  // Cyan / Teal mapping
                  const r = Math.floor(brightness * 50);
                  const g = Math.floor(brightness * 200 + 55);
                  ctx.fillStyle = `rgba(${r}, ${g}, 255, ${alpha})`;
                  ctx.fillText(char, x, y);
                }
              }
            }

            // Sparse distant dust
            if (Math.random() > 0.999) {
              ctx.fillStyle = `rgba(160, 220, 255, ${Math.random() * 0.5})`;
              ctx.fillRect(x, y, 1.5, 1.5);
            }
          }
        }

        // Continuous film grain render
        grainCtx.clearRect(0, 0, width, height);
        const grainImageData = generateFilmGrain(width, height, 0.05); // Very low intensity grain
        grainCtx.putImageData(grainImageData, 0, 0);

        frameId = requestAnimationFrame(render);
      }

      render();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    const cleanup = initAnimation();

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (ctxRotation) ctxRotation.kill();
      if (cleanup && typeof cleanup === 'function') cleanup();
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', background: '#030303', position: 'relative', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '2rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontFamily: 'monospace',
            color: 'white',
            opacity: 0.5,
            fontSize: '12px',
            letterSpacing: '2px'
          }}>{'< />'}</div>
        </div>

        <div style={{
          display: 'flex',
          gap: '3rem',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, pointerEvents: 'auto' }}>
            Creative Journey
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, pointerEvents: 'auto' }}>
            About
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, pointerEvents: 'auto' }}>
            Sound
          </a>
        </div>

        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '10px',
          fontWeight: '600',
          color: 'white',
          opacity: 0.4,
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>
          + Connect
        </div>
      </nav>

      {/* Sub-header text */}
      <div style={{
        position: 'absolute',
        top: '6rem',
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '22px', // Larger
          fontWeight: '400',
          color: '#ffffff',
          letterSpacing: '10px',
          textTransform: 'uppercase',
          opacity: 0.9,
          textShadow: '0 0 30px rgba(100, 200, 255, 0.6)'
        }}>
          Automate Your Worklife
        </div>
      </div>

      {/* Canvas Container underneath the text */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
        {/* Film Grain Overlay Canvas */}
        <canvas
          ref={grainCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            mixBlendMode: 'overlay',
            opacity: 0.4
          }}
        />
      </div>

      {/* Left Action Container */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '4rem',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <div style={{
          fontFamily: '"Arial Black", Impact, sans-serif',
          fontSize: 'clamp(3rem, 8vw, 7rem)', /* Much smaller font size */
          fontWeight: '900',
          color: '#ffffff',
          lineHeight: 0.8,
          letterSpacing: '-0.02em',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.15), 0 0 10px rgba(100, 200, 255, 0.25)',
          WebkitTextStroke: '0.3px rgba(255,255,255,0.05)',
          pointerEvents: 'none',
          marginBottom: '2rem'
        }}>
          CHIEF
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="group relative inline-flex items-center gap-3 rounded-full bg-[#0a0a0f]/90 hover:bg-[#12121c] border border-cyan-500/20 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 pointer-events-auto backdrop-blur-sm shadow-[0_0_20px_rgba(100,200,255,0.05)] hover:shadow-[0_0_30px_rgba(100,200,255,0.15)]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span style={{ letterSpacing: '0.5px' }}>Access Dashboard</span>
        </button>
      </div>

      {/* Left side text */}
      <div style={{
        position: 'absolute',
        left: '4rem',
        bottom: '8rem',
        zIndex: 50,
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '9px',
          fontWeight: '600',
          color: 'white',
          lineHeight: 1.6,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}>
          In the dark<br />
          is where<br />
          light takes form<br />
        </div>
      </div>

      {/* Right side text */}
      <div style={{
        position: 'absolute',
        right: '4rem',
        bottom: '8rem',
        zIndex: 50,
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '9px',
          fontWeight: '600',
          color: 'white',
          lineHeight: 1.6,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          opacity: 0.6,
          textAlign: 'right'
        }}>
          In emptiness<br />
          we find<br />
          true happiness
        </div>
      </div>

      {/* Bottom text*/}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        left: '3rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black font-bold text-[10px]" style={{ fontFamily: 'Georgia, serif' }}>
          N
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '9px',
          fontWeight: '600',
          color: 'white',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          opacity: 0.4
        }}>
          Chief of Staff AI
        </div>
      </div>
    </div>
  );
}
