import {FBXLoader} from './lib/fbxLoader.js';
import * as THREE from './lib/three.module.js';
//Referenece: https://www.youtube.com/watch?v=8n_v1aJmLmc
 //reference https://github.com/mrdoob/three.js/issues/1606
        
//Model taken from mixamo
export class Player{
    #player
    #clock
    #isReady
    #mixer
    #mode
    #animations;
    #onModeChangeEvents
    #parent
    #camera
    #canRise
    #playerType
    constructor(playerType,parent){
        this.#camera = new THREE.PerspectiveCamera(100,window.innerWidth/window.innerHeight,0.1,5000);
        this.#camera.position.y = 150;
        this.#camera.position.z=40;
        this.#camera.lookAt(0,125,60)
        this.#onModeChangeEvents = {
            'RUN':[],
            'STAND':[],
            'SHOOT':[],
            'FALL':[],
            'RISE':[],
            'WALK':[]
        }
        this.#mode = null;
        this.#mixer = null;
        this.#clock = new THREE.Clock();
        this.#isReady=false;
        this.#animations = {};
        this.#player = null;
        this.#parent = parent;
        this.#loadPlayer(playerType);
        this.#canRise = false;
        this.#playerType=playerType;
    }

    onModeChange(animation,listener){
        this.#onModeChangeEvents[animation].push(listener);
    }

    #loadPlayer = (playerType)=> {new FBXLoader().load(`./models/player/character.fbx`,async (player)=>{
        player.traverse(child=>{
            if(playerType=='OPPONENT' && child.name=='Ch38_Shirt') child.material.color = new THREE.Color(0xFF0000);
            else if(child.name=='Ch38_Shirt') child.material.color = new THREE.Color(0x0000FF);
            child.castShadow = true;
        });
        await this.#loadAnimations(player);
        this.#parent.add(player);
    
        this.#addEventListeners();
        player.add(this.#camera)
        this.#player = player;
        this.#isReady = true;
        this.reset();
        
    })}
    
    async #loadAnimations(player){
        this.#mixer = new THREE.AnimationMixer(player);
        const fbxLoader = new FBXLoader();
        this.#animations['RUN'] = await new Promise(resolve=>{fbxLoader.load(`./models/player/Running.fbx`,(animation)=>{resolve(animation)})})
        this.#animations['WALK'] = await new Promise(resolve=>{fbxLoader.load(`./models/player/Walking.fbx`,(animation)=>{resolve(animation)})})
        this.#animations['STAND'] = await new Promise(resolve=>{fbxLoader.load(`./models/player/Standing.fbx`,(animation)=>{resolve(animation)})})        
        this.#animations['SHOOT'] = await new Promise(resolve=>{fbxLoader.load(`./models/player/Shooting.fbx`,(animation)=>{resolve(animation)})}) 
        this.#animations['RISE'] = await new Promise(resolve=>{fbxLoader.load(`./models/player/Rising.fbx`,(animation)=>{resolve(animation)})}) 
        this.#animations['FALL'] = await new Promise(resolve=>{fbxLoader.load(`./models/player/Falling.fbx`,(animation)=>{resolve(animation)})}) 
        
        this.#mixer.addEventListener('finished',()=>{
            if(['SHOOT','RISE'].includes(this.#mode)) {
                this.changeMode('STAND');
            }
            if(['FALL'].includes(this.#mode)) {
                this.#canRise =true;
            }
        })
    }
    
    #addEventListeners(){
        window.addEventListener('keydown',(event)=>{if(this.#isReady && this.#canMove()){
            switch(event.code){
                case 'Numpad6': {if(this.#playerType=='USER'){this.#player.rotation.y-=0.2};break;}
                case 'Numpad4': {if(this.#playerType=='USER'){this.#player.rotation.y+=0.2};break;}
                case 'Numpad8':{if(this.#playerType=='USER'){this.changeMode('WALK')}; break;}
                case 'Numpad5':{if(this.#playerType=='USER'){this.changeMode('RUN')}; break;}
                case 'Numpad2':{if(this.#playerType=='USER'){this.changeMode('SHOOT')};break;}
                case 'Numpad7': {if(this.#playerType=='USER'){this.#camera.rotation.y = Math.max(this.#camera.rotation.y-0.1,-0.5)};break;}
                case 'Numpad9': {if(this.#playerType=='USER'){this.#camera.rotation.y = Math.min(this.#camera.rotation.y+0.1,0.5)};break;}

                case 'KeyD': {if(this.#playerType=='OPPONENT'){this.#player.rotation.y-=0.2};break;}
                case 'KeyA': {if(this.#playerType=='OPPONENT'){this.#player.rotation.y+=0.2};break;}
                case 'KeyW':{if(this.#playerType=='OPPONENT'){this.changeMode('WALK')}; break;}
                case 'KeyS':{if(this.#playerType=='OPPONENT'){this.changeMode('RUN')}; break;}
                case 'KeyX':{if(this.#playerType=='OPPONENT'){this.changeMode('SHOOT')};break;}
                case 'KeyQ': {if(this.#playerType=='OPPONENT'){this.#camera.rotation.y = Math.max(this.#camera.rotation.y-0.1,-0.5)};break;}
                case 'KeyE': {if(this.#playerType=='OPPONENT'){this.#camera.rotation.y = Math.min(this.#camera.rotation.y+0.1,0.5)};break;}
            }
        }})

        window.addEventListener('keydown',(event)=>{if(this.#isReady && this.#canRise){
            switch(event.code){
                case 'Numpad2': {if(this.#playerType=='USER'){this.#canRise = false; this.changeMode('RISE')}; break;}
                case 'KeyX': {if(this.#playerType=='OPPONENT'){this.#canRise = false; this.changeMode('RISE')}; break;}
            }
        }})

        window.addEventListener('keyup',(event)=>{if(this.#isReady && this.#canMove()){
            switch(event.code){
                case 'Numpad8':{if(this.#mode=='WALK' && this.#playerType=='USER') this.changeMode('STAND');break;}
                case 'Numpad5':{if(this.#mode=='RUN' && this.#playerType=='USER')this.changeMode('STAND'); break;}
                case 'KeyW':{if(this.#mode=='WALK' && this.#playerType=='OPPONENT') this.changeMode('STAND');break;}
                case 'KeyS':{if(this.#mode=='RUN' && this.#playerType=='OPPONENT')this.changeMode('STAND'); break;}
            }
        }})
        
    }

    moveForward(distance){
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.#player.matrix);
        const direction = new THREE.Vector3(0,0,1);
        direction.applyMatrix4(matrix);
        this.#player.position.x += direction.x*distance;
        this.#player.position.y += direction.y*distance;
        this.#player.position.z += direction.z*distance;
    }
    changeMode(animation){

        this.#onModeChangeEvents[animation].forEach(callback=>callback());
        if(animation==this.#mode) return;
        this.#mode = animation
        this.#mixer.stopAllAction();
        if(animation=='FALL') this.moveForward(-50);
        let clipAction = this.#mixer.clipAction(this.#animations[animation].animations[0]);
        
        if(['SHOOT','RISE','FALL'].includes(animation)){
            clipAction.setLoop(THREE.LoopOnce,1);
            clipAction.clampWhenFinished = true;
        }
        else{
            clipAction.setLoop(THREE.LoopRepeat,Infinity)
        }
        
        clipAction.play();
        
    }
    
    getBoundingBox(){
        return (this.#isReady)?new THREE.Box3().setFromObject(this.#player):new THREE.Box3().makeEmpty();
    }
    updateAction(){
        if(!this.#isReady) return;
        this.#mixer.update(this.#clock.getDelta());
        if(this.#mode=='RUN') this.moveForward(12);
        else if(this.#mode=='WALK') this.moveForward(2);

    }
    getMesh = ()=> this.#player

    #canMove(){
        if(['STAND','RUN','WALK'].includes(this.#mode)) return true;
        return false;
    };

    getPosition=()=> this.#isReady?this.#player.position:new THREE.Vector3(0,0,0)

    getMode = ()=> this.#mode;

    getCamera=()=>this.#camera

    reset(){
        if(this.#isReady){
            if(this.#playerType=='USER'){
                this.#player.position.set(-500,0,0);
                this.#player.rotation.set(0,Math.PI/2,0);
            }
            else if(this.#playerType=='OPPONENT'){
                this.#player.position.set(500,0,0);
                this.#player.rotation.set(0,-Math.PI/2,0);
            }
            this.changeMode('STAND');
        }
    }
}