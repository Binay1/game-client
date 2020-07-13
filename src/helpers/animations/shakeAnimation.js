import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createAnimation = (initialPosY) => {
    let shakeAnimation = new BABYLON.Animation("shake", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let keys = [];

    keys.push({
        frame: 10,
        value: initialPosY,
    });

    keys.push({
        frame: 13,
        value: initialPosY-0.2,
    });

    keys.push({
        frame: 16,
        value: initialPosY+0.2,
    });

    keys.push({
        frame: 19,
        value: initialPosY-0.1,
    });

    keys.push({
        frame: 22,
        value:initialPosY+0.1,
    });

    keys.push({
        frame: 25,
        value:initialPosY,
    });

    shakeAnimation.setKeys(keys);
    return shakeAnimation;
}

export default createAnimation;