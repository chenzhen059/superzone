cc.Class({
    extends: cc.Component,

    properties: {
        bgm:{
            type: cc.AudioClip,
            default:null,
        },
    },


    onLoad () {
        cc.audioEngine.play(this.bgm, true, 1);
    },
    
    start () {

    },
    // update (dt) {},
});
