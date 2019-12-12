// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
// this.block_judge[] == 0(未染色)， == 1(房主染色)， == 2(客人染色)
cc.Class({
    extends: cc.Component,

    properties: {
        block_Node:cc.Node,
        block_Prefab:cc.Prefab,
        fire_Prefab:cc.Prefab,
        around_Prefab:cc.Prefab,
        speed_Prefab:cc.Prefab,
        bgm:{
            type: cc.AudioClip,
            default:null,
        },
        time:cc.Label,
        daojishi:30,
    },
    time_change:function(){
        if (this.daojishi >= 1){
            this.daojishi--;
            this.time.string = this.daojishi;
        }
        else {
            this.unscheduleAllCallbacks();
            this.Game_Over();
            this.node.getChildByName('move').active = false;
            this.node.getChildByName('time').active = false;
            this.node.getChildByName('joystick').active = false;
            this.node.getChildByName('game_over').active = true;
            this.typingAni(this.node.getChildByName('game_over').getComponent(cc.Label),"Game Over");
            this.GAME_RESULT();
            this.last = true;
        }
    },
    after: function(){
        this.node.getChildByName('result').getChildByName('player_1_name').getComponent(cc.Label).string = window.host_name;
        this.node.getChildByName('result').getChildByName('player_2_name').getComponent(cc.Label).string = window.clients_name;
        this.node.getChildByName('result').getChildByName('player_1_score').getComponent(cc.Label).string = window.h_score;
        this.node.getChildByName('result').getChildByName('player_2_score').getComponent(cc.Label).string = window.c_score;
        this.node.getChildByName('game_over').active = false;
        this.node.getChildByName('result').active = true;
    },
    typingAni: function (label, text) {
        var self = this;
        var html = '';
        var arr = text.split('');
        var len = arr.length;
        var step = 0;
        self.func = function () {
            html += arr[step];
            label.string = html;
            if (++step == len) {
                self.unschedule(self.func, self);
            }
        }
        self.schedule(self.func, 0.1, 8, 0);

    },
    random_fire:function(block_id){
        var fire = cc.instantiate(this.fire_Prefab);
        this.node.getChildByName('move').addChild(fire);
        fire.setPosition(cc.v2(this.block_array[block_id].x, this.block_array[block_id].y));
        this.block_prop_fire.push(fire);
    },
    random_boom:function(block_id){
        var around = cc.instantiate(this.around_Prefab);
        this.node.getChildByName('move').addChild(around);
        around.setPosition(cc.v2(this.block_array[block_id].x, this.block_array[block_id].y));
        this.block_prop_boom.push(around);
    },
    random_speed:function(block_id){
        var speed = cc.instantiate(this.speed_Prefab);
        this.node.getChildByName('move').addChild(speed);
        speed.setPosition(cc.v2(this.block_array[block_id].x, this.block_array[block_id].y));
        this.block_prop_speed.push(speed);
    },
    onLoad () {
        // cc.audioEngine.play(this.bgm, true, 1);
        if (window.current_uid == window.host_uid){
            this.control = this.node.getChildByName('move').getChildByName('circle_host');
            this.extra = this.node.getChildByName('move').getChildByName('circle_clients');
            this.local = 1;
            this.other = 2;
        }
        else {
            this.control = this.node.getChildByName('move').getChildByName('circle_clients');
            this.extra = this.node.getChildByName('move').getChildByName('circle_host');
            this.local = 2;
            this.other = 1;
        }
        this.node.getChildByName('result').active = false;
        this.node.getChildByName('game_over').active = false;
        this.block_array = [];
        this.block_judge = [];
        this.prop_fire = [];
        this.prop_boom = [];
        this.prop_speed = [];
        this.block_prop_fire = [];
        this.block_prop_boom = [];
        this.block_prop_speed = [];
        this.symbol = 0;
        this.last = false;
        window.triger1 = false;
        this.acc = 0;
        this.time_accumulate = 0;
        this.time_trigger = false;
        for (var j = 0;j < 321;j += 40){
            for(var i = 0;i < 1001;i += 40){
                var block = cc.instantiate(this.block_Prefab);
                this.block_Node.addChild(block);
                block.setPosition(cc.v2(i,j));
                this.block_array.push(block);
                this.block_judge[this.symbol] = 0;
                this.symbol++;
            }
        }
    },
    onClickReplay:function(){
        this.node.getChildByName('result').getChildByName('replay').active = false;
        this.node.getChildByName('result').getChildByName('back').active = false;
        this.PLAY_AGAIN();
    },
    onClickBack:function(){
        this.PLAY_LEAVE();
        window.state = 0;
        cc.director.loadScene(window.scene_1_scene);
    },
    PLAY_LEAVE:function(){
        window.socket.send(JSON.stringify({"messageType":"PLAY_LEAVE"}));
    },
    Ready:function(){
        window.socket.send(JSON.stringify({"messageType":"PLAY_READY"/*"data":[window.uid]*/}));
    },
    PLAY_AGAIN:function(){
        window.socket.send(JSON.stringify({"messageType":"PLAY_AGAIN","data":{}}));
    },
    Change_Color:function(zoneid){
        window.socket.send(JSON.stringify({"messageType":"BOOM","data":{"zoneId":String(zoneid)}}));
    },
    PROP_CONSUME:function(prop_send){
        window.socket.send(JSON.stringify({"messageType":"PROP_CONSUME","data":{"zoneId":String(prop_send)}}))
    },
    Game_Over:function(){
        window.socket.send(JSON.stringify({"messageType":"GAME_OVER"}));
        window.socket.addEventListener('message', function (event) {
            // console.log('Message from server ', event);
        })
    },
    GAME_RESULT:function(){
        window.socket.send(JSON.stringify({"messageType":"GAME_RESULT"}));
    },
    start () {
        this.time.string = 120;
        this.daojishi = 120;
        if (this.daojishi > 0){
            this.schedule(function(){
                this.time_change();
            }, 1);
        }
    },
    update (dt) {
        this.block_x = Math.floor(this.control.x / 40);
        this.block_y = Math.floor(this.control.y / 40);
        this.block_all = this.block_y*26+this.block_x;
        // if (window.triger1){
        //     if (window.current_uid == window.C_uid){
        //         this.block_array[window.zid].color = this.control.getChildByName('core').color;
        //         this.block_judge[window.zid] = this.local;
        //     }
        //     else {
        //         this.block_array[window.zid].color = this.extra.getChildByName('core').color;
        //         this.block_judge[window.zid] = this.other;
        //     }
        //     window.triger1 = false;
        // }
        while (window.zoneIdList.length != 0 && window.triger1 == true){
            var a = window.zoneIdList.shift();
            if (window.current_uid == a.uid){
                this.block_array[a.zid].color = this.control.getChildByName('core').color;
                this.block_judge[a.zid] = this.local;
            }
            else {
                this.block_array[a.zid].color = this.extra.getChildByName('core').color;
                this.block_judge[a.zid] = this.other;
            }
        }
        // if (window.zoneIdList.length != 0){
        //     var a = window.zoneIdList.shift();
        //     if (window.current_uid == a.uid){
        //         this.block_array[a.zid].color = this.control.getChildByName('core').color;
        //         this.block_judge[a.zid] = this.local;
        //     }
        //     else {
        //         this.block_array[a.zid].color = this.extra.getChildByName('core').color;
        //         this.block_judge[a.zid] = this.other;
        //     }
        // }
        if (this.last){
            this.acc += dt;
        }
        if (this.acc > 2){
            this.after();
            this.last = false;
        }
        if (window.prop_trigger == true){
            if (window.propType == 0){
                this.prop_fire.push(window.propZoneId);
                this.random_fire(window.propZoneId);
            }
            else if (window.propType == 1){
                this.prop_boom.push(window.propZoneId);
                this.random_boom(window.propZoneId);
            }
            else if (window.propType == 2){
                this.prop_speed.push(window.propZoneId);
                this.random_speed(window.propZoneId);
            }
            window.prop_trigger = false;
            window.propType = 0;
        }
        if (this.prop_fire.length != 0){
            for (var i = 0;i < this.prop_fire.length;i++){
                if (this.block_all == this.prop_fire[i]){
                    this.PROP_CONSUME(this.block_all);
                }
            }
        }
        if (this.prop_boom.length != 0){
            for (var i = 0;i < this.prop_boom.length;i++){
                if (this.block_all == this.prop_boom[i]){
                    this.PROP_CONSUME(this.block_all);
                }
            }
        }
        if (this.prop_speed.length != 0){
            for (var i = 0;i < this.prop_speed.length;i++){
                if (this.block_all == this.prop_speed[i]){
                    this.PROP_CONSUME(this.block_all);
                }
            }
        }
        if (window.consume_propType != null){
            if (window.current_uid == window.consume_uid){
                if (window.consume_propType == 0){
                    if (window.current_uid == window.host_uid){
                        this.control.setPosition(cc.v2(0, 0));
                    }
                    else {
                        this.control.setPosition(cc.v2(1000, 340));
                    }
                    for (var i = 0;i < this.prop_fire.length;i++){
                        if (window.consume_propZoneId == this.prop_fire[i]){
                            this.block_prop_fire[i].destroy();
                            this.block_prop_fire.splice(i, 1);
                            this.prop_fire.splice(i, 1);
                        }
                    }
                }
                else if (window.consume_propType == 1){
                    for (var i = 0;i < this.prop_boom.length;i++){
                        if (window.consume_propZoneId == this.prop_boom[i]){
                            this.block_prop_boom[i].destroy();
                            this.block_prop_boom.splice(i, 1);
                            this.prop_boom.splice(i, 1);
                        }
                    }
                }
                else if (window.consume_propType == 2){
                    this.node.getChildByName('move').getComponent('circle').speed = 200;
                    this.time_accumulate = 0;
                    this.time_trigger = true;
                    for (var i = 0;i < this.prop_speed.length;i++){
                        if (window.consume_propZoneId == this.prop_speed[i]){
                            this.block_prop_speed[i].destroy();
                            this.block_prop_speed.splice(i, 1);
                            this.prop_speed.splice(i, 1);
                        }
                    }
                }
            }
            else {
                if (window.consume_propType == 0){
                    for (var i = 0;i < this.prop_fire.length;i++){
                        if (window.consume_propZoneId == this.prop_fire[i]){
                            this.block_prop_fire[i].destroy();
                            this.block_prop_fire.splice(i, 1);
                            this.prop_fire.splice(i, 1);
                        }
                    }
                }
                else if (window.consume_propType == 1){
                    for (var i = 0;i < this.prop_boom.length;i++){
                        if (window.consume_propZoneId == this.prop_boom[i]){
                            this.block_prop_boom[i].destroy();
                            this.block_prop_boom.splice(i, 1);
                            this.prop_boom.splice(i, 1);
                        }
                    }
                }
                else if (window.consume_propType == 2){
                    for (var i = 0;i < this.prop_speed.length;i++){
                        if (window.consume_propZoneId == this.prop_speed[i]){
                            this.block_prop_speed[i].destroy();
                            this.block_prop_speed.splice(i, 1);
                            this.prop_speed.splice(i, 1);
                        }
                    }
                }
            }
            window.consume_propType = null;
        }
        if (this.time_trigger == true){
            this.time_accumulate += dt;
            if (this.time_accumulate > 8){
                this.node.getChildByName('move').getComponent('circle').speed = 100;
                this.time_accumulate = 0;
                this.time_trigger = false;
            }
        }
        // if (this.fire_node != null){
        //     if (this.fire_node.x == this.block_array[this.block_y*26+this.block_x+1].x && this.fire_node.y == this.block_array[this.block_y*26+this.block_x+1].y){
        //         this.circle_Node.setPosition(cc.v2(0, 0));
        //     }
        // }
        // if (Math.ceil(Math.random()*100) == 3 && this.around_node == null){
        //     this.random_around();
        // }
        // if (Math.ceil(Math.random()*100) == 3 && this.speed_node == null){
        //     this.random_speed();
        // }
        // if (this.around_node != null){
        //     if (this.around_node.x == this.block_array[this.block_y*26+this.block_x+1].x && this.around_node.y == this.block_array[this.block_y*26+this.block_x+1].y){
        //         for (var i = 0;i < 9;i++){
        //             this.block_array[i*26+this.block_x+1].color = this.circle_Node.getComponent('circle').core_Color;
        //         }
        //         this.around.active = false;
        //     }
        // }
        // if (this.speed_node != null){
        //     if (this.speed_node.x == this.block_array[this.block_y*26+this.block_x+1].x && this.speed_node.y == this.block_array[this.block_y*26+this.block_x+1].y){
        //         this.circle_Node.getComponent('circle').speed = 200;
        //         this.speed.active = false;
        //         this.time_accumulate = 0;
        //     }
        //     this.time_accumulate += dt;
        //     if (this.time_accumulate > 8){
        //         this.circle_Node.getComponent('circle').speed = 100;
        //     }
        // }
        if (this.block_judge[this.block_all] == 0 || this.block_judge[this.block_all] == this.other){
            for (var i = 0;i < this.prop_boom.length;i++){
                if (this.block_all == this.prop_boom[i]){
                    return ;
                }
            }
            this.Change_Color(this.block_all);
        }     
    },
});