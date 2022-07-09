import { Football } from './football.js';
import * as THREE from './lib/three.module.js';
import { Obstacle } from './obstacle.js';
import { Player } from './player.js';
import {TrackballControls} from './lib/trackball.js';
import { Field } from './field.js';
import { Goalpost } from './goalpost.js';
import { Lightpost } from './lightpost.js';
import { Stadium } from './stadium.js';



document.getElementById('playerToast').hidden = true;

document.getElementById('opponentToast').hidden = true;

let camera,obstacles, topCamera, controls, scene, renderer,player,football,opponent,spotLightPlayer, spotLightOpponent, field,goalpostOpponent, goalpostPlayer,playerscore=0,opponentScore=0;
init();
animate();

function init(){
    topCamera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,20000);
    topCamera.position.y = 4000;
    topCamera.position.z = 4000;
    camera = topCamera;
    renderer = new THREE.WebGL1Renderer();
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('APP_ROOT').appendChild(renderer.domElement)
    
    controls = new TrackballControls(topCamera,renderer.domElement);
    setupScene();
}

function setupScene(){
    const obstacleLocations = [[1000,1000],[-1000,1000],[1000,-1000],[-1000,-1000],[2000,0],[-2000,0],[3000,500],[-3000,500],[3000,-500],[-3000,-500]]
    scene = new THREE.Scene();
    field = new Field(scene); 
    goalpostPlayer = new Goalpost(field.getMesh(),'USER')
    goalpostOpponent = new Goalpost(field.getMesh(),'OPPONENT')
    obstacles = obstacleLocations.map((location,index)=>new Obstacle(field.getMesh(), location,(index%2==0)?'obstacleCylinder':'obstacleCone'))
    player = new Player('USER',field.getMesh());
    opponent = new Player('OPPONENT',field.getMesh());
    football = new Football(field.getMesh());
    let lightpost = new Lightpost(field.getMesh());
    spotLightPlayer=new THREE.SpotLight(0xFFFFFF,0.8,7000,Math.PI/100,1,0);
    spotLightPlayer.position.y = 5000;
    spotLightOpponent=new THREE.SpotLight(0xFFFFFF,0.8,7000,Math.PI/100,1,0);
    spotLightOpponent.position.y = 5000;
    new Stadium(scene);
    scene.add(spotLightPlayer);
    scene.add(spotLightPlayer.target);
    scene.add(spotLightOpponent);
    scene.add(spotLightOpponent.target);
    scene.add(new THREE.AmbientLight(0xFFFFFF,0.2))
    addEventHandlers();

}

function resetScene(){
    player.reset();
    opponent.reset();
    football.reset(field.getMesh());
}

function addEventHandlers(){

    player.onModeChange('RUN',()=>{if([player.getMesh(),field.getMesh()].includes(football.getParent()) && player.getBoundingBox().intersectsBox(football.getBoundingBox(),true)){
        football.setParent(player.getMesh());
        football.setMode('DRIBBLE')        
    }})

    player.onModeChange('WALK',()=>{if([player.getMesh(),field.getMesh()].includes(football.getParent()) && player.getBoundingBox().intersectsBox(football.getBoundingBox(),true)){
        football.setParent(player.getMesh());
        football.setMode('CARRY')        
    }})

    player.onModeChange('STAND',()=>{if([player.getMesh(),field.getMesh()].includes(football.getParent()) && player.getBoundingBox().intersectsBox(football.getBoundingBox(),true)) {
        football.setParent(player.getMesh());
        football.setMode('STILL')
    }})

    player.onModeChange('SHOOT',()=>{if(football.getParent()==player.getMesh() && player.getBoundingBox().intersectsBox(football.getBoundingBox(),true)) {
        football.setMode('STILL')
        football.setParent(field.getMesh());
        football.setMode('SHOOT');
    }})

    opponent.onModeChange('RUN',()=>{if([opponent.getMesh(),field.getMesh()].includes(football.getParent()) && opponent.getBoundingBox().intersectsBox(football.getBoundingBox(),true)){
        football.setParent(opponent.getMesh());
        football.setMode('DRIBBLE')        
    }})

    opponent.onModeChange('WALK',()=>{if([opponent.getMesh(),field.getMesh()].includes(football.getParent()) && opponent.getBoundingBox().intersectsBox(football.getBoundingBox(),true)){
        football.setParent(opponent.getMesh());
        football.setMode('CARRY')        
    }})

    opponent.onModeChange('STAND',()=>{if([opponent.getMesh(),field.getMesh()].includes(football.getParent()) && opponent.getBoundingBox().intersectsBox(football.getBoundingBox(),true)) {
        football.setParent(opponent.getMesh());
        football.setMode('STILL')
    }})

    opponent.onModeChange('SHOOT',()=>{if([opponent.getMesh()].includes(football.getParent()) && opponent.getBoundingBox().intersectsBox(football.getBoundingBox(),true)) {
        football.setMode('STILL')
        football.setParent(field.getMesh());
        football.setMode('SHOOT');
    }})

    document.addEventListener('keydown',(event)=>{
        if(event.code=='Space'){ 
            if(camera==topCamera){
                camera = player.getCamera();
                controls.enabled = false;
            }
            else if(camera==player.getCamera()){
                camera = opponent.getCamera();
            }
            else{
                camera = topCamera;
                controls.enabled = true;
            }
        }

        if(event.code=='Digit8'){
            if(spotLightPlayer.parent==null){
                scene.add(spotLightPlayer)
                scene.add(spotLightPlayer.target)
            }
            else{
                spotLightPlayer.removeFromParent();
            }
        }

        if(event.code=='Digit9'){
            if(spotLightOpponent.parent==null){
                scene.add(spotLightOpponent)
                scene.add(spotLightOpponent.target)
            }
            else{
                spotLightOpponent.removeFromParent();
            }
        }
    })

}
function animate(){
    requestAnimationFrame(animate);
    
    if(obstacles.reduce((didCollide,obstacle)=>{
        return didCollide||obstacle.getBoundingBox().intersectsBox(football.getBoundingBox(),true)
    },false)) football.collide();



    if(obstacles.reduce((didCollide,obstacle)=>{
        return didCollide||obstacle.getBoundingBox().intersectsBox(player.getBoundingBox(),true)
    },false)){
        if(player.getMode()=='RUN') 
        {
            player.changeMode('FALL');
            if(football.getParent()==player.getMesh()){
                football.setMode('STILL')
                football.setParent(field.getMesh());
                football.setMode('SHORT_SHOOT');
            }
        }
        else{
            player.moveForward(-30)
        }
        
    }

    if(obstacles.reduce((didCollide,obstacle)=>{
        return didCollide||obstacle.getBoundingBox().intersectsBox(opponent.getBoundingBox(),true)
    },false)){
        if(opponent.getMode()=='RUN') 
        {
            opponent.changeMode('FALL');
            if(football.getParent()==opponent.getMesh()){
                football.setMode('STILL')
                football.setParent(field.getMesh());
                football.setMode('SHORT_SHOOT');
            }
        }
        else{
            opponent.moveForward(-30)
        }
        
    }

    if(opponent.getBoundingBox().intersectsBox(player.getBoundingBox())){
        
        const playerMode = player.getMode();
        const opponentMode = opponent.getMode();
        
        if(football.getParent()==player.getMesh() && opponent.getMode()!='FALL'){
            football.setMode('STILL')
            player.changeMode('FALL');
            football.setParent(field.getMesh());
            football.setMode('SHORT_SHOOT');
            return;
        }

        if(football.getParent()==opponent.getMesh() && player.getMode()!='FALL'){
            football.setMode('STILL')
            opponent.changeMode('FALL');
            football.setParent(field.getMesh());
            football.setMode('SHORT_SHOOT');
            return;
        }

        if(opponentMode=='WALK' || opponentMode=='RUN'){
            opponent.moveForward(-30)
        }

        if(playerMode=='WALK' || playerMode=='RUN'){
            player.moveForward(-30)
        }
            
    }

    if(football.getBoundingBox().intersectsBox(goalpostPlayer.getBoundingBox())){
        resetScene()
        playerscore++;
        const toast = document.getElementById('playerToast')
        toast.innerHTML=`SCORE: ${playerscore} - ${opponentScore}`
        toast.hidden = false;
        setTimeout(()=>{toast.hidden=true},5000)
    }

    if(football.getBoundingBox().intersectsBox(goalpostOpponent.getBoundingBox())){
        resetScene()
        opponentScore++;
        const toast = document.getElementById('opponentToast');
        toast.innerHTML=`SCORE: ${playerscore} - ${opponentScore}`;
        toast.hidden = false;
        setTimeout(()=>{toast.hidden=true},5000)
    }

    
    if(football.ready()){
        const footballPosition = new THREE.Vector3();
        football.getMesh().getWorldPosition(footballPosition)
        if(footballPosition.z>1800 || footballPosition.z<-1800 || footballPosition.x>4600 || footballPosition.x<-4600)
        resetScene();
    }

    spotLightPlayer.target.position.copy(player.getPosition())
    spotLightPlayer.target.updateMatrixWorld()
    spotLightOpponent.target.position.copy(opponent.getPosition())
    spotLightOpponent.target.updateMatrixWorld()
    controls.update();
    player.updateAction();
    opponent.updateAction();
    football.updateAction();
    renderer.render(scene,camera);
}
