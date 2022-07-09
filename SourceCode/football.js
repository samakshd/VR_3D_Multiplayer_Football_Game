import {FBXLoader} from './lib/fbxLoader.js';
import * as THREE from './lib/three.module.js';
import {MTLLoader} from './lib/mtlLoader.js';
import {OBJLoader} from './lib/objLoader.js';

//Referenece: https://www.youtube.com/watch?v=8n_v1aJmLmc
 //reference https://github.com/mrdoob/three.js/issues/1606
//reference https://betterprogramming.pub/how-to-create-your-own-event-emitter-in-javascript-fbd5db2447c4
//Model taken from mixamo
export class Football{
    #football
    #isReady
    #parent
    #mode
    #shootDistanceRemaining
    #shootDirection
    #texture
    #material
    #lightInBall
    #isLightOn
    constructor(parent){
        this.#football=null;
        this.#isReady = false;
        this.#parent = parent;
        this.#loadFootball();
        this.#addEventListeners();
        this.#shootDirection = new THREE.Vector3();
        this.#shootDistanceRemaining = 0;
        this.#texture = null;
        this.#material = null;
        this.#lightInBall = new THREE.PointLight(0xFFFFFF,1,1000,0.01);
        this.#lightInBall.castShadow = true;
        this.#isLightOn = false;
    }

    #loadFootball = ()=> new Promise((resolve)=>{
        new MTLLoader().load('./models/sphere/sphere.mtl', (materials)=>{
            materials.preload();
            new OBJLoader().setMaterials(materials).load('./models/sphere/sphere.obj', (football)=>{
                this.#texture = new THREE.TextureLoader().load('./textures/footballTextureSpherical.jpg');
                
                football.traverse((child)=>{if (child instanceof THREE.Mesh) {
                    child.material.map = this.#texture;
                    child.castShadow = true;
                    this.#material = child.material;
                    
                }});
                
                
                
                this.#football = football;
                this.#isReady = true;
                this.reset(this.#parent);
            });
        });
    })
    
    #addEventListeners(){
        window.addEventListener('keydown',(event)=>{if(event.code=='Digit0' && this.#isReady){
            this.#football.traverse((child)=>{if (child instanceof THREE.Mesh) {
                if(this.#isLightOn){
                    child.material = this.#material;
                    child.castShadow = true;
                    this.#lightInBall.removeFromParent();
                    
                }
                else{
                    child.material = new THREE.MeshStandardMaterial({emissiveMap:this.#texture, emissive:0xFFFFFF})
                    child.castShadow = false;
                    this.#football.add(this.#lightInBall);
                }
                this.#isLightOn = !this.#isLightOn;
                
            }});
        }})
    }

    getBoundingBox(){
        return (this.#isReady)?new THREE.Box3().setFromObject(this.#football):new THREE.Box3().makeEmpty();
    }

    setMode(mode){
        if(mode=='DRIBBLE'){
            this.#football.position.set(0,15,70);
        }
        else if(mode=='STILL'){
            this.#football.position.set(0,15,0);
            this.#football.rotation.set(0,0,0);
        }
        else if(mode=='CARRY'){
            this.#football.position.set(0,170,0);
            this.#football.rotation.set(0,0,0);
        }
        else if(mode=='SHOOT'){
            this.#football.position.y = 15;
            this.#shootDistanceRemaining = 1000
        }
        else if(mode=='SHORT_SHOOT'){
            this.#football.position.y = 15;
            this.#shootDistanceRemaining = 300
            mode = 'SHOOT';
        }

        this.#mode = mode;       
    }
    setParent(parent){
        this.#parent = parent;
        if(!this.#isReady) return;
        
        this.#football.updateMatrixWorld(true);
        
        let meshPosition = new THREE.Vector3();
        this.#football.getWorldPosition(meshPosition);
        this.#football.getWorldDirection(this.#shootDirection);
        
        this.#parent.add(this.#football);
        
        this.#football.updateMatrixWorld(true);
        this.#football.worldToLocal(meshPosition);
        this.#football.position.copy(meshPosition);
        
        this.#football.updateMatrixWorld(true); 
    }
    collide(){
        if(this.#mode=='SHOOT'){
            this.#shootDistanceRemaining+=10;
            this.#shootDirection.negate();
            this.#shootDirection.x+= 2*(Math.random()-0.5);
            this.#shootDirection.z+= 2*(Math.random()-0.5);
        }
    }
    #dribble(){
        this.#football.rotation.x+=0.3;
    }

    
    #shoot(){
        if(this.#shootDistanceRemaining>0){
            this.#shootDistanceRemaining-=10;
            this.#football.rotation.x+=0.3;
            this.#football.position.x+=this.#shootDirection.x*10;
            this.#football.position.y+=this.#shootDirection.y*10;
            this.#football.position.z+=this.#shootDirection.z*10;
        }
    }

    updateAction(){
        if(this.#mode=='DRIBBLE' && this.#isReady){
            this.#dribble();
        }
        if(this.#mode == 'SHOOT' && this.#isReady){
            this.#shoot();
        }
    }

    getParent=()=>this.#football.parent;

    getMesh = ()=>this.#football

    reset=(parent)=>{
        this.setParent(parent);
        if(this.#isReady) this.setMode('STILL');
    }

    ready=()=>this.#isReady;
}