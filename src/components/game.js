import { Engine, Scene } from '@babylonjs/core';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import * as Cannon from 'cannon';
import * as GUI from '@babylonjs/gui/2D';
import '../App.css';
import flashAnimation from '../helpers/animations/flashAnimation';
import recoil from '../helpers/animations/recoilAnimation';
import emitterAnimation from '../helpers/animations/emitterAnimation';
import shakeAnimation from '../helpers/animations/shakeAnimation';
import flashMaterial from '../helpers/materials/flashMaterial';
import groundMaterial from '../helpers/materials/groundMaterial';

//set global variable
window.CANNON = Cannon; // Physics engine

export default () => {
    const reactCanvas = useRef(null);

    // Component State
    const [loaded, setLoaded] = useState(false);
    const [scene, setScene] = useState(null);
    const [gameDetails, setGameDetails] = useState({});
    const [gameDetailsAvailable, setGameDetailsAvailable] = useState(false);
    const [socket, setSocket] = useState(null);
    const defaultMessage = "Maze Runner";
    const [statusBarMessage, setStatusBarMessage] = useState(defaultMessage);
    // eslint-disable-next-line
    const [gameOver, setGameOver] = useState(false);

    // Declare all meshes and variables that you might need across functions here in order to have access
    // You might feel that some of this stuff needs to be in component state, but update and retrieval
    // of state is a slow process (also async, which causes its own set of problems) and this stuff needs
    // to run on 60fps. Since all of this won't be passed to any other components, we're good.

    let camera;
    let pointerLocked=false;
    let opponentContainer;
    let muzzleSphere;
    let opponentMuzzleSphere;
    let opponent;
    let initialPosition;
    let particleSource;
    let opponentInitialPosition;
    let mazeContainer;
    const blockSize=3;
    let spellMeshTracker=[];
    let glowStaff;
    let equippedSpell = null;
    let particleSystem;
    let spellSound;
    let backgroundMusic;

    // Component setup and cleanup
    useEffect(() => {
        // this is run on component mount
        setSocket(io.connect("http://localhost:5000" + window.location.pathname));
        // this is run on component dismount
        return () => {
            if(socket!==null) {
                socket.disconnect();
            }
        } // eslint-disable-next-line
    }, []); 

    // all socket events pre-render go here
    useEffect( () => {
        if(socket!==null) { // this is required because initial state is null
            socket.on("setup", (gameDetails) => {
                setGameDetails(gameDetails);
                setGameDetailsAvailable(true);
            });
        }
    }, [socket]);

    // take all maze details and create a render of it
    const renderMaze = (maze, scene) => {
        mazeContainer = new BABYLON.TransformNode("mazeContainer", scene);
        for(let i=0;i<maze.length;i++){
            for(let j=0;j<maze[i].length;j++) {
                let box = BABYLON.MeshBuilder.CreateBox("box" + i + j, {size: blockSize}, scene);
                box.position.x = maze[i][j].xcoord*2*blockSize;
                box.position.y = 0;
                box.position.z = maze[i][j].zcoord*2*blockSize;
                box.material = groundMaterial(scene);
                box.parent = mazeContainer;
                box.checkCollisions = true;
                            
                if(!maze[i][j].walls[1]) { // right wall
                    let filler= BABYLON.MeshBuilder.CreateBox("filler" + i + j + "right", {size: blockSize}, scene);
                    filler.position.x = box.position.x+blockSize;
                    filler.position.y = 0;
                    filler.position.z = box.position.z;
                    filler.material = groundMaterial(scene);
                    filler.parent = mazeContainer;
                    filler.checkCollisions = true;
                }
                if(!maze[i][j].walls[2]) { // bottom wall
                    let filler= BABYLON.MeshBuilder.CreateBox("filler" + i + j + "bottom", {size: blockSize}, scene);
                    filler.position.x = box.position.x;
                    filler.position.y = 0;
                    filler.position.z = box.position.z + blockSize;
                    filler.material = groundMaterial(scene);
                    filler.parent = mazeContainer;
                    filler.checkCollisions = true;
                }
            }
        }
        placeSpells(gameDetails.spellBook, scene);
        placeTarget(gameDetails.target, scene);
    }

    const placeSpells = (spellBook, scene) => {
        for(let l=0; l<spellBook.length;l++) {
            let spellMesh = new BABYLON.MeshBuilder.CreateSphere("spell"+l, {diameter:1.0}, scene);
            spellMesh.spellName = spellBook[l].spellName;
            spellMesh.spellTarget = spellBook[l].spellTarget;
            spellMesh.spellDuration = spellBook[l].spellDuration;
            spellMesh.id = l;
            spellMesh.position = new BABYLON.Vector3(spellBook[l].position.xcoord*2*blockSize,blockSize/2+0.6,spellBook[l].position.zcoord*2*blockSize);
            spellMesh.material = new BABYLON.StandardMaterial("spell", scene);
            spellMesh.material.diffuseColor = new BABYLON.Color3.FromHexString("#ed4545");
            spellMesh.material.emissiveColor = spellMesh.material.diffuseColor;
            spellMesh.material.disableLighting=true;
            spellMesh.applyFog = true;
            spellMesh.checkCollisions = true;
            spellMeshTracker[l] = spellMesh;
        }
    }

    const placeTarget = (target, scene) => {
        let targetMesh = new BABYLON.MeshBuilder.CreateSphere("target", {diameter: 1.5}, scene);
        targetMesh.position = new BABYLON.Vector3(target.xcoord*2*blockSize, blockSize/2+1.0,target.zcoord*2*blockSize);
        targetMesh.material = new BABYLON.StandardMaterial("target", scene);
        targetMesh.material.diffuseColor = new BABYLON.Color3.FromHexString("#FF4500");
        targetMesh.material.emissiveColor =targetMesh.material.diffuseColor;
        targetMesh.isPickable = false;
        targetMesh.checkCollisions = true;
    }
    
    // handle resize
    useEffect(() => {
        if (window) {
            const resize = () => {
                if (scene) {
                    scene.getEngine().resize();
                }
            }
            window.addEventListener('resize', resize);

            return () => {
                window.removeEventListener('resize', resize);
            }
        }
    }, [scene]);

    const createImpact = (scene, position, replaceStatusBarMessage) => {
        let impact = BABYLON.MeshBuilder.CreateSphere("impact:" + position, { diameter: 0.2 }, scene);
        impact.material = flashMaterial(scene);
        impact.position = position;
        impact.isPickable=false;
        impact.visibility = 0;
        impact.animations=[];
        impact.animations.push(flashAnimation);
        let impactAnim = scene.beginAnimation(impact, 0, 10, false);
        impactAnim.onAnimationEnd = () => {
            if(replaceStatusBarMessage) {
                setStatusBarMessage(defaultMessage);
            }
            impact.dispose();
        }
    }

    // Sets up camera, attaches staff and all related animations
    const createPlayer = (scene) => {
        camera = new BABYLON.UniversalCamera("mainCamera", new BABYLON.Vector3().copyFrom(initialPosition), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
        camera.applyGravity = true;
        const canvas = scene.getEngine().getRenderingCanvas();
        camera.checkCollisions = true;
        camera.animations = [];
        camera.animations.push(shakeAnimation(camera.position.y));
        // Equip any spell you cross
        camera.onCollide = (collidedMesh) => {
            if(collidedMesh.name.includes("spell")) {
                socket.emit("spellCross", collidedMesh.id);
                equippedSpell = {
                    spellName: collidedMesh.spellName,
                    spellTarget: collidedMesh.spellTarget,
                    spellDuration: collidedMesh.spellDuration,
                }
                setStatusBarMessage("Spell equipped: " + collidedMesh.spellName);
                spellMeshTracker[collidedMesh.id].dispose();
            }
            else if(collidedMesh.name==="target") {
                setGameOver(true);
            }
        }

        // Set movement controls: WASD
        camera.keysUp.push(87); 
        camera.keysDown.push(83);            
        camera.keysRight.push(68);
        camera.keysLeft.push(65);
        camera.speed=0.2;

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // Staff creation and animations
        let staff = new BABYLON.TransformNode("staff", scene);
        let staffHandle = BABYLON.MeshBuilder.CreateCylinder("staffHandle", {diameterTop: 0.08, diameterBottom: 0.1, height: 2.5}, scene);
        staffHandle.material = new BABYLON.StandardMaterial("handleMat", scene);
        staffHandle.material.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/tKjx3DI.jpg");
        staffHandle.parent = staff;
        let staffOrb = BABYLON.MeshBuilder.CreateSphere("staffOrb", {diameter: 0.15});
        staffOrb.material = new BABYLON.StandardMaterial("orbMat", scene);
        staffOrb.material.disableLighting = true;
        staffOrb.material.diffuseColor = new BABYLON.Color3.FromHexString("#000066");
        staffOrb.material.emissiveColor = new BABYLON.Color3.FromHexString("#34e5eb");
        staffOrb.position.y = 1.33;
        glowStaff.addIncludedOnlyMesh(staffOrb)
        staffOrb.parent = staff;
        staff.rotation.x = Math.PI/3;
        staff.rotation.y = -Math.PI/6; 
        staff.parent=camera;
        staff.position = new BABYLON.Vector3(1, -1,1);
        staff.animations.push(recoil(staff.position.z));

        muzzleSphere = BABYLON.MeshBuilder.CreateSphere("muzzle", { diameter: 0.1 }, scene);
        muzzleSphere.material = flashMaterial(scene);
        muzzleSphere.diffuseColor = new BABYLON.Color3.FromHexString("#FFFFE0");
        muzzleSphere.parent=staffOrb;
        muzzleSphere.position = new BABYLON.Vector3(-0.05,0.01,-0.02);
        muzzleSphere.visibility=0;
        muzzleSphere.animations=[];
        muzzleSphere.animations.push(flashAnimation);

        // All of the logic executed whenever you click
        const fire = () => {
            if(equippedSpell!==null) {
                if(equippedSpell.spellTarget==="opp") {
                    spellSound.play();
                    const ray = camera.getForwardRay(20);
                    scene.beginAnimation(muzzleSphere, 0, 10, false);
                    scene.beginAnimation(staff, 0, 10, false);
                    const pick = scene.pickWithRay(ray);
                    socket.emit("fire", {
                        hitSomething: pick.hit,
                        hitLocation: pick.pickedPoint,
                        hitPlayer: pick.pickedMesh.name.includes("wizard"),
                        spellName: equippedSpell.spellName,
                        spellDuration: equippedSpell.spellDuration,
                    });
                    if(pick.hit) {
                        createImpact(scene, pick.pickedPoint, true);
                        equippedSpell = null;
                        setStatusBarMessage(defaultMessage);
                    }
                }
                else {
                    glowStaff.intensity = 5;
                    let duration = equippedSpell.spellDuration*1000;
                    let revertChanges;
                    if(equippedSpell.spellName==="Speed") {
                        revertChanges = "Speed";
                        camera.speed = 0.4;
                    }
                    else if(equippedSpell.spellName==="Clarity") {
                        revertChanges = "Clarity";
                        scene.fogEnd = 100.0;
                    }
                    equippedSpell = null;
                    setStatusBarMessage(defaultMessage);
                    setTimeout(() => {
                        if(revertChanges==="Speed") {
                            camera.speed = 0.2;
                        }
                        else if(revertChanges==="Clarity") {
                            scene.fogEnd = 10.0
                        }
                        glowStaff.intensity=0.5;
                    }, duration);
                }
            }
            else {
                let previousMessage = statusBarMessage;
                setStatusBarMessage("You don't have any spells equipped");
                setTimeout(()=> {
                    if(statusBarMessage!==defaultMessage) {
                        setStatusBarMessage(previousMessage);
                    }
                    else {
                        setStatusBarMessage(defaultMessage);
                    }
                }, 3000);
            }
        } 

    document.addEventListener("click", fire);

    }

    const setUpParticles = (scene) => {
        // set up particle system
        particleSource = BABYLON.Mesh.CreateBox("source", 1.0, scene);
        particleSource.isVisible=false;
        particleSource.position = new BABYLON.Vector3(initialPosition.x, 9, initialPosition.z);
        particleSystem = new BABYLON.ParticleSystem("particles", 130, scene);
        particleSystem.particleTexture = new BABYLON.Texture("https:/i.imgur.com/mDj16k4.png", scene);
        particleSystem.emitter = particleSource;
        // spawn point range
        particleSystem.minEmitBox = new BABYLON.Vector3(0, -4, 0); 
        particleSystem.maxEmitBox = new BABYLON.Vector3(15,-6,15);
        //colors
        particleSystem.color1 = new BABYLON.Color4(255,10,0,1);
        particleSystem.color2 = new BABYLON.Color4(255,10,0,1);
        // size range
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.07;
        // Emit rate
        particleSystem.emitRate = 10;
        // particle life range
        particleSystem.minLifeTime = 3.0;
        particleSystem.maxLifeTime = 5.0;
        // direction from spawn (between these two)
        particleSystem.direction1 = new BABYLON.Vector3(1, -1, 0);
        particleSystem.direction2 = new BABYLON.Vector3(0, -1, 1);
        // angular speed
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        // speed
        particleSystem.minEmitPower = 0.3;
        particleSystem.maxEmitPower = 0.5;
        // make particles slowly fall down
        particleSystem.gravity = new BABYLON.Vector3(0, -0.3, 0);
        particleSystem.start();
        particleSource.animations=[];
        particleSource.animations.push(emitterAnimation);
        scene.beginAnimation(particleSource, 0, 30, true);
    }

    // Scene building starts from here
    const onSceneReady = (scene) => {

        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        scene.clearColor = new BABYLON.Color3.FromHexString("#4B0082");
        let glowNormal = new BABYLON.GlowLayer("glowNormal", scene);
        glowNormal.intensity = 0.7;
        glowStaff = new BABYLON.GlowLayer("glowStaff", scene);
        glowStaff.intensity=0.5;
        scene.gravity = new BABYLON.Vector3(0,-0.3,0);
        scene.collisionsEnabled = true;
        scene.enablePhysics();

        // fog settings
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3.FromHexString("#4B0082");
        scene.fogDensity = 0.5;
        scene.fogStart = 0.0;
        scene.fogEnd = 10.0; // can't see anything beyond this point

        let light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(gameDetails.maze.length, gameDetails.maze.length, gameDetails.maze.length), scene); 
        light.intensity = 0.8;
        let light2 = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0,1,0), scene);
        light2.intensity=0.8;

        // Crosshair hack: images were causing a problem, so just used "."
        let gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("crosshairContainer");
        let crosshair = new GUI.TextBlock("crosshair", ".");
        crosshair.color = "white";
        crosshair.fontSize = 24;
        gui.addControl(crosshair);

        const canvas = scene.getEngine().getRenderingCanvas();
        // enable pointer lock on click
        scene.onPointerDown = (event) => {
            if(!pointerLocked) {
            canvas.requestPointerLock();
            }
        } 
        const togglePointerLocked = () => {
            if(!document.pointerLockElement) {
            pointerLocked=false;
            }
            else {
            pointerLocked=true;
            }
        }
  
        // Attach event listener to the document
        document.addEventListener("pointerlockchange", togglePointerLocked);

        // Set up sound
        spellSound = new BABYLON.Sound("spellSound", "https://dl.dropbox.com/s/e999de73zxwonbn/spellSound.wav", scene, null, {
            playbackRate: 2.5,
            volume: 2,
        });
        // backgroundMusic = new BABYLON.Sound("bgMusic", "https://dl.dropbox.com/s/rvdx3cvk4roxy30/backgroundMusic.mp3", scene, null, {
        //     loop: true,
        //     autoplay:true,
        //     volume: 0.8,
        // });
        //backgroundMusic.play();

        // Initialize the camera
        initialPosition = new BABYLON.Vector3(gameDetails.startPosition.xcoord*2*blockSize,blockSize+0.5275,gameDetails.startPosition.zcoord*2*blockSize);
        createPlayer(scene);

        // Set Up Particles
        setUpParticles(scene);

        // Set up opponent
        opponentInitialPosition = new BABYLON.Vector3(gameDetails.opponentPosition.xcoord*2*blockSize,blockSize-0.25,gameDetails.opponentPosition.zcoord*2*blockSize);
        opponentContainer = new BABYLON.TransformNode("opponentContainer", scene);
        opponentContainer.position = new BABYLON.Vector3().copyFrom(opponentInitialPosition);
        SceneLoader.ImportMesh("wizard", "/assets/models/", "wizardAttempt3.glb", scene, function (newMesh, particleSystems, skeletons) {
            opponent = newMesh[0];
            opponent.parent = opponentContainer;
            opponent.position = BABYLON.Vector3.Zero();
            opponent.rotate(new BABYLON.Vector3(0,1,0), Math.PI/2);
            opponent.isPickable = true;
            socket.on("opponentPosition", (newPosDetails) => {
                opponentContainer.position = newPosDetails.position;
                opponentContainer.position.y = opponentInitialPosition.y;
                opponentContainer.setDirection(newPosDetails.direction);
            });
          });
        opponentMuzzleSphere = BABYLON.MeshBuilder.CreateSphere("muzzle", { diameter: 0.1 }, scene);
        opponentMuzzleSphere.material = flashMaterial(scene);
        opponentMuzzleSphere.diffuseColor = new BABYLON.Color3.FromHexString("#FFFFE0");
        opponentMuzzleSphere.parent = opponentContainer;
        opponentMuzzleSphere.position = new BABYLON.Vector3(-0.2,0.775,0.7);
        opponentMuzzleSphere.visibility=0;
        opponentMuzzleSphere.animations=[];
        opponentMuzzleSphere.animations.push(flashAnimation);

        // Remove spell from maze when opponent picks it up
        socket.on("removeSpell", (spellID) => {
            spellMeshTracker[spellID].dispose();
        });

        // Invoke the effects of the spell player was hit by
        socket.on("shotDetails", (shotDetails) => {
            scene.beginAnimation(opponentMuzzleSphere,0,10, false);
            if(shotDetails.hitSomething) {
                createImpact(scene, shotDetails.hitLocation, false);
                if(shotDetails.hitPlayer) {
                    scene.beginAnimation(camera, 0, 15, false);
                    if(shotDetails.spellName==="Freeze") {
                        camera.inputs.attached.keyboard.detachControl();
                        setStatusBarMessage("You have been frozen");
                        setTimeout(() => {
                            camera.inputs.attachInput(camera.inputs.attached.keyboard);
                            setStatusBarMessage(defaultMessage);
                        }, shotDetails.spellDuration*1000);
                    }
                    else if (shotDetails.spellName==="Blind") {
                        scene.fogEnd = 0.8;
                        setStatusBarMessage("You have been blinded");
                        setTimeout(() => {
                            scene.fogEnd = 10.0;
                            setStatusBarMessage(defaultMessage);
                        }, shotDetails.spellDuration*1000);
                    }
                }
            }
        });

        // Send player position and direction to opponent before each render
        scene.onBeforeRenderObservable.add(()=>{
            let direction = camera.getForwardRay().direction;
            direction.y=0;
            socket.emit("position", {position: camera.position, direction: direction});
            particleSource.position = new BABYLON.Vector3(camera.position.x, 10, camera.position.z);
        });

        renderMaze(gameDetails.maze, scene);
    }

    // Will run on every frame render.Basically everything after the first render (all movement) 
    const onRender = (scene) => {
        // take player back to initial position after falling
        if(camera.position.y<0.4) {
            camera.dispose();
            createPlayer(scene);
        }
    }

    // Sets up the canvas, loads the scene
    useEffect(() => {
        if (!loaded && gameDetailsAvailable) {
            setLoaded(true);
            const engine = new Engine(reactCanvas.current, true); // antialias: true
            const scene = new Scene(engine);
            setScene(scene);
            if (scene.isReady()) {
                onSceneReady(scene)
            } else {
                scene.onReadyObservable.addOnce(scene => onSceneReady(scene));
            }

            engine.runRenderLoop(() => {
                if (typeof onRender === 'function') {
                    onRender(scene);
                }
                scene.render();
            })
        }

        return () => {
            if (scene !== null) {
                scene.dispose();
            }
        } // eslint-disable-next-line
    }, [reactCanvas, gameDetailsAvailable]);

    return (
        <div id="gameContainer">
            <div id="statusBar">
                <p>{statusBarMessage}</p>
            </div>
            <canvas ref={reactCanvas} id="canvas" />
        </div>
    );
}