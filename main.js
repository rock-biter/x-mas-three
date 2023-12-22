import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import * as dat from 'lil-gui'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import Tree from './src/Tree'
import { createNoise2D } from 'simplex-noise'
import { Mesh } from 'three'
import { PlaneGeometry } from 'three'
import { MeshStandardMaterial } from 'three'
import { Object3D } from 'three'
import modelSrc from './src/assets/x-mas/ChristmasAssets.obj?url'
import textureSrc from './src/assets/x-mas/Texture/Texture_Christmas.png?url'
import normalSnow from './src/assets/snow-normal.png?url'
import Fire from './src/Fire'
import fontSrc from 'three/examples/fonts/droid/droid_sans_bold.typeface.json?url'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
// import mtlSrc from './src/assets/x-mas/ChristmasAssets.mtl?url'

const fontLoader = new FontLoader()

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
// const material = new THREE.MeshNormalMaterial()
// const geometry = new THREE.BoxGeometry(1, 1, 1)

/**
 * X-mas assets
 */
const loader = new OBJLoader()
// const mtlLoader = new MTLLoader()
const textureLoader = new THREE.TextureLoader()

const texture = textureLoader.load(textureSrc)
texture.colorSpace = THREE.SRGBColorSpace

let regalo1, regalo2, slitta, albero, renna, olaf, santa

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

	santa.position.z = -5
	santa.geometry.translate(0, 17.5, 0)
	santa.position.y = getY(0, -5)

	olaf.geometry.translate(0, 11, 0)
	olaf.add(new THREE.AxesHelper(30))
	santa.add(new THREE.AxesHelper(30))
	olaf.position.set(-8, getY(-8, -4), -4)
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

const size = 6
const resolution = 40
const trees = new Object3D()

for (let i = 0; i < resolution; i++) {
	for (let j = 0; j < resolution; j++) {
		const x = i * size - resolution * 0.5 * size
		const z = j * size - resolution * 0.5 * size

		const scalar = noise(x * 0.03, z * 0.03)
		const position = new THREE.Vector3(x, scalar, z)

		const distance = position.length()
		const limit = distance > resolution * 0.3 * 6 ? -0.5 : 0

		if (
			scalar < limit ||
			distance > resolution * 0.5 * size ||
			distance < resolution * 0.1 * 6
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

const normalMap = textureLoader.load(normalSnow)
normalMap.repeat.set(50, 50)
normalMap.wrapS = THREE.RepeatWrapping
normalMap.wrapT = THREE.RepeatWrapping

const ground = new Mesh(
	new PlaneGeometry(resolution * 6 * 2, resolution * 6 * 2, 400, 400),
	new MeshStandardMaterial({
		color: 'white',
		wireframe: false,
		normalMap: normalMap,
		normalScale: new THREE.Vector2(0.08, 0.08),
	})
)
ground.geometry.rotateX(-Math.PI * 0.5)
ground.receiveShadow = true

const position = ground.geometry.getAttribute('position')

for (let i = 0; i < position.count; i++) {
	const x = position.getX(i)
	const z = position.getZ(i)
	// const x = position.getX()

	position.setY(i, getY(x, z))
}

position.needsUpdate = true
ground.geometry.computeVertexNormals()

scene.add(ground)

scene.fog = new THREE.Fog(0x222266, 60, 110)
scene.background = new THREE.Color(0x222266)

function getY(x, z) {
	let scalar = noise(x * 0.03, z * 0.03)
	scalar *= scalar > 0 ? 3 : 3 + 2 * scalar
	const v = new THREE.Vector2(x, z)
	if (v.length() < 10) {
		scalar *= (v.length() / 10) ** 2
	}
	return scalar
}

/**
 * Text
 */

let font, fontMesh
const fontMaterial = new MeshStandardMaterial({
	color: '#ffffff',
	// normalMap: normalMap,
})
const fontSize = 7.5
const fontRadius = 22

fontLoader.load(fontSrc, (f) => {
	font = f

	const text = 'RESCUE SANTA'

	const o = new Object3D()

	const chars = text
		.split('')
		.reverse()
		.map((char, i) => {
			if (char === ' ') return new Object3D()

			const geom = new TextGeometry(`${char}`, {
				font: font,
				size: fontSize,
				height: 3,
				curveSegments: 20,
				bevelEnabled: true,
				bevelThickness: 0.1,
				bevelSize: 0.5,
				bevelOffset: 0,
				bevelSegments: 10,
			})
			geom.center()
			// geom.rotateY(Math.PI)

			const mesh = new Mesh(geom, fontMaterial)

			const angle = Math.PI / 10
			const x = Math.sin(i * angle) * fontRadius
			const z = Math.cos(i * angle) * fontRadius

			mesh.position.set(x, 3 + getY(x, z), z)
			mesh.lookAt(0, -2 + Math.random() * 8, 0)

			return mesh
		})

	o.add(...chars)
	o.rotation.y = Math.PI * 0.75

	scene.add(o)
})

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

const fire = new Fire()
fire.mesh.position.y = getY(fire.mesh.position.x, fire.mesh.position.z)
scene.add(fire.mesh)

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
controls.enablePan = false
controls.maxPolarAngle = Math.PI * 0.4
controls.minPolarAngle = Math.PI * 0.1
controls.maxDistance = 40
controls.minDistance = 10

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

	fire.flames.forEach((el, i) => {
		const offset = i * 10
		const n = noise(time * 1.5 + offset, time * 1.5 + offset)
		el.material.opacity = 0.8 + n * 0.2
		el.scale.setScalar(0.8 - i / 12 + n * 0.2)
	})

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
