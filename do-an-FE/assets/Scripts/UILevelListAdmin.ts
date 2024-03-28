
import { _decorator, Component, Node, tween, Vec3, UIOpacity, Label, Prefab, instantiate } from 'cc';
import { LevelData } from './APIHelper';
import { LevelRow } from './LevelRow';
const { ccclass, property } = _decorator;

@ccclass('UILevelListAdmin')
export class UILevelListAdmin extends Component {

	@property(Node)
	UI: Node = null

	@property(Node)
	cloak: Node = null

	@property(Node)
	content_node: Node = null

	@property(Prefab)
	level_row_prefab: Prefab = null

	start() {
		this.hideUI()
	}

	showUI() {
		this.UI.active = true
		this.cloak.active = true
		this.cloak.getComponent(UIOpacity).opacity = 0
		tween(this.UI).to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' }).start()
		tween(this.cloak.getComponent(UIOpacity)).to(0.1, { opacity: 255 }).start()
	}

	hideUI() {
		tween(this.UI).to(0.2, { scale: new Vec3(1, 0, 0) }, { easing: 'quadIn' })
			.call(() => {
				this.UI.active = false
			}).start()
		tween(this.cloak.getComponent(UIOpacity)).to(0.1, { opacity: 0 })
			.call(() => {
				this.cloak.active = false
			}).start()
	}

	init(levels: Array<LevelData>) {
		let i = 0
		let pos = new Vec3(0, -80, 0)
		for (let level of levels) {
			i++
			const new_level = instantiate(this.level_row_prefab)
			this.content_node.addChild(new_level)
			new_level.getComponent(LevelRow).init(i, level.name)
			new_level.setPosition(pos)
			pos.add3f(0, -80, 0)
		}
	}
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
