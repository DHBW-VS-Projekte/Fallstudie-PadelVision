"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const BALL_RADIUS = 0.43;
const COURT_HALF_WIDTH = 4.25;
const COURT_HALF_LENGTH = 7;
const ROLL_IN_TIME = 2.7;
const SETTLE_TIME = 0.48;
const REST_TIME = 0.45;
const RETURN_TIME = 1.65;
const CYCLE_LENGTH = ROLL_IN_TIME + SETTLE_TIME + REST_TIME + RETURN_TIME;

const BALL_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(4.7, 0, -4.4),
    new THREE.Vector3(3.55, 0, -3.65),
    new THREE.Vector3(2.1, 0, -2.25),
    new THREE.Vector3(0.2, 0, -0.9),
    new THREE.Vector3(-0.75, 0, 0.65),
    new THREE.Vector3(0.8, 0, 1.85),
    new THREE.Vector3(1.35, 0, 2.75),
    new THREE.Vector3(-0.15, 0, 3.45),
    new THREE.Vector3(-3.15, 0, 3.8),
    new THREE.Vector3(-4.65, 0, 4),
  ],
  false,
  "centripetal",
  0.45,
);
const START_POSITION = BALL_PATH.getPointAt(0);
const REST_POSITION = BALL_PATH.getPointAt(1);

function CourtCamera() {
  const { camera, invalidate } = useThree();

  useLayoutEffect(() => {
    camera.position.set(10, 10.5, 14);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate]);

  return null;
}

function CourtLine({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color="#31594a" transparent opacity={0.58} />
    </mesh>
  );
}

function Court() {
  return (
    <group>
      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.15, 15.15]} />
        <meshStandardMaterial
          color="#dce4d5"
          roughness={1}
          transparent
          opacity={0.53}
        />
      </mesh>

      <CourtLine position={[-COURT_HALF_WIDTH, 0, 0]} size={[0.035, 0.018, 14]} />
      <CourtLine position={[COURT_HALF_WIDTH, 0, 0]} size={[0.035, 0.018, 14]} />
      <CourtLine position={[0, 0, -COURT_HALF_LENGTH]} size={[8.5, 0.018, 0.035]} />
      <CourtLine position={[0, 0, COURT_HALF_LENGTH]} size={[8.5, 0.018, 0.035]} />
      <CourtLine position={[0, 0, -2.45]} size={[8.5, 0.018, 0.028]} />
      <CourtLine position={[0, 0, 2.45]} size={[8.5, 0.018, 0.028]} />
      <CourtLine position={[0, 0, -4.725]} size={[0.025, 0.018, 4.55]} />
      <CourtLine position={[0, 0, 4.725]} size={[0.025, 0.018, 4.55]} />

      <mesh position={[0, 0.39, 0]}>
        <planeGeometry args={[8.5, 0.78, 20, 4]} />
        <meshBasicMaterial
          color="#557166"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <boxGeometry args={[8.5, 0.035, 0.035]} />
        <meshBasicMaterial color="#a45b40" transparent opacity={0.74} />
      </mesh>
      {[-COURT_HALF_WIDTH, COURT_HALF_WIDTH].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.8, 8]} />
          <meshStandardMaterial color="#31594a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function makeSeamGeometry(
  direction: number,
  radiusOffset: number,
  tubeRadius: number,
) {
  const points = Array.from({ length: 129 }, (_, index) => {
    const angle = (index / 128) * Math.PI * 2;
    const latitude = direction * 0.56 * Math.sin(angle * 2);
    const seamRadius = BALL_RADIUS + radiusOffset;
    const ringRadius = seamRadius * Math.cos(latitude);
    return new THREE.Vector3(
      ringRadius * Math.cos(angle),
      seamRadius * Math.sin(latitude),
      ringRadius * Math.sin(angle),
    );
  });
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
  return new THREE.TubeGeometry(curve, 128, tubeRadius, 6, true);
}

function Ball({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const ball = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const shadowMaterial = useRef<THREE.ShaderMaterial>(null);
  const elapsedTime = useRef(0);
  const previousPosition = useRef(START_POSITION.clone());
  const rotationAxis = useMemo(() => new THREE.Vector3(), []);
  const rollingRotation = useMemo(() => new THREE.Quaternion(), []);
  const pathPosition = useMemo(() => new THREE.Vector3(), []);
  const surfaceTexture = useMemo(() => {
    const size = 64;
    const pixels = new Uint8Array(size * size * 4);
    let seed = 41;
    for (let index = 0; index < size * size; index += 1) {
      seed = (seed * 16807) % 2147483647;
      const grain = 128 + (seed % 48);
      const pixel = index * 4;
      pixels[pixel] = grain;
      pixels[pixel + 1] = grain;
      pixels[pixel + 2] = grain;
      pixels[pixel + 3] = 255;
    }
    const texture = new THREE.DataTexture(
      pixels,
      size,
      size,
      THREE.RGBAFormat,
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);
  const seams = useMemo(
    () => [
      makeSeamGeometry(1, 0.01, 0.014),
      makeSeamGeometry(-1, 0.01, 0.014),
      makeSeamGeometry(1, 0.026, 0.006),
      makeSeamGeometry(-1, 0.026, 0.006),
    ],
    [],
  );

  useEffect(
    () => () => {
      seams.forEach((geometry) => geometry.dispose());
      surfaceTexture.dispose();
    },
    [seams, surfaceTexture],
  );

  useFrame((_, delta) => {
    if (!ball.current || !shadow.current || !shadowMaterial.current) return;

    if (reducedMotion) {
      ball.current.visible = true;
      ball.current.rotation.set(0.45, 0.3, -1.1);
      ball.current.position.set(REST_POSITION.x, BALL_RADIUS, REST_POSITION.z);
      shadow.current.visible = true;
      shadow.current.position.set(REST_POSITION.x, 0.012, REST_POSITION.z);
      previousPosition.current.copy(REST_POSITION);
      shadowMaterial.current.uniforms.opacity.value = 0.2;
      return;
    }

    elapsedTime.current += delta;
    const time = elapsedTime.current % CYCLE_LENGTH;
    let progress = 0;
    let height = 0;
    let inMotion = true;

    if (time < ROLL_IN_TIME) {
      const linearProgress = time / ROLL_IN_TIME;
      progress =
        linearProgress * linearProgress * (3 - 2 * linearProgress);
      const bounceIn = THREE.MathUtils.clamp((progress - 0.34) / 0.2, 0, 1);
      const bounceOut = THREE.MathUtils.clamp((progress - 0.82) / 0.18, 0, 1);
      height =
        Math.sin(bounceIn * Math.PI) * 0.36 +
        Math.sin(bounceOut * Math.PI) * 0.82;
    } else if (time < ROLL_IN_TIME + SETTLE_TIME + REST_TIME) {
      progress = 1;
      inMotion = false;
      const settleProgress = THREE.MathUtils.clamp(
        (time - ROLL_IN_TIME) / SETTLE_TIME,
        0,
        1,
      );
      height =
        Math.sin(settleProgress * Math.PI * 4) *
        Math.exp(-settleProgress * 5) *
        0.14;
    } else {
      const returnProgress = THREE.MathUtils.clamp(
        (time - ROLL_IN_TIME - SETTLE_TIME - REST_TIME) / RETURN_TIME,
        0,
        1,
      );
      const easedReturn =
        returnProgress * returnProgress * (3 - 2 * returnProgress);
      progress = 1 - easedReturn;
    }

    BALL_PATH.getPointAt(progress, pathPosition);

    ball.current.visible = true;
    shadow.current.visible = true;
    ball.current.position.set(
      pathPosition.x,
      BALL_RADIUS + height,
      pathPosition.z,
    );

    pathPosition.sub(previousPosition.current);
    const distance = Math.hypot(pathPosition.x, pathPosition.z);
    if (inMotion && distance > 0.0001) {
      rotationAxis.set(pathPosition.z, 0, -pathPosition.x).normalize();
      rollingRotation.setFromAxisAngle(rotationAxis, distance / BALL_RADIUS);
      ball.current.quaternion.premultiply(rollingRotation);
    }
    previousPosition.current.copy(BALL_PATH.getPointAt(progress, pathPosition));
    shadow.current.position.set(pathPosition.x, 0.012, pathPosition.z);
    const shadowScale = 1 + height * 0.45;
    shadow.current.scale.set(shadowScale, shadowScale * 0.68, 1);
    shadowMaterial.current.uniforms.opacity.value = 0.25 / (1 + height * 1.3);
  });

  return (
    <>
      <mesh
        ref={shadow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[REST_POSITION.x, 0.012, REST_POSITION.z]}
      >
        <planeGeometry args={[1.45, 1.05]} />
        <shaderMaterial
          ref={shadowMaterial}
          transparent
          depthWrite={false}
          uniforms={{ opacity: { value: 0.2 } }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float opacity;
            void main() {
              float distanceFromCenter = length((vUv - 0.5) * vec2(1.0, 1.25));
              float alpha = (1.0 - smoothstep(0.08, 0.5, distanceFromCenter)) * opacity;
              gl_FragColor = vec4(0.12, 0.18, 0.12, alpha);
            }
          `}
        />
      </mesh>

      <group
        ref={ball}
        position={[
          START_POSITION.x,
          BALL_RADIUS,
          START_POSITION.z,
        ]}
      >
        <mesh castShadow>
          <sphereGeometry args={[BALL_RADIUS, 48, 36]} />
          <meshStandardMaterial
            color="#d7dd76"
            roughness={0.86}
            metalness={0}
            bumpMap={surfaceTexture}
            bumpScale={0.008}
          />
        </mesh>
        {seams.map((geometry, index) => (
          <mesh key={index} geometry={geometry}>
            <meshStandardMaterial
              color={index < 2 ? "#788342" : "#f8f5d6"}
              roughness={0.84}
              metalness={0}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
  }, [invalidate, reducedMotion]);

  return (
    <>
      <CourtCamera />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#fffdf5", "#71816a", 0.8]} />
      <directionalLight
        position={[-4, 9, 7]}
        intensity={2.2}
        color="#fff4d8"
      />
      <directionalLight
        position={[6, 5, -4]}
        intensity={0.35}
        color="#e5efd7"
      />
      <Court />
      <Ball reducedMotion={reducedMotion} />
    </>
  );
}

export default function PadelBallCourtCanvas() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <Canvas
      className="padel-ball-canvas"
      dpr={[1, 1.4]}
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ position: [10, 10.5, 14], fov: 36, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    >
      <Scene reducedMotion={reducedMotion} />
    </Canvas>
  );
}
