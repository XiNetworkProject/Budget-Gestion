import React, { memo, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

// Composant d'arrière-plan Canvas ultra-optimisé
const CanvasBackground = memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configuration des particules
    const particles = [];
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        this.life = Math.random() * 100 + 50;
        this.maxLife = this.life;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Rebondir sur les bords
        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

        // Réinitialiser si la particule meurt
        if (this.life <= 0) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.life = this.maxLife;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity * (this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Effet de lueur
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }
    }

    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Fonction d'animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dessiner le gradient d'arrière-plan
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(16, 19, 26, 0.8)');
      gradient.addColorStop(0.5, 'rgba(35, 41, 70, 0.8)');
      gradient.addColorStop(1, 'rgba(16, 19, 26, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mettre à jour et dessiner les particules
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Dessiner les connexions entre particules proches
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100 * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Overlay de gradient supplémentaire */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
    </Box>
  );
});

// Composant de particules CSS pour les appareils moins puissants
const CSSParticles = memo(() => {
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #10131a 0%, #232946 100%)'
    }}>
      {/* Particules flottantes */}
      {[...Array(20)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.3 + 0.1})`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 10px rgba(255,255,255,0.3)'
          }}
        />
      ))}
      
      {/* Particules plus grandes */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`large-${index}`}
          sx={{
            position: 'absolute',
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.05})`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticleLarge ${Math.random() * 15 + 15}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
            filter: 'blur(1px)',
            boxShadow: '0 0 20px rgba(255,255,255,0.2)'
          }}
        />
      ))}
      
      {/* Styles CSS pour les animations */}
      <style>
        {`
          @keyframes floatParticle {
            0% { 
              transform: translateY(100vh) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { 
              transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes floatParticleLarge {
            0% { 
              transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5);
              opacity: 0;
            }
            10% { opacity: 1; scale: 1; }
            90% { opacity: 1; scale: 1; }
            100% { 
              transform: translateY(-100px) translateX(${Math.random() * 300 - 150}px) rotate(720deg) scale(0.5);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>
  );
});

// Composant principal qui choisit le meilleur rendu
const UltraBackground = memo(() => {
  const [useCanvas, setUseCanvas] = React.useState(true);

  useEffect(() => {
    // Détecter si l'appareil supporte bien Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setUseCanvas(false);
      return;
    }

    // Test de performance Canvas
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      ctx.fillRect(Math.random() * 100, Math.random() * 100, 1, 1);
    }
    const end = performance.now();
    
    // Si le rendu Canvas est trop lent, utiliser CSS
    if (end - start > 50) {
      setUseCanvas(false);
    }
  }, []);

  return useCanvas ? <CanvasBackground /> : <CSSParticles />;
});

UltraBackground.displayName = 'UltraBackground';

export default UltraBackground; 