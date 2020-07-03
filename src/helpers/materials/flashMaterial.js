import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createMaterial = (scene) => {
    let flashMaterial =  new BABYLON.StandardMaterial('flashMat', scene);
    flashMaterial.disableLighting = true;
    flashMaterial.emissiveTexture = new BABYLON.Texture("https://i.imgur.com/agUx789.jpeg");
    flashMaterial.opacityTexture = flashMaterial.emissiveTexture;
    flashMaterial.emissiveColor = new BABYLON.Color3.FromHexString("#FFFF66");
    return flashMaterial;
}

export default createMaterial;