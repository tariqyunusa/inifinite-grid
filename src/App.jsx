import * as THREE from 'three'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useRef, useState, useMemo, useEffect, act } from 'react'
import gsap from 'gsap'
import './App.css'

const images = [
  '/gr-1.jpg', '/gr-2.jpg', '/gr-3.jpg',
  '/mt-1.jpg', '/mt-2.jpg', '/mt-3.jpg',
  '/wt-1.jpg', '/wt-2.jpg', '/wt-3.jpg', '/jp-1.jpg'
];

const GridImage = ({ position, texture, onClick, isActive, isHidden, centerPosition }) => {
  const ref = useRef();
  const {innerWidth, innerHeight} = window
  const centerWidth = innerWidth /2
  const centerHeight = innerHeight / 2

  useEffect(() => {
    if (ref.current) {
      
      gsap.to(ref.current.position, {
        x: isActive ? centerPosition[0] : isHidden ? position[0] * 5 : position[0],
        y: isActive ? centerPosition[1] : isHidden ? position[1] * 5 : position[1],
        z: isActive ? 2 : position[2],
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.to(ref.current.scale, {
        x: isActive ? 1.5 : 1,
        y: isActive ? 1.5 : 1,
        duration: 0.8,
        ease: "power3.out"
      });

     
      gsap.to(ref.current.material, {
        opacity: isHidden ? 0 : 1,
        duration: 0.8,
        ease: "power3.out"
      });
    }
  }, [isActive, isHidden, position, centerPosition]);

  return (
    <mesh ref={ref} position={position} onClick={onClick}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
};

const InfiniteGrid = ({ mouse }) => {
  const gridRef = useRef();
  const textures = useLoader(THREE.TextureLoader, images);
  const { camera, viewport } = useThree();
  const [activeIndex, setActiveIndex] = useState(null);

 
  const centerPosition = [camera.position.x, camera.position.y, 0];

  const grid = useMemo(() => {
    const gridSize = 15;
    const spacing = 1.5;
    const gridData = [];

    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let y = -gridSize / 2; y < gridSize / 2; y++) {
        gridData.push({
          position: [x * spacing, y * spacing, 0],
          texture: textures[(x + y + gridSize) % textures.length]
        });
      }
    }
    return gridData;
  }, [textures]);


  useFrame(() => {
    if (gridRef.current && activeIndex === null) {
      gsap.to(gridRef.current.position, {
        x: -mouse.x * 3,
        y: -mouse.y * 3,
        duration: 0.5,
        ease: "power3.out"
      });
    }
  });

  const handleImageClick = (index) => {
   
    
    if (activeIndex === index) {
      setActiveIndex(null); // Reset grid movement
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <group ref={gridRef}>
      {grid.map((img, idx) => (
        <GridImage
          key={idx}
          position={img.position}
          texture={img.texture}
          onClick={() => handleImageClick(idx)}
          isActive={activeIndex === idx}
          isHidden={activeIndex !== null && activeIndex !== idx}
          centerPosition={centerPosition} 
        />
      ))}
    </group>
  );
};



export default function App() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = -(e.clientY / innerHeight) * 2 + 1;
    setMouse({ x, y });
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <InfiniteGrid mouse={mouse} />
      </Canvas>
    </div>
  );
}