"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface FaceCanvasProps {
  image: string;
  expression: string;
  isSpeaking: boolean;
}

const FaceCanvas = forwardRef<HTMLCanvasElement, FaceCanvasProps>(
  ({ image, expression, isSpeaking }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const animationFrameRef = useRef<number>();
    const mouthStateRef = useRef({ openness: 0, direction: 1 });

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    // Load and draw the initial image
    useEffect(() => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        imageRef.current = img;
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          drawImage();
          // Initial expression application
          applyExpression(expression);
        }
      };
    }, [image]);

    // Draw the base image
    const drawImage = () => {
      if (!canvasRef.current || !imageRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
    };

    // Apply expression changes
    const applyExpression = (expr: string) => {
      if (!canvasRef.current || !imageRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // Estimate face area (center 60% of image)
      const faceX = width * 0.2;
      const faceY = height * 0.2;
      const faceWidth = width * 0.6;
      const faceHeight = height * 0.6;

      // Estimate mouth position (lower third of face area)
      const mouthY = faceY + faceHeight * 0.7;
      const mouthWidth = faceWidth * 0.4;
      const mouthHeight = faceHeight * 0.1;
      const mouthX = faceX + (faceWidth - mouthWidth) / 2;

      // Redraw base image
      drawImage();

      // Apply expression-specific modifications
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;

      switch (expr) {
        case "happy":
          // Draw happy mouth (upward curve)
          ctx.beginPath();
          ctx.moveTo(mouthX, mouthY);
          ctx.quadraticCurveTo(
            mouthX + mouthWidth / 2,
            mouthY - mouthHeight * 2,
            mouthX + mouthWidth,
            mouthY
          );
          ctx.stroke();
          break;

        case "sad":
          // Draw sad mouth (downward curve)
          ctx.beginPath();
          ctx.moveTo(mouthX, mouthY);
          ctx.quadraticCurveTo(
            mouthX + mouthWidth / 2,
            mouthY + mouthHeight * 2,
            mouthX + mouthWidth,
            mouthY
          );
          ctx.stroke();
          break;

        case "surprised":
          // Draw surprised mouth (oval shape)
          ctx.beginPath();
          ctx.ellipse(
            mouthX + mouthWidth / 2,
            mouthY,
            mouthWidth / 3,
            mouthHeight * 1.5,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          break;

        case "angry":
          // Draw angry mouth (straight line with slight downward angle)
          ctx.beginPath();
          ctx.moveTo(mouthX, mouthY);
          ctx.lineTo(mouthX + mouthWidth, mouthY + mouthHeight / 2);
          ctx.stroke();
          break;

        case "neutral":
          // Draw neutral mouth (straight line)
          ctx.beginPath();
          ctx.moveTo(mouthX, mouthY);
          ctx.lineTo(mouthX + mouthWidth, mouthY);
          ctx.stroke();
          break;
      }
    };

    // Handle expression changes
    useEffect(() => {
      applyExpression(expression);
    }, [expression]);

    // Handle lip sync animation
    useEffect(() => {
      const animateLipSync = () => {
        if (!canvasRef.current || !imageRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get canvas dimensions for mouth position
        const width = canvas.width;
        const height = canvas.height;
        const mouthX = width * 0.35;
        const mouthY = height * 0.7;
        const mouthWidth = width * 0.3;
        const mouthHeight = height * 0.05;

        // Update mouth openness
        mouthStateRef.current.openness += mouthStateRef.current.direction * 0.1;
        if (mouthStateRef.current.openness > 1) {
          mouthStateRef.current.direction = -1;
        } else if (mouthStateRef.current.openness < 0) {
          mouthStateRef.current.direction = 1;
        }

        // Redraw base image
        drawImage();

        // Draw animated mouth
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
          mouthX + mouthWidth / 2,
          mouthY,
          mouthWidth / 2,
          mouthHeight * (1 + mouthStateRef.current.openness * 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(animateLipSync);
      };

      if (isSpeaking) {
        animationFrameRef.current = requestAnimationFrame(animateLipSync);
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        // Reset to current expression when not speaking
        applyExpression(expression);
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isSpeaking, expression]);

    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    );
  }
);

FaceCanvas.displayName = "FaceCanvas";

export default FaceCanvas;
