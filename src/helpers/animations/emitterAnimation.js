import * as BABYLON from '@babylonjs/core/Legacy/legacy';

// Animation: rotate the emitter to make particles go in all directions
let emitterAnimation = new BABYLON.Animation("rotate", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
let keys=[];
keys.push({
    frame: 0,
    value: 1
});
keys.push({
    frame: 20,
    value: 2*Math.PI,
});
keys.push({
    frame: 30,
    value: 1,
});
emitterAnimation.setKeys(keys);

export default emitterAnimation;