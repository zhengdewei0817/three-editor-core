import * as THREE from "three";

export function pxToWorld(
  pxHeight: number,
  camera: THREE.Camera,
  distance: number
) {
  // camera.fov 单位是角度
  const fov = (camera.fov * Math.PI) / 180;
  const worldHeightAtDist = 2 * Math.tan(fov / 2) * distance; // 当前距离下世界坐标的总高度
  const worldPerPixel = worldHeightAtDist / window.innerHeight; // 每个像素对应的世界单位
  return pxHeight * worldPerPixel;
}

export function getObjectWorldHeight(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  return size.y; // 高度（世界单位）
}
