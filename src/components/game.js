import { Engine, Scene } from '@babylonjs/core';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import '../App.css';

export default () => {
    const reactCanvas = useRef(null);

    // Component State
    const [loaded, setLoaded] = useState(false);
    const [scene, setScene] = useState(null);
    const [gameDetails, setGameDetails] = useState({});
    const [gameDetailsAvailable, setGameDetailsAvailable] = useState(false);
    const [socket, setSocket] = useState(null);

    // Declare all meshes and variables that you might need in onRender here in order to have access
    let camera;
    let player;
    let opponent;
    let playerContainer;
    let forwardAngle = 0;
    let initialPosition;
    let opponentInitialPosition;
    let mazeContainer;
    let allowFall = true;

    // Component setup and cleanup
    useEffect(() => {
        // this is run on component mount
        setSocket(io.connect("http://localhost:5000" + window.location.pathname));
        // this is run on component dismount
        return () => {
            socket.disconnect();
        }
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

    // take all maze details and create a render
    const renderMaze = (maze, scene) => {
        mazeContainer = new BABYLON.TransformNode();
        let blockSize=1;
        for(let i=0;i<maze.length;i++){
            for(let j=0;j<maze[i].length;j++) {
                let box = BABYLON.MeshBuilder.CreateBox("box" + i + j, {size: blockSize}, scene);
                box.position.x=maze[i][j].xcoord*2;
                box.position.y=0;
                box.position.z=maze[i][j].zcoord*2;
                box.parent = mazeContainer;
                box.isPickable = true;
                            
                if(!maze[i][j].walls[1]) { // right wall
                    let filler= BABYLON.MeshBuilder.CreateBox("filler" + i + j + "right", {size: blockSize}, scene);
                    filler.position.x= box.position.x+1;
                    filler.position.y=0;
                    filler.position.z=box.position.z;
                    filler.parent = mazeContainer;
                    filler.isPickable = true;
                }
                if(!maze[i][j].walls[2]) { // bottom wall
                    let filler= BABYLON.MeshBuilder.CreateBox("filler" + i + j + "bottom", {size: blockSize}, scene);
                    filler.position.x=box.position.x;
                    filler.position.y=0;
                    filler.position.z=box.position.z+1;
                    filler.parent = mazeContainer;
                    filler.isPickable=true;
                }
            }
        }
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

    const onSceneReady = (scene) => {

        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        scene.clearColor = new BABYLON.Color3.FromHexString("#4B0082");
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3.FromHexString("#4B0082");
        scene.fogDensity = 0.5;
        scene.fogStart = 0.0;
        scene.fogEnd = 4.0; // can't see anything beyond this point
    
        // This creates and positions a camera that can rotate around our player
        camera = new BABYLON.ArcRotateCamera("mainCamera",0, 0, 2, BABYLON.Vector3.Zero(), scene);
        camera.upperBetaLimit = Math.PI/2; // max angle camera can have with object on the vertical axis
        camera.setPosition(new BABYLON.Vector3(0, 2, 2)); // this overrides the alpha/beta stuff in the constructor
        camera.inputs.clear(); // clear all inputs
        camera.inputs.addKeyboard(); // reattach the keyboard inputs
        //camera.inputs.attached.keyboard.angularSpeed = .003;
        console.log(camera.speed);
        const canvas = scene.getEngine().getRenderingCanvas();
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(1, 10, 10), scene); 
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.8;

        // Initialize player and opponent
        let radius = 0.25;
        player = BABYLON.MeshBuilder.CreateSphere("player", {diameter: 2 * radius}, scene);
        initialPosition = new BABYLON.Vector3(gameDetails.startPosition.xcoord*2,0.75,gameDetails.startPosition.zcoord*2);
        player.position = new BABYLON.Vector3().copyFrom(initialPosition);
        // note: this makes all vectors used in these objects relative to the parent
        player.parent = playerContainer;
        camera.parent = playerContainer;

        opponent = BABYLON.MeshBuilder.CreateSphere("opponent", {diameter: 2 * radius}, scene);
        opponentInitialPosition = new BABYLON.Vector3(gameDetails.opponentPosition.xcoord*2,0.75,gameDetails.opponentPosition.zcoord*2);
        opponent.position = opponentInitialPosition;

        const ray = new BABYLON.Ray();
        const rayHelper = new BABYLON.RayHelper(ray);
        // the ray goes from origin of the sphere in the downward direction till the length of diameter
        rayHelper.attachToMesh(player, new BABYLON.Vector3(0, -1, 0), new BABYLON.Vector3(0, 0, 0), radius * 2);

        // Keyboard events
        let inputMap ={};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown"; // this key is pressed (true)
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown"; // this key is pressed (false)
        }));
        
        const move = (mesh, angle) => {
            const rotateBy = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, angle - camera.alpha - Math.PI/2);
            // after we pretend to perform the rotation, the local axes in the imaginary scenario have changed direction,
            // so we just move it along the new +ve z-axis
            let movement = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0.09), rotateBy);
            mesh.position.addInPlace(movement); //move to the new location
            camera.target.copyFrom(mesh.position);
            socket.emit("position", mesh.position);
        }

        // Calculate how much the camera needs to rotate to get to the nearest right angle
        const calcRotationAngle = () => {
            let angle = camera.alpha % Math.PI/2;
            if(angle===0) {
                angle = -1*camera.alpha;
            }
            if (angle <= Math.PI/4) {
                angle *= -1;
            }
            else {
                angle = Math.PI/2-angle;
            }
            return angle;
        }

        // animation goes here
        const centerCamera = () => {
             let angle = calcRotationAngle();

             BABYLON.Animation.prototype.floatInterpolateFunction = function (startValue, endValue, gradient) {
                return startValue + (endValue - startValue) * gradient;
              };

            BABYLON.Animation.CreateAndStartAnimation("center", camera, "alpha", 60, 30, camera.alpha, camera.alpha+angle,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

             
        }

        scene.onBeforeRenderObservable.add(()=>{
            socket.on("opponentPosition", (newPos) => {
                opponent.position=newPos;
            });

            camera.target.copyFrom(player.position);
      
            // Movement actions
            if(inputMap["w"]){
              move(player, forwardAngle);
            } 
            if(inputMap["a"]){
              let leftAngle = forwardAngle - (Math.PI/2);
              move(player, leftAngle);
            } 
            if(inputMap["s"]){
              let backAngle = forwardAngle + Math.PI; 
              move(player, backAngle);
            } 
            if(inputMap["d"]){
              let rightAngle  = forwardAngle + (Math.PI/2);
              move(player, rightAngle);
            }
            if(inputMap["c"]) {
                // experimental and buggy
                centerCamera();
            }
            // check if we're still on solid ground
            const pick = scene.pickWithRay(ray, (mesh) => {
                if(mesh.parent==null) {
                    return false;
                }
                else {
                    return mesh.parent===mazeContainer; // if the ray we created earlier comes in contact with the ground, we're good
                }
            }, true); // true just means we use the first mesh to hit the ray (which will be the ground because sphere is not pickable)
            if (!pick.hit && allowFall) {
              player.position.y -= 0.1; // if ball isn't in contact with the ground, it falls (that's how gravity works kids)
            } 
        });

        renderMaze(gameDetails.maze, scene);
    }

    // Will run on every frame render.Basically everything after the first render (all movement) 
    const onRender = scene => {
        if(player.position.equals(initialPosition)) {
            allowFall = true;
        }
        if(player.position.y<0.2) {
            allowFall = false;          
            player.position.copyFrom(initialPosition);
            //camera.target.copyFrom(sphere.position);
          }
    }

    // this is the golden egg. Everything related to the canvas. This one pulls everything together
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
        }
    }, [reactCanvas, gameDetailsAvailable]);

    

    return (
        <canvas ref={reactCanvas} id="canvas" />
    );
}