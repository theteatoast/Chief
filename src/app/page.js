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
    let glitchTweens = [];

    const params = {
      rotation: 0,
      atmosphereShift: 0,
      glitchIntensity: 0,
      glitchFrequency: 0
    };

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

      glitchTweens.push(gsap.to(params, {
        atmosphereShift: 1,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }));

      // Glitch animations referencing 21st.dev artificial-hero
      glitchTweens.push(gsap.to(params, {
        glitchIntensity: 1,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        repeatDelay: Math.random() * 3 + 1
      }));

      glitchTweens.push(gsap.to(params, {
        glitchFrequency: 1,
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: "none"
      }));

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

      // Glitched Orb Logic
      const drawGlitchedOrb = (centerX, centerY, radius, hue, time, glitchIntensity) => {
        ctx.save();

        // Random glitch triggers
        const shouldGlitch = Math.random() < 0.1 && glitchIntensity > 0.5;
        const glitchOffset = shouldGlitch ? (Math.random() - 0.5) * 20 * glitchIntensity : 0;
        const glitchScale = shouldGlitch ? 1 + (Math.random() - 0.5) * 0.3 * glitchIntensity : 1;

        // Apply glitch transformations
        if (shouldGlitch) {
          ctx.translate(glitchOffset, glitchOffset * 0.8);
          ctx.scale(glitchScale, 1 / glitchScale);
        }

        // Main orb gradient
        const orbGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius * 1.5
        );

        orbGradient.addColorStop(0, `hsla(${hue + 10}, 100%, 95%, 0.8)`);
        orbGradient.addColorStop(0.2, `hsla(${hue + 20}, 90%, 80%, 0.6)`);
        orbGradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.2)`);
        orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright center circle with glitch
        const centerRadius = radius * 0.3;
        ctx.fillStyle = `hsla(${hue + 20}, 100%, 95%, 0.9)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Glitch effects on the orb
        if (shouldGlitch) {
          // RGB separation effect
          ctx.globalCompositeOperation = 'screen';

          // Hot pink/red channel offset
          ctx.fillStyle = `hsla(340, 100%, 50%, ${0.6 * glitchIntensity})`;
          ctx.beginPath();
          ctx.arc(centerX + glitchOffset * 0.5, centerY, centerRadius, 0, Math.PI * 2);
          ctx.fill();

          // Electric blue channel offset
          ctx.fillStyle = `hsla(220, 100%, 50%, ${0.5 * glitchIntensity})`;
          ctx.beginPath();
          ctx.arc(centerX - glitchOffset * 0.5, centerY, centerRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalCompositeOperation = 'source-over';

          // Digital noise lines
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * glitchIntensity})`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++) {
            const y = centerY - radius + (Math.random() * radius * 2);
            const startX = centerX - radius + Math.random() * 20;
            const endX = centerX + radius - Math.random() * 20;

            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
          }

          // Pixelated corruption blocks
          ctx.fillStyle = `rgba(255, 40, 150, ${0.4 * glitchIntensity})`;
          for (let i = 0; i < 3; i++) {
            const blockX = centerX - radius + Math.random() * radius * 2;
            const blockY = centerY - radius + Math.random() * radius * 2;
            const blockSize = Math.random() * 10 + 2;
            ctx.fillRect(blockX, blockY, blockSize, blockSize);
          }
        }

        // Outer rings with glitch distortion
        ctx.strokeStyle = `hsla(${hue + 20}, 80%, 70%, 0.3)`;
        ctx.lineWidth = 1.5;

        if (shouldGlitch) {
          // Distorted ring segments
          const segments = 8;
          for (let i = 0; i < segments; i++) {
            const startAngle = (i / segments) * Math.PI * 2;
            const endAngle = ((i + 1) / segments) * Math.PI * 2;
            const ringRadius = radius * 1.2 + (Math.random() - 0.5) * 10 * glitchIntensity;

            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
            ctx.stroke();
          }
        } else {
          // Normal rings
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `hsla(${hue + 20}, 80%, 70%, 0.06)`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 1.7, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Data corruption effect
        if (shouldGlitch && Math.random() < 0.3) {
          ctx.globalCompositeOperation = 'difference';
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * glitchIntensity})`;

          // Horizontal glitch bars
          for (let i = 0; i < 3; i++) {
            const barY = centerY - radius + Math.random() * radius * 2;
            const barHeight = Math.random() * 5 + 1;
            ctx.fillRect(centerX - radius, barY, radius * 2, barHeight);
          }

          ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
      };

      function render() {
        timeRef.current += 0.016;
        const time = timeRef.current;

        const width = canvas.width = grainCanvas.width = window.innerWidth;
        const height = canvas.height = grainCanvas.height = window.innerHeight;

        // Jet-Black background
        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = (height / 2) + 80;
        const radius = Math.min(width, height) * 0.22;

        // Atmospheric background pulse matching 21st.dev
        const bgGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, Math.max(width, height) * 0.8
        );

        const hue = 180 + params.atmosphereShift * 30; // Shifting between Teal(180) and Blue(210)
        bgGradient.addColorStop(0, `hsla(${hue}, 80%, 15%, 0.4)`);
        bgGradient.addColorStop(0.3, `hsla(${hue - 10}, 60%, 8%, 0.2)`);
        bgGradient.addColorStop(1, 'rgba(3, 3, 3, 0.9)');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Draw the glitched orb
        drawGlitchedOrb(centerX, centerY, radius, hue, time, params.glitchIntensity);

        // ASCII sphere particles
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
              const z = Math.sqrt(Math.max(0, radius * radius - dx * dx - dy * dy));

              const angle = params.rotation;
              const rotX = dx;
              const rotY = dy * Math.cos(0) - z * Math.sin(0);
              const rotZ = dy * Math.sin(0) + z * Math.cos(0);

              const lightAngle = angle * 2;
              const lightX = Math.cos(lightAngle) * radius;
              const lightZ = Math.sin(lightAngle) * radius;

              const distToLight = Math.sqrt(Math.pow(rotX - lightX, 2) + Math.pow(rotZ - lightZ, 2));
              const viewBright = Math.max(0, 1 - (distToLight / (radius * 1.5)));
              const baseBright = Math.max(0.1, (rotZ + radius) / (radius * 2));
              const edgeFade = Math.pow(1 - (dist / radius), 0.3);

              let brightness = (baseBright * 0.4 + viewBright * 0.8) * edgeFade;

              if (brightness > 0.05) {
                const charIndex = Math.min(
                  density.length - 1,
                  Math.max(0, Math.floor(brightness * density.length))
                );

                let char = density[charIndex];

                if (dist < radius * 0.3) {
                  char = ['#', '%', '@'][Math.floor(Math.random() * 3)];
                } else if (dist < radius * 0.5) {
                  char = ['+', '=', '*'][Math.floor(Math.random() * 3)];
                }

                // Glitch the ASCII characters near the orb randomly based on Intensity
                if (dist < radius * 0.9 && params.glitchIntensity > 0.8 && Math.random() < 0.2) {
                  const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '■', '□'];
                  char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }

                if (char !== ' ' && char !== '.') {
                  const alpha = Math.max(0.1, brightness * 1.5);
                  ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${alpha})`;
                  ctx.fillText(char, x, y);
                }
              }
            }

            // Sparse distant dust
            if (Math.random() > 0.999) {
              ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${Math.random() * 0.5})`;
              ctx.fillRect(x, y, 1.5, 1.5);
            }
          }
        }

        // Film grain generation & enhanced glitch compositing
        grainCtx.clearRect(0, 0, width, height);
        const grainIntensity = 0.05 + Math.sin(time * 10) * 0.02;
        const grainImageData = generateFilmGrain(width, height, grainIntensity);
        grainCtx.putImageData(grainImageData, 0, 0);

        // Enhanced grain explosions during heavy glitch
        if (params.glitchIntensity > 0.6) {
          grainCtx.globalCompositeOperation = 'screen';
          for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.3 * params.glitchIntensity;

            grainCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            grainCtx.beginPath();
            grainCtx.arc(x, y, size, 0, Math.PI * 2);
            grainCtx.fill();
          }
        }

        frameId = requestAnimationFrame(render);
      }

      render();

      const handleResize = () => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        }
      };
      window.addEventListener('resize', handleResize);

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
      glitchTweens.forEach(t => t.kill());
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
            Home
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, pointerEvents: 'auto' }}>
            About
          </a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, pointerEvents: 'auto' }}>
            Pricing
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

      {/* Side Decorative Grids */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '30vw',
        backgroundSize: '30px 30px',
        backgroundImage: 'linear-gradient(to right, rgba(100,200,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,200,255,0.03) 1px, transparent 1px)',
        maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none',
        zIndex: 5
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '30vw',
        backgroundSize: '30px 30px',
        backgroundImage: 'linear-gradient(to right, rgba(100,200,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,200,255,0.03) 1px, transparent 1px)',
        maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none',
        zIndex: 5
      }} />

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

      {/* Right Content Container */}
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '4rem',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        textAlign: 'right',
        maxWidth: '320px',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '11px',
          fontWeight: '600',
          color: '#8ae0ff',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          opacity: 0.9,
          textShadow: '0 0 10px rgba(100,200,255,0.4)',
        }}>
          Your AI Chief of Staff
        </div>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '20px',
          fontWeight: '300',
          color: '#ffffff',
          lineHeight: '1.5',
          opacity: 0.85,
        }}>
          AI that runs your entire work life
        </div>
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


        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '9px',
          fontWeight: '600',
          color: 'white',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          opacity: 0.4
        }}>

        </div>
      </div>
    </div >
  );
}
