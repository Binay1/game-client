import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const createAnimation = (initialPosY) => {
    let shakeAnimation = new BABYLON.Animation("shake", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let keys = [];

    keys.push({
        frame: 0,
        value: initialPosY,
    });

    keys.push({
        frame: 3,
        value: initialPosY-0.2,
    });

    keys.push({
        frame: 6,
        value: initialPosY+0.2,
    });

    keys.push({
        frame: 9,
        value: initialPosY-0.1,
    });

    keys.push({
        frame: 12,
        value:initialPosY+0.1,
    });

    keys.push({
        frame: 15,
        value:initialPosY,
    });

    shakeAnimation.setKeys(keys);
    return shakeAnimation;
}

export default createAnimation;