import { Engine, Scene } from '@babylonjs/core';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import '../App.css';

export default () => {
    const reactCanvas = useRef(null);

    // This line goes bye-bye because we are merging the scene and the canvas execution together for better control
    // we weren't using most of the props anyway, so...
    // const { antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, ...rest } = props;

    const [loaded, setLoaded] = useState(false);
    const [scene, setScene] = useState(null);
    const [maze, setMaze] = useState([[]]);
    const [mazeIsAvailable, setMazeIsAvailable] = useState(false);
    const [socket, setSocket] = useState(null);

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
            socket.on("setup", (grid) => {
                setMaze(grid);
                setMazeIsAvailable(true);
            });
        }
    }, [socket]);

    const renderMaze = (maze, scene) => {
        let mazeContainer = new BABYLON.TransformNode();
        let blockSize=1;
        for(let i=0;i<maze.length;i++){
            for(let j=0;j<maze[i].length;j++) {
                let box = BABYLON.MeshBuilder.CreateBox("box" + i + j, {size: blockSize}, scene);
                box.position.x=maze[i][j].xcoord*2;
                box.position.y=0;
                box.position.z=maze[i][j].zcoord*2;
                box.parent = mazeContainer;
                            
                if(!maze[i][j].walls[1]) { // right wall
                    let filler= BABYLON.MeshBuilder.CreateBox("filler" + i + j + "right", {size: blockSize}, scene);
                    filler.position.x= box.position.x+1;
                    filler.position.y=0;
                    filler.position.z=box.position.z;
                    filler.parent = mazeContainer;
                }
                if(!maze[i][j].walls[2]) { // bottom
                    let filler= BABYLON.MeshBuilder.CreateBox("filler" + i + j + "bottom", {size: blockSize}, scene);
                    filler.position.x=box.position.x;
                    filler.position.y=0;
                    filler.position.z=box.position.z+1;
                    filler.parent = mazeContainer;
                }
            }
        }
    }
    
    // Will run on every frame render.Basically everything after the first render (all movement) 
    const onRender = scene => {
        
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
        scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        scene.clearColor = new BABYLON.Color3.FromHexString("#4B0082");

        // This creates and positions a free camera (non-mesh)
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, 10), scene);
        // to prevent camera from moving on input
        //camera.inputs.clear();

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        const canvas = scene.getEngine().getRenderingCanvas();

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(1, 10, 10), scene); 
        // var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.8;
        renderMaze(maze, scene);
    }


    // this is the golden egg. Everything related to the canvas. This one pulls everything together
    useEffect(() => {
        if (!loaded && mazeIsAvailable) {
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
    }, [reactCanvas, mazeIsAvailable]);

    

    return (
        <canvas ref={reactCanvas} id="canvas" />
    );
}