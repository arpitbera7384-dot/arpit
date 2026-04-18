import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface HeartsBackgroundProps {
  finaleTriggered: boolean;
}

export default function HeartsBackground({ finaleTriggered }: HeartsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffb6c1, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xec4899, 2, 50);
    pointLight.position.set(0, -5, 5);
    scene.add(pointLight);

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 1.5);
    heartShape.bezierCurveTo(2, 3.5, 4, 1.5, 2, -0.5);
    heartShape.lineTo(0, -2.5);
    heartShape.lineTo(-2, -0.5);
    heartShape.bezierCurveTo(-4, 1.5, -2, 3.5, 0, 1.5);

    const extrudeSettings = { 
      depth: 0.5, 
      bevelEnabled: true, 
      bevelSegments: 4, 
      steps: 2, 
      bevelSize: 0.2, 
      bevelThickness: 0.2 
    };
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();
    geometry.scale(0.3, 0.3, 0.3);
    geometry.rotateX(Math.PI);

    const material = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0x4c0519,
      roughness: 0.2,
      metalness: 0.3,
    });

    const hearts: THREE.Mesh[] = [];
    for (let i = 0; i < 25; i++) {
      const heart = new THREE.Mesh(geometry, material.clone());
      heart.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15 - 5
      );
      heart.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      heart.userData = {
        speedX: Math.random() * 0.01 + 0.005,
        speedY: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2,
        baseX: heart.position.x,
        baseY: heart.position.y
      };
      
      scene.add(heart);
      hearts.push(heart);
    }
    heartsRef.current = hearts;

    camera.position.z = 15;

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredHeart: THREE.Mesh | null = null;
    let pulseTimeline: gsap.core.Timeline | null = null;

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onClick = () => {
      if (hoveredHeart) {
        // Brief glow effect
        const mat = hoveredHeart.material as THREE.MeshStandardMaterial;
        gsap.to(mat, {
          emissiveIntensity: 8,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.out"
        });

        gsap.to(hoveredHeart.scale, {
          x: 0.8, y: 0.8, z: 0.8,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "back.out(2)"
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hearts);

      if (intersects.length > 0) {
        const firstIntersected = intersects[0].object as THREE.Mesh;
        if (hoveredHeart !== firstIntersected) {
          // Reset previous hovered heart
          if (hoveredHeart) {
            if (pulseTimeline) pulseTimeline.kill();
            gsap.to(hoveredHeart.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
            gsap.to((hoveredHeart.material as THREE.MeshStandardMaterial), { emissiveIntensity: 1, duration: 0.4 });
          }

          hoveredHeart = firstIntersected;
          const mat = hoveredHeart.material as THREE.MeshStandardMaterial;

          // Start gentle pulse animation
          pulseTimeline = gsap.timeline({ repeat: -1, yoyo: true });
          pulseTimeline.to(hoveredHeart.scale, {
            x: 1.5, y: 1.5, z: 1.5,
            duration: 0.8,
            ease: "sine.inOut"
          }, 0);
          pulseTimeline.to(mat, {
            emissiveIntensity: 4,
            duration: 0.8,
            ease: "sine.inOut"
          }, 0);
        }
      } else {
        if (hoveredHeart) {
          if (pulseTimeline) pulseTimeline.kill();
          gsap.to(hoveredHeart.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
          gsap.to((hoveredHeart.material as THREE.MeshStandardMaterial), { emissiveIntensity: 1, duration: 0.4 });
          hoveredHeart = null;
        }
      }

      if (!finaleTriggered) {
        hearts.forEach((heart, i) => {
          // Smoother rotation
          heart.rotation.y += heart.userData.speedX * 0.5;
          heart.rotation.x += heart.userData.speedY * 0.5;
          
          // More fluid floating with multiple sine waves
          const floatY = Math.sin(time * 0.8 + heart.userData.floatOffset) * 1.5;
          const floatX = Math.cos(time * 0.5 + heart.userData.floatOffset) * 0.8;
          
          heart.position.y = heart.userData.baseY + floatY;
          heart.position.x += (floatX * 0.01); // Subtle horizontal drift

          // React to mouse proximity even if not hovered
          const mouseWorldX = mouse.x * 15;
          const mouseWorldY = mouse.y * 10;
          const dx = heart.position.x - mouseWorldX;
          const dy = heart.position.y - mouseWorldY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 8 && !finaleTriggered) {
            const force = (8 - dist) / 8;
            heart.position.x += dx * force * 0.1;
            heart.position.y += dy * force * 0.1;
          }

          // Spring back to base position
          if (!finaleTriggered) {
            heart.position.x += (heart.userData.baseX - heart.position.x) * 0.02;
          }
        });
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      hearts.forEach(heart => {
        (heart.material as THREE.Material).dispose();
      });
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    if (finaleTriggered) {
      heartsRef.current.forEach((heart, i) => {
        const angle = (i / heartsRef.current.length) * Math.PI * 2;
        gsap.to(heart.position, {
          x: heart.position.x + Math.cos(angle) * 10,
          y: heart.position.y + 15 + Math.random() * 10,
          z: heart.position.z + Math.sin(angle) * 10,
          duration: 3 + Math.random() * 2,
          ease: "power2.in"
        });
        gsap.to(heart.scale, {
          x: 0, y: 0, z: 0,
          duration: 2 + Math.random(),
          delay: 1,
          ease: "power2.in"
        });
      });
    }
  }, [finaleTriggered]);

  return <div ref={containerRef} className="fixed inset-0 z-[-1] pointer-events-none" />;
}
