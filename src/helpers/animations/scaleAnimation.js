import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createAnimation = (start, end) => {
    let scaleAnimation = new BABYLON.Animation("scale", "scaling.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let scaleKeys=[];
    scaleKeys.push({
        frame:0,
        value:start,
    });
    scaleKeys.push({
        frame:10,
        value:end,
    });
    scaleKeys.push({
        frame:20,
        value:start,
    });

    scaleAnimation.setKeys(scaleKeys);
    return scaleAnimation;
}

export default createAnimation;