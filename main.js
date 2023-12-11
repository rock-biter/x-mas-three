import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import Tree from './src/Tree'
import { createNoise2D } from 'simplex-noise'
import { Mesh } from 'three'
import { PlaneGeometry } from 'three'
import { MeshStandardMaterial } from 'three'
import { Object3D } from 'three'
import modelSrc from './src/assets/x-mas/ChristmasAssets.obj?url'
import textureSrc from './src/assets/x-mas/Texture/Texture_Christmas.png?url'
import mtlSrc from './src/assets/x-mas/ChristmasAssets.mtl?url'

const noise = createNoise2D()

/**
 * Debug
 */
// const gui = new dat.GUI()

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * BOX
 */
const material = new THREE.MeshNormalMaterial()
const geometry = new THREE.BoxGeometry(1, 1, 1)

/**
 * X-mas assets
 */
const loader = new OBJLoader()
const mtlLoader = new MTLLoader()
const textureLoader = new THREE.TextureLoader()

const texture = textureLoader.load(textureSrc)

let regalo1, regalo2, slitta, albero, renna, olaf, santa

mtlLoader.load(mtlSrc, (mat) => {
	// loader.setMaterials(mat)
	loader.load(modelSrc, (obj) => {
		// obj.scale.set(0.1)
		// scene.add(obj)
		// obj.scale.setScalar(0.1)
		// obj.rotation.y = Math.PI

		obj.traverse((o) => {
			if (o instanceof THREE.Mesh) {
				o.material.map = texture
				o.geometry.center()
				o.scale.setScalar(0.1)
				o.rotation.y = -Math.PI
				o.position.set(0, 0, 0)
				o.castShadow = true
			}
		})

		regalo1 = obj.children[0]
		regalo2 = obj.children[1]
		slitta = obj.children[2]
		albero = obj.children[3]
		renna = obj.children[4]
		olaf = obj.children[5]
		santa = obj.children[6]

		santa.position.z = -7
		santa.position.y = getY(0, -5) + 1.8

		olaf.position.set(-8, getY(-6, -2) + 1.2, -4)
		olaf.rotation.y = Math.PI * -0.6
		slitta.quaternion.copy(new THREE.Quaternion().random())

		let x = Math.random() * 4 + 6
		let z = Math.random() * 4 + 6
		x *= Math.random() > 0.5 ? 1 : -1
		z *= Math.random() > 0.5 ? 1 : -1

		slitta.position.set(x, getY(x, z) + 1, z)

		scene.add(santa, olaf, slitta)

		for (let i = 0; i < 40; i++) {
			let x = Math.random() * 25 + 4
			let z = Math.random() * 25 + 4
			x *= Math.random() > 0.5 ? 1 : -1
			z *= Math.random() > 0.5 ? 1 : -1
			const pos = new THREE.Vector3(x, getY(x, z), z)

			const r = Math.random() > 0.5 ? regalo1.clone() : regalo2.clone()
			r.position.copy(pos)

			r.quaternion.copy(new THREE.Quaternion().random())

			scene.add(r)
		}

		for (let i = 0; i < 6; i++) {
			let x = Math.random() * 20 + 4
			let z = Math.random() * 20 + 4
			x *= Math.random() > 0.5 ? 1 : -1
			z *= Math.random() > 0.5 ? 1 : -1
			const pos = new THREE.Vector3(x, getY(x, z), z)

			const r = renna.clone()
			r.position.copy(pos)

			if (Math.random() > 0.5) {
				r.quaternion.copy(new THREE.Quaternion().random())
			} else {
				r.rotation.y = Math.random() * Math.PI * 2
				r.position.y += 1
			}

			scene.add(r)
		}
	})
	// loader.setMaterials(mat)
})

const size = 6
const resolution = 40
const trees = new Object3D()

for (let i = 0; i < resolution; i++) {
	for (let j = 0; j < resolution; j++) {
		const x = i * size - resolution * 0.5 * size
		const z = j * size - resolution * 0.5 * size

		const scalar = noise(x * 0.03, z * 0.03)
		const position = new THREE.Vector3(x, scalar, z)

		if (
			scalar < -0.5 ||
			position.length() > resolution * 0.3 * size ||
			position.length() < resolution * 0.1 * 6
		)
			continue
		const tree = new Tree()
		tree.mesh.position.set(x, scalar * 1.5, z)
		tree.mesh.scale.setScalar(0.8 + Math.max(0.3, scalar + 1))
		tree.mesh.rotation.y = Math.PI * scalar
		tree.mesh.position.x += scalar * 2
		tree.mesh.position.z += scalar * 2
		tree.mesh.traverse((o) => {
			if (o instanceof THREE.Mesh) {
				o.receiveShadow = true
			}
		})
		trees.add(tree.mesh)
	}
}

scene.add(trees)

const ground = new Mesh(
	new PlaneGeometry(resolution * 6 * 2, resolution * 6 * 2, 400, 400),
	new MeshStandardMaterial({ color: 'white', wireframe: false })
)
ground.geometry.rotateX(-Math.PI * 0.5)
ground.receiveShadow = true

const position = ground.geometry.getAttribute('position')

for (let i = 0; i < position.count; i++) {
	const x = position.getX(i)
	const z = position.getZ(i)
	// const x = position.getX()

	position.setY(i, getY(x, z), 0)
}

position.needsUpdate = true
ground.geometry.computeVertexNormals()

scene.add(ground)

scene.fog = new THREE.Fog(0x222266, 60, 90)
scene.background = new THREE.Color(0x222266)

function getY(x, z) {
	const scalar = noise(x * 0.03, z * 0.03)
	return scalar * (scalar > 0 ? 3 : 1 - scalar)
}

// loader.setMaterials

// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}
/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(20, 15, 20)
// camera.lookAt(new THREE.Vector3(0, 0, 0))

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

const ambLight = new THREE.AmbientLight(0x222266, 0.9)
const dirLight = new THREE.DirectionalLight(0x333366, 3.5)
dirLight.position.set(10, 10, 10)
const pointLight = new THREE.PointLight('#ff3300', 7, 35, 0.5)
const pointLightInner = new THREE.PointLight('#33ff00', 4, 25, 0.8)
pointLightInner.castShadow = true
// pointLightInner.shadow.blurSamples = 20
pointLightInner.shadow.radius = 20
pointLightInner.shadow.mapSize.width = 2048
pointLightInner.shadow.mapSize.height = 2048

pointLight.castShadow = true
pointLight.shadow.mapSize.width = 2048
pointLight.shadow.mapSize.height = 2048
// pointLight.shadow.blurSamples = 20
pointLight.shadow.radius = 20

pointLight.position.y = getY(0, 0) + 3
pointLightInner.position.y = getY(0, 0) + 3

const moonlight = new THREE.SpotLight(
	0x5555ee,
	3,
	150,
	Math.PI * 0.1,
	0.8,
	0.01
)
moonlight.position.set(80, 40, 0)
// moonlight.castShadow = true
// moonlight.shadow.radius = 10
moonlight.shadow.blurSamples = 20
moonlight.shadow.focus = 4
moonlight.shadow.mapSize.width = 2048
moonlight.shadow.mapSize.height = 2048
// moonlight.shadowMap.setMap(1024, 1024)

scene.add(ambLight, dirLight, pointLight, pointLightInner, moonlight)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.toneMappingExposure = 4
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
document.body.appendChild(renderer.domElement)
handleResize()

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.2

/**
 * Three js Clock
 */
const clock = new THREE.Clock()

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	// const deltaTime = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	const time = clock.getElapsedTime()

	trees.children.forEach((t) => {
		const { x, z } = t.position
		const v = noise(x * 0.03 + time * 0.2, z * 0.03 + time * 0.2)

		t.rotation.x = Math.PI * 0.03 * v
		t.rotation.z = Math.PI * 0.03 * v
	})

	pointLightInner.intensity = 4 + noise(time * 3, time * 3)
	pointLight.intensity = 6 + noise(time, time)

	pointLight.position.x = noise(time * 2, time * 2) * 0.1
	pointLightInner.position.x = noise(time * 2, time) * 0.1
	pointLight.position.z = noise(time * 2, time * 2) * 0.1
	pointLightInner.position.z = noise(time * 2, time * 2) * 0.1

	controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
