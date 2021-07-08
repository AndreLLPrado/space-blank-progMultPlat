import { compileDeclareDirectiveFromMetadata } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import * as Phaser from 'phaser';
import { Button } from 'protractor';

class GameScene extends Phaser.Scene {
  player: any;
  platforms: any;
  bg: any;
    constructor(config) {
        super(config);
    }

    preload() {
      //Loading Bar System
      var progressBar = this.add.graphics();
      var width = this.cameras.main.width;
      var height = this.cameras.main.height;
      var loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            //fill: '#ffffff'
        }
      });
      loadingText.setOrigin(0.5, 0.5);
      var progressBox = this.add.graphics();

      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(240, 270, 320, 50);

      var percentText = this.make.text({
          x: width / 2,
          y: height / 2 - 5,
          text: '0%',
          style: {
              font: '18px monospace',
              //fill: '#ffffff'
          }
      });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
          font: '18px monospace',
          //fill: '#ffffff'
      }
    });
    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      console.log(value);
      percentText.setText(parseInt(String(value * 100)) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('fileprogress', function (file) {
      console.log(file.src);
      assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', function () {
      console.log('complete');
      progressBox.destroy();
      progressBar.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    //Loading Images
    this.load.image('progressBar','../../assets/img/progressBar.png');
    this.load.image('player','../../assets/img/astronauta(PNG).png');
    this.load.image('ground','../../assets/img/ground.png');
    this.load.image('gravOrb','../../assets/img/gravOrb.png');
    this.load.image('spaceBackGround','../../assets/img/spaceBg.jpg');
    this.load.image('spike', '../../assets/img/simpleSpike.png');
    this.load.image('playerPlaceHolder', '../../assets/img/playerPlaceHolder.png');
    this.load.image('enemyPlaceHolder', '../../assets/img/enemyPlaceHolder.png');
    this.load.image('key', '../../assets/img/key.png');
    this.load.image('hotBar', '../../assets/img/hotBar.png');
    this.load.spritesheet('portal','../../assets//img/portal.png', {frameWidth: 50, frameHeight: 50})
    }

    txtKeys: any;
    create() {
      this.bg = this.add.image(0, 0, 'spaceBackGround').setScale(4);


      this.platformsGenerator();
      this.cameras.main.setBounds(0, 0, 1600, 1200);
      //this.cameras.main.startFollow(this.player);


      //this.physics.add.collider(this.player, this.platforms);
      //this.physics.add.collider(this.player, this.spike);
      /*var hotBar = this.physics.add.image(0, 0, 'hotBar');
      hotBar.setScrollFactor(0, 0);*/
      this.txtKeys = this.add.text(this.cameras.main.width, 0, 'keys collected: ' + this.keysCollected.toString(),
      {font:'24px Arial'}).setScrollFactor(0,0).setOrigin(1,0);
      this.levelComplete = false;
    }

    update() {
      this.playerUpdate();
      if(this.alive){
        //while the player is alive, the camera moves
        this.cameras.main.scrollY += 0.5 * this.time.timeScale;
      }
      else{
        //camera is stoped
        var txtDied = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50,
           'You Died!', {font:'48px Arial'}).setOrigin(0.5, 1);
        txtDied.setScrollFactor(0, 0);
      }
      var txtTitle = this.add.text(0, 0, 'SPACE',{font:'24px Arial'}).setScrollFactor(0, 0);
      this.txtKeys.setText('keys collected: ' + this.keysCollected);
      //number of keys the player need to open portal
      this.endStage(2);
    }

    //platforms
    gravOrb: any;
    spike: any;
    key: any;
    portal: any;
    platformsGenerator() {
      //seting platforms
      this.platforms = this.physics.add.staticGroup();
      this.platforms.create(0, 0, 'ground').setScale(2).refreshBody();

      //seting gravity Orbs
      this.gravOrb = this.physics.add.staticGroup();
      this.gravOrb.create(0, 0, 'gravOrb').setScale(1).refreshBody();

      //seting spikes
      this.spike = this.physics.add.staticGroup();
      this.spike.create(0,0, 'spike').setScale(1).refreshBody();

      //seting keys
      this.key = this.physics.add.group({
        key: 'key'
      });
      this.key.create(0, 0, 'key').setScale(1).refreshBody();

      //portal
      this.portal = this.physics.add.staticGroup();
      //0 = empty spaces, 1 = blocks, 2 = player spawn, 3 = grav orbs, 4 = spikes, 5 = key, 6 = portal
      var screenMatrix = [
        [0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,4,4,0,0,3,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,4,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,5,0,6,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ];

      for(var x = 0; x < screenMatrix[0].length; x++){
        for(var y = 0; y < screenMatrix.length; y++){
          var tile = screenMatrix[y][x];

          if(tile === 1){
                  console.log('ground tile created');
                  this.platforms.create(x * 50, y * 50, 'ground');
               }
          else if(tile === 3){
                console.log('gravOrb created');
                this.platforms.create(x * 50, y * 50, 'gravOrb');
             }
          else if(tile === 2){
            this.playerCreate(x  * 50, y * 50);
          }
          else if(tile === 4){
            console.log('spike created');
            this.spike.create(x * 50, y * 50, 'spike');
          }
          else if(tile === 5){
            console.log('key created');
            this.key.create(x * 50, y * 50, 'key');
          }
          else if(tile === 6){
            console.log('portal created');
            //this.portal = this.physics.add.sprite(x * 50 , y * 50, 'portal', 0);

            this.portal.create(x * 50, y * 50, 'portal', 0);
          }
        }
      }
      console.log(screenMatrix[0].length.toString());
    }
    //player
    grav: number;
    jump: number;
    alive: boolean;
    keysCollected: number;
    levelComplete: boolean;
    playerCreate(x: number, y: number){
      this.grav = 50;
      this.jump = -330;
      //this.player = this.physics.add.image(400, 300,'player').setScale(0.02);
      this.player = this.physics.add.image(x, y,'playerPlaceHolder').setScale(1);
      this.player.body.setGravityY(this.grav);
      this.alive = true;
      this.keysCollected = 0;
    }

    playerUpdate(){

      var keys = this.input.keyboard.createCursorKeys();
      var collided = false;

      //jump
      /*if((this.input.pointer1.isDown ||keys.up.isDown) &&
      (this.player.body.touching.down || this.physics.collide(this.player, this.platforms))){
        this.player.setVelocityY(this.jump);
      }*/
      //move to left
      if(this.alive){
        if(keys.left.isDown ||
          (this.input.pointer1.isDown && this.input.pointer1.position.x < this.cameras.main.width / 2)){
          this.player.setVelocityX(-100);
        }
        //move to right
        else if(keys.right.isDown ||
          (this.input.pointer1.isDown && this.input.pointer1.position.x > this.cameras.main.width / 2)){
          this.player.setVelocityX(100);
        }
        else{
          this.player.setVelocityX(0);
        }

        //move to down
        if(!collided){
          this.player.setVelocityY(this.grav);
        }
        else{
          this.player.setVelocityY(0);
        }

      }
      else{
        console.log('player dead');
      }

      //gravity inversor
      /*
      if(keys.space.isDown && this.physics.collide(this.player, this.platforms)){
        this.grav *= -1;
        this.jump *= -1;
        this.player.body.setGravityY(this.grav);
      }
      */

      //colisions
      //wall
      if(this.physics.collide(this.player, this.platforms)){
        collided = true;
      }
      else{
        collided = false;
      }
      //spikes
      if(this.physics.collide(this.player, this.spike)){
        console.log('collision with spike detected');
        this.alive = false;
        this.player.destroy();
      }
      //camera
      if(this.player.y + 50 < this.cameras.main.scrollY){
        console.log('out of screan');
        this.alive = false;
        this.player.destroy();
      }
      //key
      if(this.physics.overlap(this.player, this.key, this.collectKey, null, this)){
        console.log('collision with key detected');
        //this.key.disableBody(true, true);
      }
      //gravOrb
      if(this.physics.collide(this.player, this.gravOrb)){
        console.log('collision with gravOrb detected')
      }
      //portal
      if(this.physics.collide(this.player, this.portal)){
        this.levelComplete = true;
      }
    }
    collectKey(key){
      //key.disableBody(true, true);
      this.keysCollected += 1;
    }

    endStage(nKeys: number){
      if(this.keysCollected === nKeys){
        //this.portal.setFrame(1);
        if(this.levelComplete){
          var txtStageComplete = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50,
            'Stage Complete', {font:'48px Arial'}).setOrigin(0.5, 1);

        }
      }
    }
  //score system
  // score: number;

  // scoreStart(){
  //   this.score = 0;
  // }
  // scoresystem(){
  //   this.score += 1 * this.time.timeScale;
  // }
}

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    phaserGame: Phaser.Game;
    config: Phaser.Types.Core.GameConfig;

    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade'
            },
            parent: 'game',
            scene: GameScene
        };
    }

    ngOnInit(): void {
        this.phaserGame = new Phaser.Game(this.config);
    }
}
