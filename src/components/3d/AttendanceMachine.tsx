'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, PerspectiveCamera, Environment, Float, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function ScannerScene() {
    const cardRef = useRef<THREE.Group>(null);
    const machineGroupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // --- 1. Animation: Card hovers and moves towards the scanner ---
        if (cardRef.current) {
            const cycle = t % 4; // 4 second loop
            let zPos = 2; // Start position (away)
            let rotX = 0;

            if (cycle < 2) {
                // Moving in
                const progress = cycle / 2;
                const ease = 1 - Math.pow(1 - progress, 3);
                zPos = 2 - (ease * 1.2);
                rotX = Math.sin(t * 3) * 0.05;
            } else {
                // Return
                const progress = (cycle - 2) / 2;
                zPos = 0.8 + (progress * 1.2);
                rotX = Math.sin(t * 3) * 0.05;
            }

            cardRef.current.position.z = zPos;
            cardRef.current.rotation.x = 0.2 + rotX;
            cardRef.current.position.y = -1 + Math.sin(t * 2) * 0.05;
        }

        // --- 2. Parallax Effect: Machine follows mouse ---
        if (machineGroupRef.current) {
            // Mouse position: -1 to 1
            const x = state.mouse.x * 0.2; // Max rotation X
            const y = state.mouse.y * 0.2; // Max rotation Y

            // Lerp for smooth movement
            machineGroupRef.current.rotation.y = THREE.MathUtils.lerp(machineGroupRef.current.rotation.y, x, 0.1);
            machineGroupRef.current.rotation.x = THREE.MathUtils.lerp(machineGroupRef.current.rotation.x, -y, 0.1);
        }
    });

    return (
        <group ref={machineGroupRef}>
            {/* The Scanner Machine */}
            <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}> {/* Reduced float rotation so mouse parallax dominates */}
                <group position={[0, 0.5, 0]}>
                    {/* Main Case */}
                    <RoundedBox args={[3.2, 4.5, 0.5]} radius={0.2} smoothness={4}>
                        <meshStandardMaterial color="#1e1e32" metalness={0.6} roughness={0.3} />
                    </RoundedBox>

                    {/* Screen / Glass Face */}
                    <RoundedBox position={[0, 0.2, 0.26]} args={[2.8, 3.5, 0.1]} radius={0.1} smoothness={4}>
                        <meshPhysicalMaterial
                            color="#000000"
                            metalness={0.9}
                            roughness={0.1}
                            clearcoat={1}
                        />
                    </RoundedBox>

                    {/* Scanner Reader Zone */}
                    <group position={[0, -1.2, 0.35]}>
                        <Box args={[2, 0.1, 0.1]}>
                            <meshBasicMaterial color="#7c3aed" />
                        </Box>
                        <pointLight color="#7c3aed" intensity={2} distance={3} />
                    </group>

                    {/* HERO TEXT: Upgraded Style */}
                    <Text
                        position={[0, 0.5, 0.32]}
                        fontSize={0.4} // Larger
                        color="#a78bfa" // Light Purple/Cyan tint
                        anchorX="center"
                        anchorY="middle"
                        maxWidth={2.8}
                        textAlign="center"
                        font={undefined} // Default font
                    >
                        Tap Into the Future
                        <meshBasicMaterial color="#a78bfa" toneMapped={false} /> {/* Makes it glow slightly / ignore shadows */}
                    </Text>

                    <Text
                        position={[0, 1.5, 0.32]}
                        fontSize={0.25} // Increased size slightly
                        color="#7c3aed"
                        anchorX="center"
                        anchorY="middle"
                    >
                        ATTENDIFY
                    </Text>
                </group>
            </Float>

            {/* The Student Card */}
            <group ref={cardRef} position={[0, -1, 2]}>
                {/* Card Body */}
                <RoundedBox args={[1.8, 1.1, 0.04]} radius={0.08} smoothness={4}>
                    <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
                </RoundedBox>

                {/* Card Chip */}
                <mesh position={[-0.6, 0.1, 0.03]}>
                    <planeGeometry args={[0.3, 0.2]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Card Stripe */}
                <mesh position={[0, -0.3, 0.03]}>
                    <planeGeometry args={[1.8, 0.2]} />
                    <meshStandardMaterial color="#7c3aed" />
                </mesh>

                <Text
                    position={[0.2, 0.2, 0.03]}
                    fontSize={0.1}
                    color="#000000"
                    anchorX="left"
                    anchorY="middle"
                >
                    RFID Card
                </Text>
            </group>
        </group>
    );
}

export default function AttendanceMachine() {
    return (
        <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
                <pointLight position={[-10, 0, 5]} intensity={0.8} color="#7c3aed" />

                <Environment preset="city" />

                <ScannerScene />
            </Canvas>
        </div>
    );
}
