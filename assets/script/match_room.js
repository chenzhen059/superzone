// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
cc.Class({
    extends: cc.Component,

    properties: {
        scene_1:"scene_1",
        fighting:"fighting",
    },


    onLoad () {
        window.fighting_scene = this.fighting;
        window.scene_1_scene = this.scene_1;
        window.state = 1;
        this.node.getChildByName('block').getChildByName('room_id').getComponent(cc.Label).string = window.roomid;
        this.node.getChildByName('seat1').getChildByName('player_1_name').getComponent(cc.Label).string = window.host_name;
        this.node.getChildByName('seat1').getChildByName('ready_1').active = false;
        this.node.getChildByName('seat1').getChildByName('ready_2').active = false;
    },
    onClickBack:function(){
        this.PLAY_LEAVE();
        cc.director.loadScene(window.scene_1_scene);
    },
    onClickStartGame:function(){
        // this.node.getChildByName('ready').active = false;
        // if (window.current_uid == window.host_uid){
        //     this.node.getChildByName('seat1').getChildByName('ready_1').active = true;
        // }
        // if (window.current_uid == window.clients_uid){
        //     this.node.getChildByName('seat1').getChildByName('ready_2').active = true;
        // }
        this.Ready();
    },
    Ready:function(){
        window.socket.send(JSON.stringify({"messageType":"PLAY_READY"/*"data":[window.uid]*/}));
    },
    PLAY_LEAVE:function(){
        window.socket.send(JSON.stringify({"messageType":"PLAY_LEAVE"}));
    },
    start () {

    },
    update (dt) {
        if (window.ready_1 == true){
            this.node.getChildByName('seat1').getChildByName('ready_1').active = true;
            if (window.current_uid == window.host_uid){
                this.node.getChildByName('ready').active = false;
            }
        }
        if (window.ready_2 == true){
            this.node.getChildByName('seat1').getChildByName('ready_2').active = true;
            if (window.current_uid == window.clients_uid){
                this.node.getChildByName('ready').active = false;
            }
        }
        if (window.hostleave == false){
            this.node.getChildByName('seat1').getChildByName('player_2_name').active = false;
            window.hostleave = null;
        }
        if (window.clients_name != null){
            this.node.getChildByName('seat1').getChildByName('player_2_name').getComponent(cc.Label).string = window.clients_name;
        }
    },
});
