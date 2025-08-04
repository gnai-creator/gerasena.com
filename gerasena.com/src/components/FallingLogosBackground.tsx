"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FallingLogosBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load("/logo.png");

    const logos: THREE.Sprite[] = [];
    const LOGO_COUNT = 20;

    function createLogo() {
      const material = new THREE.SpriteMaterial({ map: logoTexture });
      const sprite = new THREE.Sprite(material);
      const size = 64;
      sprite.scale.set(size, size, 1);
      sprite.position.set(
        Math.random() * width - width / 2,
        height / 2 + Math.random() * height,
        0,
      );
      sprite.userData = {
        vy: 1 + Math.random() * 2,
        rot: (Math.random() - 0.5) * 0.02,
      };
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
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      renderer.setSize(newWidth, newHeight);
      camera.left = newWidth / -2;
      camera.right = newWidth / 2;
      camera.top = newHeight / 2;
      camera.bottom = newHeight / -2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}

