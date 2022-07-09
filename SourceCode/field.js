import * as THREE from './lib/three.module.js';

export class Field{

    #field
    #lights
    #isReady
    constructor(parent){
        this.#field = this.#loadField();
        this.#lights = this.#loadLights();
        parent.add(this.#field);
        this.#addEventListeners();
        this.#isReady = false;

    }

    #addEventListeners(){
        window.addEventListener('keydown',(event)=>{
            if(['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'].includes(event.code)){
                const light = this.#lights[event.code[5]-1] ;
                if(light.isOn){
                    light.lightObject.removeFromParent();
                }
                else{
                    this.#field.add(light.lightObject);
                    this.#field.add(light.target);
                }
                light.isOn = !light.isOn;
            }
        })
    }

    #loadField = ()=> {
        const geometry = new THREE.PlaneGeometry( 10000, 4000 ).lookAt(new THREE.Vector3(0,1,0));
        const material = new THREE.MeshPhongMaterial({color: 0xffffff, side: THREE.DoubleSide});

        new THREE.TextureLoader().load('./textures/soccerField.png',(texture)=>{
            material.map = texture
            material.needsUpdate = true;
        })

        const field = new THREE.Mesh(geometry, material);
        field.receiveShadow = true;
        this.#isReady = true;
        return field;
    }

    #loadLights = ()=>{
        return [[5000,2000],[5000,-2000],[-5000,-2000],[-5000,2000],[0,2000],[0,-2000]].map(position=>{
            const spotLight=new THREE.SpotLight(0xFFFFFF,0.6,12000,Math.PI/3,1,0);
            spotLight.castShadow = true;
            spotLight.position.set(position[0],2000,position[1]);
            spotLight.target.position.set(position[0]*2/3,0,position[1]*2/3);
            this.#field.add(spotLight);
            this.#field.add(spotLight.target);
            return {lightObject:spotLight, isOn:true, target:spotLight.target};
        })
    }

    getMesh = ()=> this.#field;
}