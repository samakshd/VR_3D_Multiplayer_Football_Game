import * as THREE from './lib/three.module.js';
import {MTLLoader} from './lib/mtlLoader.js';
import {OBJLoader} from './lib/objLoader.js';

export class Goalpost{
    #goalpost
    #isReady
    #parent
    
    constructor(parent,playerType){
        this.#goalpost=null;
        this.#isReady = false;
        this.#parent = parent;
        this.#loadGoalpost(playerType);
    }


    #loadGoalpost = (playerType)=> new Promise((resolve)=>{
        new MTLLoader().load('./models/goalpost/goalpost.mtl', (materials)=>{
            materials.preload();
            new OBJLoader().setMaterials(materials).load('./models/goalpost/goalpost.obj', (goalpost)=>{
                let texture = new THREE.TextureLoader().load('./textures/obstacleTexture.jpg');
                texture.mapping = THREE.CubeRefractionMapping;
                goalpost.traverse((child)=>{if (child instanceof THREE.Mesh) {
                    if(playerType=='OPPONENT'&& child.name=='Frame') child.material.color = new THREE.Color(0xFF0000);
                    else if(playerType=='USER'&& child.name=='Frame') child.material.color = new THREE.Color(0x0000FF);
                    
                    child.material.map = this.texture;
                    child.castShadow = true;
                }});
                goalpost.scale.x = goalpost.scale.y = goalpost.scale.z = 3 ;
                if(playerType=='USER') {
                    goalpost.rotation.y+=Math.PI/2;
                    goalpost.position.x = 4600;
                }
                else if(playerType=='OPPONENT' ) {
                    goalpost.rotation.y-=Math.PI/2;
                    goalpost.position.x = -4600;
                }
                this.#goalpost = goalpost;
                this.#isReady = true;
                
                this.#parent.add(goalpost);

            });
        });
    })
    
    getBoundingBox(){
        return (this.#isReady)?new THREE.Box3().setFromObject(this.#goalpost):new THREE.Box3().makeEmpty();
    }
}