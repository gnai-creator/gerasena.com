"use client";

import { useEffect, useRef } from "react";

export default function FallingLogosBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: import("three").WebGLRenderer | undefined;
    let cleanupResize: (() => void) | undefined;

    import("three").then((THREE) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        1,
        1000,
      );
      camera.position.z = 10;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      const textureLoader = new THREE.TextureLoader();
      const logoTexture = textureLoader.load("/logo.png");

      const logos: import("three").Sprite[] = [];
      const LOGO_COUNT = 20;

      function randomizeLogo(sprite: import("three").Sprite) {
        const size = 32 + Math.random() * 96;
        sprite.scale.set(size, size, 1);
        sprite.userData = {
          vy: 0.5 + Math.random() * 2,
          rot: (Math.random() - 0.5) * 0.02,
        };
      }

      function createLogo() {
        const material = new THREE.SpriteMaterial({ map: logoTexture });
        const sprite = new THREE.Sprite(material);
        randomizeLogo(sprite);
        sprite.position.set(
          Math.random() * width - width / 2,
          height / 2 + Math.random() * height,
          0,
        );
        scene.add(sprite);
        logos.push(sprite);
      }

      for (let i = 0; i < LOGO_COUNT; i += 1) {
        createLogo();
      }

      const animate = () => {
        requestAnimationFrame(animate);
        logos.forEach((logo) => {
          logo.position.y -= logo.userData.vy as number;
          logo.rotation.z += logo.userData.rot as number;
          if (logo.position.y < -height / 2 - 100) {
            logo.position.y = height / 2 + Math.random() * height;
            logo.position.x = Math.random() * width - width / 2;
            randomizeLogo(logo);
          }
        });
        renderer!.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        renderer!.setSize(newWidth, newHeight);
        camera.left = newWidth / -2;
        camera.right = newWidth / 2;
        camera.top = newHeight / 2;
        camera.bottom = newHeight / -2;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", handleResize);
      cleanupResize = () => window.removeEventListener("resize", handleResize);
    });

    return () => {
      cleanupResize?.();
      if (renderer) {
        mount.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}

