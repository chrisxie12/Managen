'use client';

import { cn } from "./utils";
import React, { useEffect, useRef } from 'react';

// Education-themed floating particles background for SchoolOS
// Features: graduation caps, books, pencils, chalk dust, school bells

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'cap' | 'book' | 'pencil' | 'bell' | 'dust';
  color: string;
};

export function EducationBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // SchoolOS brand colors
    const colors = {
      navy: '#0A2472',
      navyLight: '#1a3a8f',
      amber: '#10B981',
      amberLight: '#6EE7B7',
      cream: '#F8F9FA',
      white: '#ffffff',
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const types: Particle['type'][] = ['cap', 'book', 'pencil', 'bell', 'dust', 'dust', 'dust'];
      const type = types[Math.floor(Math.random() * types.length)];

      let color: string;
      let size: number;

      switch (type) {
        case 'cap':
          color = colors.navy;
          size = 20 + Math.random() * 15;
          break;
        case 'book':
          color = Math.random() > 0.5 ? colors.navy : colors.amber;
          size = 15 + Math.random() * 10;
          break;
        case 'pencil':
          color = colors.amber;
          size = 25 + Math.random() * 10;
          break;
        case 'bell':
          color = colors.amberLight;
          size = 12 + Math.random() * 8;
          break;
        default:
          color = colors.navyLight;
          size = 2 + Math.random() * 3;
      }

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.3 - 0.2, // Slight upward drift
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.1 + Math.random() * 0.3,
        type,
        color,
      });
    }

    particlesRef.current = particles;

    // Drawing functions
    const drawGraduationCap = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      // Cap base (diamond)
      ctx.beginPath();
      ctx.moveTo(-p.size, 0);
      ctx.lineTo(0, -p.size * 0.5);
      ctx.lineTo(p.size, 0);
      ctx.lineTo(0, p.size * 0.5);
      ctx.closePath();
      ctx.fill();

      // Cap top
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size * 0.6, -p.size * 0.8, p.size * 1.2, p.size * 0.3);

      // Tassel
      ctx.strokeStyle = colors.amber;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.size * 0.5, -p.size * 0.6);
      ctx.quadraticCurveTo(
        p.size * 0.8, 
        -p.size * 0.3,
        p.size * 0.6, 
        p.size * 0.2
      );
      ctx.stroke();

      ctx.restore();
    };

    const drawBook = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      // Book cover
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size, -p.size * 0.7, p.size * 2, p.size * 1.4);

      // Pages
      ctx.fillStyle = colors.white;
      ctx.fillRect(-p.size * 0.8, -p.size * 0.5, p.size * 1.6, p.size * 1.0);

      // Spine
      ctx.fillStyle = colors.navy;
      ctx.fillRect(-p.size * 0.1, -p.size * 0.7, p.size * 0.2, p.size * 1.4);

      ctx.restore();
    };

    const drawPencil = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      // Pencil body
      ctx.fillStyle = colors.amber;
      ctx.fillRect(-p.size * 0.15, -p.size * 0.4, p.size * 0.3, p.size * 0.8);

      // Pencil tip
      ctx.fillStyle = colors.navy;
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.15, p.size * 0.4);
      ctx.lineTo(0, p.size * 0.6);
      ctx.lineTo(p.size * 0.15, p.size * 0.4);
      ctx.closePath();
      ctx.fill();

      // Eraser
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(-p.size * 0.15, -p.size * 0.5, p.size * 0.3, p.size * 0.1);

      ctx.restore();
    };

    const drawBell = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      // Bell body
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, -p.size * 0.2, p.size * 0.5, Math.PI, 0);
      ctx.lineTo(p.size * 0.5, p.size * 0.3);
      ctx.lineTo(-p.size * 0.5, p.size * 0.3);
      ctx.closePath();
      ctx.fill();

      // Bell clapper
      ctx.fillStyle = colors.navy;
      ctx.beginPath();
      ctx.arc(0, p.size * 0.3, p.size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = colors.navy;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -p.size * 0.7, p.size * 0.15, Math.PI, 0);
      ctx.stroke();

      ctx.restore();
    };

    const drawDust = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.opacity * 0.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colors.cream);
      gradient.addColorStop(1, '#e8ecf4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Wrap around screen
        if (p.x < -p.size * 2) p.x = canvas.width + p.size * 2;
        if (p.x > canvas.width + p.size * 2) p.x = -p.size * 2;
        if (p.y < -p.size * 2) p.y = canvas.height + p.size * 2;
        if (p.y > canvas.height + p.size * 2) p.y = -p.size * 2;

        // Draw based on type
        switch (p.type) {
          case 'cap':
            drawGraduationCap(ctx, p);
            break;
          case 'book':
            drawBook(ctx, p);
            break;
          case 'pencil':
            drawPencil(ctx, p);
            break;
          case 'bell':
            drawBell(ctx, p);
            break;
          case 'dust':
            drawDust(ctx, p);
            break;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 -z-10', className)}
      style={{ pointerEvents: 'none' }}
    />
  );
}
