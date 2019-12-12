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
        stick:cc.Node,
        max_R:80,
    },


    onLoad () {

    },

    start () {
        this.dir = cc.v2(0, 0);
        this.stick.on(cc.Node.EventType.TOUCH_START, function(e){

        }.bind(this), this);

        this.stick.on(cc.Node.EventType.TOUCH_MOVE, function(e){
            var screen_pos = e.getLocation();
            var pos = this.node.convertToNodeSpaceAR(screen_pos);

            var len = pos.mag();
            this.dir.x = pos.x / len;
            this.dir.y = pos.y / len;
            if (len > this.max_R){
                pos.x = pos.x * this.max_R / len;
                pos.y = pos.y * this.max_R / len;
            }
            this.stick.setPosition(pos);
        }.bind(this), this);

        this.stick.on(cc.Node.EventType.TOUCH_END, function(e){
            this.stick.setPosition(cc.v2(0, 0));
            this.dir = cc.v2(0, 0);
        }.bind(this), this);

        this.stick.on(cc.Node.EventType.TOUCH_CANCEL, function(e){
            this.stick.setPosition(cc.v2(0, 0));
            this.dir = cc.v2(0, 0);
        }.bind(this), this);
    },

    update (dt) {

    },
});
