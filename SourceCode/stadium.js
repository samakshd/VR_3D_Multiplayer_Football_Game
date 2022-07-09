import * as THREE from './lib/three.module.js';
import {MTLLoader} from './lib/mtlLoader.js';
import {OBJLoader} from './lib/objLoader.js';

export class Stadium{
    #stadium
    #isReady
    #parent
    
    constructor(parent){
        this.#stadium=null;
        this.#isReady = false;
        this.#parent = parent;
        this.#loadStadium();
    }


    #loadStadium = ()=> new Promise((resolve)=>{
        
        new MTLLoader().load('./models/stadium/stadium.mtl', (materials)=>{
            materials.preload();
            new OBJLoader().setMaterials(materials).load('./models/stadium/stadium.obj', (stadium)=>{
                stadium.scale.x = stadium.scale.y = stadium.scale.z = 0.1;
                stadium.rotation.y+=Math.PI/2;
                this.#stadium = stadium;
                this.#isReady = true;
                
                this.#parent.add(stadium);
            });
        });
    })
    
    getBoundingBox(){
        return (this.#isReady)?new THREE.Box3().setFromObject(this.#stadium):new THREE.Box3().makeEmpty();
    }
}