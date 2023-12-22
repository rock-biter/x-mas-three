import {
	BoxGeometry,
	CylinderGeometry,
	IcosahedronGeometry,
	Mesh,
	MeshStandardMaterial,
	Object3D,
} from 'three'

const stoneGeometry = new IcosahedronGeometry(1)
const fireGeometry = new BoxGeometry(1, 1, 1)
const stoneMaterial = new MeshStandardMaterial({
	color: '#dedede',
	flatShading: true,
})
const woodGeometry = new CylinderGeometry(1, 1, 5, 4)
woodGeometry.rotateZ(Math.PI * 0.5)
woodGeometry.rotateX(Math.PI * 0.25)
const woodMaterial = new MeshStandardMaterial({ color: '#7E4C22' })

const fireMaterialRed = new MeshStandardMaterial({
	color: '#ff0000',
	transparent: true,
	opacity: 0.8,
})
const fireMaterialYellow = new MeshStandardMaterial({
	color: '#ffee00',
	transparent: true,
	opacity: 0.8,
})

export default class Fire {
	radius = 2
	stonesNumber = 10
	woodsNumber = 3

	flames = []

	constructor() {
		const fire = new Object3D()

		let stones = new Array(this.stonesNumber).fill(1).map((el, i) => {
			const angle = (2 * Math.PI) / this.stonesNumber
			const mesh = new Mesh(stoneGeometry, stoneMaterial)
			const r = this.radius + Math.random() * 0.4 - 0.2
			const x = Math.sin(angle * i) * r
			const z = Math.cos(angle * i) * r

			mesh.scale.set(
				0.5 + Math.random() * 0.5,
				0.4 + Math.random() * 0.2,
				0.5 + Math.random() * 0.2
			)

			mesh.position.set(x, 0, z)
			mesh.lookAt(0, 0, 0)
			mesh.rotation.z = Math.random() - 0.5
			mesh.position.y = Math.random() * 0.5

			console.log(mesh)

			return mesh
		})

		const fireRed = new Mesh(fireGeometry, fireMaterialRed)
		fireRed.name = 'fire'
		const fireYellow = new Mesh(fireGeometry, fireMaterialYellow)
		fireYellow.name = 'fire'

		const fires = new Array(4).fill(1).map((el, i) => {
			const row = i % 2
			const col = Math.floor(i / 2)

			const f = row === col ? fireRed.clone() : fireYellow.clone()

			f.position.set(row - 0.5, 1, col - 0.5)

			f.userData.index = i

			this.flames.push(f)

			return f
		})

		console.log(stones)
		const flame = new Object3D()
		flame.add(
			...fires,
			...fires.map((el, i) => {
				el = el.clone()
				const index = (i + 2) % fires.length
				const row = index % 2
				const col = Math.floor(index / 2)

				el.position.set(row - 0.5, 2, col - 0.5)

				el.userData.index += 4

				this.flames.push(el)

				return el
			})
		)
		// flame.scale.setScalar(0.85)
		// flame.position.y = 0.25
		fire.add(...stones, flame)

		const woods = new Array(this.woodsNumber).fill(1).map((el, i) => {
			const angle = (2 * Math.PI) / this.woodsNumber
			const mesh = new Mesh(woodGeometry, woodMaterial)

			mesh.rotation.y = angle * i
			mesh.position.y = 0.25 + i / 100
			mesh.scale.set(0.5, 0.25, 0.25)

			return mesh
		})

		fire.add(...woods)

		this.mesh = fire
	}
}
