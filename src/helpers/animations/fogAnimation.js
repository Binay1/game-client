import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createAnimation = (start, end) => {
    let fogAnimation = new BABYLON.Animation("fog", "fogEnd", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let keys=[];
    keys.push({
        frame: 0,
        value: start,
    });
    keys.push({
        frame: 15,
        value: end,
    });
    fogAnimation.setKeys(keys);
    return fogAnimation;
}

export default createAnimation;