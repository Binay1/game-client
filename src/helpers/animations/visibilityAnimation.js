import * as BABYLON from '@babylonjs/core/Legacy/legacy';


const createAnimation = (start, end) => {
    let visibilityAnimation = new BABYLON.Animation("visibAnim", "visibility", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let visibilityKeys=[];
    visibilityKeys.push({
        frame:0,
        value:start,
    });
    visibilityKeys.push({
        frame:5,
        value:end,
    });
    visibilityKeys.push({
        frame:10,
        value:end,
    });
    visibilityKeys.push({
        frame:20,
        value:start,
    });

    visibilityAnimation.setKeys(visibilityKeys);
    return visibilityAnimation;
}

export default createAnimation;