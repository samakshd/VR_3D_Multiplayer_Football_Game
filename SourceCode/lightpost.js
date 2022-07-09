import * as THREE from './lib/three.module.js';
import {MTLLoader} from './lib/mtlLoader.js';
import {OBJLoader} from './lib/objLoader.js';

export class Lightpost{
    #lightpost
    #isReady
    #parent
    
    constructor(parent){
        this.#lightpost=null;
        this.#isReady = false;
        this.#parent = parent;
        this.#loadLightpost();
    }


    #loadLightpost = ()=> new Promise((resolve)=>{
        [[5000,2000],[-5000,2000],[5000,-2000],[-5000,-2000],[0,2000],[0,-2000]].forEach(position=>{
            new MTLLoader().load('./models/lightpost/lightpost.mtl', (materials)=>{
                materials.preload();
                new OBJLoader().setMaterials(materials).load('./models/lightpost/lightpost.obj', (lightpost)=>{
                    let texture = new THREE.TextureLoader().load('./textures/obstacleTexture.jpg');
                    texture.mapping = THREE.CubeRefractionMapping;
                    lightpost.traverse((child)=>{if (child instanceof THREE.Mesh) { 
                        child.material.map = this.texture;
                    }});
                    
                    

                    lightpost.scale.x = lightpost.scale.y = lightpost.scale.z = 50;
                    lightpost.position.set(position[0],50,position[1]);
                    lightpost.lookAt(0,0,0);
                    lightpost.rotation.y+= (position[1]>0?1:-1)*Math.PI/2;
                    this.#lightpost = lightpost;
                    this.#isReady = true;
                    
                    this.#parent.add(lightpost);
                });
            });

        })
    })
    
    getBoundingBox(){
        return (this.#isReady)?new THREE.Box3().setFromObject(this.#lightpost):new THREE.Box3().makeEmpty();
    }
}