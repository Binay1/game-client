import * as BABYLON from '@babylonjs/core/Legacy/legacy';

let flashAnimation = new BABYLON.Animation("flash", "visibility", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
let flashKeys=[];
flashKeys.push({
    frame:0,
    value:0,
});
flashKeys.push({
    frame:5,
    value:1,
});
flashKeys.push({
    frame:10,
    value:0,
});
flashAnimation.setKeys(flashKeys);

export default flashAnimation;