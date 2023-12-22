import {
	MeshStandardMaterial,
	Object3D,
	RepeatWrapping,
	TextureLoader,
	Vector2,
} from 'three'
import { BoxGeometry } from 'three'
import { Mesh } from 'three'
import normalSnow from './assets/snow-normal.png?url'

const textureLoader = new TextureLoader()

const normalMap = textureLoader.load(normalSnow)
normalMap.repeat.set(0.1, 0.1)
normalMap.wrapS = RepeatWrapping
normalMap.wrapT = RepeatWrapping

const brown = new MeshStandardMaterial({ color: '#7E4C22' })
// const gree = new MeshStandardMaterial({ color: '#3C871C' })
const gree = new MeshStandardMaterial({ color: '#4e8905' })
const white = new MeshStandardMaterial({
	color: 'white',
	normalMap: normalMap,
	normalScale: new Vector2(0.15, 0.15),
})
const box = new BoxGeometry(1, 1, 1)

export default class Tree {
	constructor() {
		const frustum = new Mesh(box, brown)

		frustum.scale.y = 1
		// frustum.position.y = 0.25

		const tree = new Object3D()

		tree.add(frustum)

		const top = new Mesh(box, gree)
		top.scale.y = 1
		top.position.y = 2

		const side = new Mesh(box, gree)
		const snow = new Mesh(box, white)

		const sides = [
			[0.75, 0],
			[0, 0.75],
			[-0.75, 0],
			[0, -0.75],
		].map(([x, z], i) => {
			const o = new Object3D()
			o.add(side.clone())
			o.add(snow.clone())

			o.children.forEach((c, i) => {
				c.scale.y = 0.5
				c.scale.x = x ? 0.5 : 1
				c.scale.z = z ? 0.5 : 1
				c.position.y = 0.25 + 0.5 * i
			})

			// o.position.x = i + 1
			o.position.set(x, 0.5, z)

			return o
		})

		// console.log(sides)

		tree.add(top, ...sides)

		this.mesh = tree
	}
}
