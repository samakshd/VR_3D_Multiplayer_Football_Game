import {FBXLoader} from './lib/fbxLoader.js';
import * as THREE from './lib/three.module.js';
import {MTLLoader} from './lib/mtlLoader.js';
import {OBJLoader} from './lib/objLoader.js';

export class Obstacle{
    #obstacle
    #isReady
    #parent
    #texture
    #material
    #lightInObstacle
    #isLightOn
    constructor(parent,position,type){
        this.#obstacle=null;
        this.#isReady = false;
        this.#parent = parent;
        this.#loadObstacle(position,type);
        this.#texture = null;
        this.#material = null;
        this.#lightInObstacle = new THREE.PointLight(0xFFFFFF,1,1000,0.01);
        this.#lightInObstacle.castShadow = true;
        this.#lightInObstacle.position.y=5;
        this.#isLightOn = false;
        this.#addEventListeners();
    }

    #addEventListeners(){
        window.addEventListener('keydown',(event)=>{if(event.code=='Digit7' && this.#isReady){
            this.#obstacle.traverse((child)=>{if (child instanceof THREE.Mesh) {
                if(this.#isLightOn){
                    child.material = this.#material;
                    child.castShadow = true;
                    this.#lightInObstacle.removeFromParent();
                    
                }
                else{
                    child.material = new THREE.MeshStandardMaterial({emissiveMap:this.#texture, emissive:0xFFFFFF})
                    child.castShadow = false;
                    this.#obstacle.add(this.#lightInObstacle);
                }
                this.#isLightOn = !this.#isLightOn;
                
            }});
        }})
    }


    #loadObstacle = (position,type)=> new Promise((resolve)=>{
        new MTLLoader().load(`./models/obstacle/${type}.mtl`, (materials)=>{
            materials.preload();
            new OBJLoader().setMaterials(materials).load(`./models/obstacle/${type}.obj`, (obstacle)=>{
                this.#texture = new THREE.TextureLoader().load('./textures/obstacleTexture.jpg');
                this.#texture.mapping = THREE.CubeRefractionMapping;
                obstacle.traverse((child)=>{if (child instanceof THREE.Mesh) {
                    child.material.map = this.#texture;
                    child.castShadow = true;
                    this.#material = child.material;
                }});
                
                obstacle.position.copy(new THREE.Vector3(position[0],2,position[1]));
                this.#obstacle = obstacle;
                this.#isReady = true;
                this.#parent.add(obstacle);
            });
        });
    })
    
    getBoundingBox(){
        return (this.#isReady)?new THREE.Box3().setFromObject(this.#obstacle):new THREE.Box3().makeEmpty();
    }
}