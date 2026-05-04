import Phaser from 'phaser'
import type { Hero } from '../entities/Hero'
import type { EnemySpawner } from './EnemySpawner'
import type { HUD } from '../ui/HUD'

export class CollisionManager {
  constructor(
    scene:   Phaser.Scene,
    hero:    Hero,
    spawner: EnemySpawner,
    hud:     HUD,
    groundBody: Phaser.GameObjects.Rectangle,
  ) {
    scene.physics.add.collider(hero.sprite, groundBody)

    const damage = () => {
      if (hero.takeDamage(scene.time.now)) hud.setHP(hero.hp)
    }

    const damageAndDestroy = (_: unknown, go: unknown) => {
      (go as Phaser.Physics.Arcade.Sprite).destroy()
      damage()
    }

    scene.physics.add.overlap(hero.sprite, spawner.wolfGroup,      damage)
    scene.physics.add.overlap(hero.sprite, spawner.fatCatGroup,    damage)
    scene.physics.add.overlap(hero.sprite, spawner.ninjaGroup,     damage)
    scene.physics.add.overlap(hero.sprite, spawner.limoGroup,      damage)
    scene.physics.add.overlap(hero.sprite, spawner.busGroup,       damage)
    scene.physics.add.overlap(hero.sprite, spawner.laserGroup,     damageAndDestroy)
    scene.physics.add.overlap(hero.sprite, spawner.shurikenGroup,  damageAndDestroy)
    scene.physics.add.overlap(hero.sprite, spawner.bombGroup,      damageAndDestroy)
    scene.physics.add.overlap(hero.sprite, spawner.bossLaserGroup, damageAndDestroy)

    scene.physics.add.overlap(
      hero.sprite,
      spawner.bossGroup,
      (heroGO, bossGO) => {
        const heroBody = (heroGO as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
        const bossBody = (bossGO as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
        if (heroBody.velocity.y > 60 && heroBody.bottom <= bossBody.top + 12) {
          spawner.damageEnemy(bossGO as Phaser.Physics.Arcade.Sprite)
          hero.stomp()
          hud.updateBossBar(spawner.bossHP)
        } else {
          damage()
        }
      },
    )
  }
}
