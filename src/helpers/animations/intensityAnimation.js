import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createAnimation = (start, end) => {
    let intensityAnimation = new BABYLON.Animation("intensity", "intensity", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let keys=[];
    keys.push({
        frame: 0,
        value: start,
    });
    keys.push({
        frame: 30,
        value: end,
    });
    intensityAnimation.setKeys(keys);
    return intensityAnimation;
}

export default createAnimation;