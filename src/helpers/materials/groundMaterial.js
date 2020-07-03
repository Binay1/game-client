import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createMaterial = (scene) => {
    let groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/7DvHStM.jpg");
    return groundMaterial;
}

export default createMaterial;