import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createMaterial = (scene) => {
    let flashMaterial =  new BABYLON.StandardMaterial('flashMat', scene);
    flashMaterial.disableLighting = true;
    flashMaterial.backFaceCulling = false;
    // flashMaterial.emissiveTexture = new BABYLON.Texture("https://i.imgur.com/agUx789.jpeg");
    // flashMaterial.opacityTexture = flashMaterial.emissiveTexture;
    flashMaterial.alpha = 0.8;
    flashMaterial.emissiveColor = new BABYLON.Color3.FromHexString("#e50000"); // #FF4500 
    flashMaterial.diffuseColor = flashMaterial.emissiveColor;
    return flashMaterial;
}

export default createMaterial;