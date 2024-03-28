
import { _decorator, Component, Node, tween, Vec3, Label, UIOpacity } from 'cc';
import { LevelData } from './data';
import { UIChooseLevel } from './UIChooseLevel';
import { UIResult } from './UIResult';
import { UILoginForm } from './UILoginForm';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

  @property(Node)
  tutorial_screen: Node = null

  @property(Node)
  home_screen: Node = null

  @property(Node)
  ingame_screen: Node = null

  @property(UIChooseLevel)
  UIChooseLevel: UIChooseLevel = null

  @property(Label)
  level_label: Label = null

  @property(Label)
  song_label: Label = null

  @property(UIResult)
  UIResult: UIResult = null

  start() {
    this.setUITutorial()
    this.home_screen.active = false
    this.home_screen.getComponent(UIOpacity).opacity = 0
    this.ingame_screen.active = false
    this.ingame_screen.getComponent(UIOpacity).opacity = 0
  }

  onClickConfirmTutorial() {
    this.setUIHomeScreen()
  }

  setUITutorial() {
    this.animEntrance(this.tutorial_screen)
    this.animExit(this.ingame_screen)
    this.animExit(this.home_screen)
  }

  setUIHomeScreen() {
    this.animEntrance(this.home_screen)
    this.animExit(this.ingame_screen)
    this.animExit(this.tutorial_screen)
  }

  setUIStartGame() {
    this.animEntrance(this.ingame_screen)
    this.animExit(this.tutorial_screen)
    this.animExit(this.home_screen)
  }

  animEntrance(node: Node) {
    node.active = true
    tween(node.getComponent(UIOpacity)).to(0.1, { opacity: 255 }).start()
  }

  animExit(node: Node) {
    tween(node.getComponent(UIOpacity)).to(0.1, { opacity: 0 }).call(() => node.active = false).start()
  }

  setLevel() {
    let level = LevelData.current_level
    let data = LevelData.levels[level % LevelData.levels.length]
    console.log(data)
    this.level_label.string = 'Level ' + (level + 1)
    this.song_label.string = data.name
  }

  showResult(total: number, destroyed: number, bighit: number, score: number) {
    this.UIResult.showUI()
    this.UIResult.showResult(total, destroyed, bighit, score)
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
