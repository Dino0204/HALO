import * as THREE from 'three'

export const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 200, 0),    // Scene 1: 상공
  new THREE.Vector3(0, 120, 20),
  new THREE.Vector3(0, 40, 45),    // Scene 2: 하강
  new THREE.Vector3(0, 8, 60),
  new THREE.Vector3(0, 2, 80),     // Scene 3: 거리
  new THREE.Vector3(0, 2, 110),
  new THREE.Vector3(0, 60, 110),   // Scene 4: 귀결
])
