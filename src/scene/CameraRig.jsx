import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { cameraPath } from "../utils/cameraPath";

const _lookTarget = new THREE.Vector3();
const _cityTarget = new THREE.Vector3(0, 0, 30);

export default function CameraRig() {
  const scroll = useScroll();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Scene 3 마우스 인터랙션
  useEffect(() => {
    window._518mouseRef = mouseRef;
    return () => {
      if (window._518mouseRef === mouseRef) {
        delete window._518mouseRef;
      }
    };
  }, []);

  useFrame(({ camera }) => {
    const t = scroll.offset;
    const pos = cameraPath.getPoint(t);
    camera.position.copy(pos);

    // lookAt: getTangent로 방향 계산
    const tangent = cameraPath.getTangent(Math.min(t, 0.999));
    _lookTarget.copy(pos).addScaledVector(tangent, 5);

    // Scene 4(t>0.8): tangent가 하늘을 향하므로 도시 중심으로 blending
    if (t > 0.8) {
      const scene4Progress = THREE.MathUtils.smoothstep(t, 0.8, 1.0);
      _lookTarget.lerp(_cityTarget, scene4Progress);
    }

    camera.lookAt(_lookTarget);

    // Scene 3 구간에서 마우스 yaw/pitch 오프셋
    if (t > 0.55 && t < 0.8) {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      camera.rotation.y += mx * ((8 * Math.PI) / 180);
      camera.rotation.x += my * ((4 * Math.PI) / 180);
    }
  });

  return null;
}
