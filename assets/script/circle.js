// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var joystick = require("joystick");
cc.Class({
    extends: cc.Component,

    properties: {
        stick:joystick,
        speed:100,
        core_Color_host:cc.Color,
        core_Color_clients:cc.Color,
    },



    onLoad () {
        this.accumulate = 0;
        this.time = 0;
        window.triger = false;
        this.node.getChildByName('circle_host').setPosition(cc.v2(0, 0));
        this.node.getChildByName('circle_clients').setPosition(cc.v2(1000, 340));
        this.node.getChildByName('circle_host').getChildByName('core').color = this.core_Color_host;
        this.node.getChildByName('circle_clients').getChildByName('core').color = this.core_Color_clients;
        if (window.current_uid == window.host_uid){
            this.control = this.node.getChildByName('circle_host');
            this.control_core = this.node.getChildByName('circle_host').getChildByName('core');
            this.extra = this.node.getChildByName('circle_clients');
            this.extra_core = this.node.getChildByName('circle_clients').getChildByName('core');
        }
        else {
            this.control = this.node.getChildByName('circle_clients');
            this.control_core = this.node.getChildByName('circle_clients').getChildByName('core');
            this.extra = this.node.getChildByName('circle_host');
            this.extra_core = this.node.getChildByName('circle_host').getChildByName('core');
        }
    },
    Position:function(x_new,y_new){
        window.socket.send(JSON.stringify({"messageType":"POSITION_SYCN","data":{"x":String(x_new),"y":String(y_new)}}));
    },

    start () {

    },

    update (dt) {
        if (window.current_uid != window.re_uid && window.triger){
            this.extra.setPosition(cc.v2(window.h_x, window.h_y));
            this.extra_core.angle += 10;
        }
        this.accumulate += dt;
        if (this.stick.dir.x === 0 && this.stick.dir.y === 0){
            return ;
        }
        this.vx = this.speed * this.stick.dir.x;
        this.vy = this.speed * this.stick.dir.y;

        var sx = this.vx * dt;
        var sy = this.vy * dt;

        if (this.control.x+sx > 0 && this.control.x+sx < 1040){
            this.control.x += sx;
            this.control_core.angle -= 5;
        }
        if (this.control.y+sy >= 0 && this.control.y+sy < 360){
            this.control.y += sy;
            this.control_core.angle -=5;
        }
        if (this.accumulate - this.time >= 0.02){
            this.time += 0.02;
            this.Position(this.control.x, this.control.y);
        }
    },
});
