import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const animation = (staffStationaryPosZ) => {
    let recoil = new BABYLON.Animation("recoil", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    let recoilKeys = [];
        recoilKeys.push({
            frame: 0,
            value: staffStationaryPosZ,
        });
        recoilKeys.push({
            frame: 5,
            value: staffStationaryPosZ-0.4,
        });
        recoilKeys.push({
            frame: 10,
            value: staffStationaryPosZ,
        });
        recoil.setKeys(recoilKeys);
    return recoil;
}

export default animation;