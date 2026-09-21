import * as THREE from 'three'

export class SceneManager {
  public readonly scene: THREE.Scene

  public constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x10131a)

    const ambientLight = new THREE.HemisphereLight(0xb9d7ff, 0x252b35, 2)
    this.scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(8, 12, 6)
    this.scene.add(keyLight)
  }
}
