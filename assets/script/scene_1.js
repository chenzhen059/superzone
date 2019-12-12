// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

window.register_on = false;
cc.Class({
    extends: cc.Component,

    properties: {
        L_logo:cc.Node,
        scene:"match_room",
        rabbit: {
            default: [],
            type: cc.SpriteFrame,
        },
    },


    onLoad () {
        window.scene_match = this.scene;
        window.clients_name = null;
        window.hostleave = null;
        window.ready_1 = false;
        window.ready_2 = false;
        window.cu_uid = null;
        window.state = 0;
        window.prop_trigger = false;
        window.consume_propType = null;
        window.propType = -1;
        window.zoneIdList = [];
    	this.node.getChildByName('create_room').active = false;
    	this.node.getChildByName('join_room').active = false;
    	this.node.getChildByName('roomid_print').active = false;
    	this.node.getChildByName('join_room').active = false;
    	this.time_accumulate = 0;
    	this.count_move = 0;
        this.count_frame = 0;
    	this.L_logo.setPosition(cc.v2(0,180));
    	this.L_logo.getComponent(cc.Label).fontSize = 80;
        this.starts = false;
        this.x = -600;
        this.y = 180;
        this.temporary_node = this.node.getChildByName('rabbit');
        this.temporary_node.setPosition(cc.v2(this.x,this.y));
        if (window.register_on == true){
    		this.node.getChildByName('create_room').active = true;
    		this.node.getChildByName('join_room').active = true;
    		this.node.getChildByName('key_print').active = false;
    		this.node.getChildByName('register').active = false;
    	}
    },
    onClickCreate_room:function(){
    	cc.log("创建房间成功");
    	this.Host();
    },
    onClickJoin_room:function(){
    	this.node.getChildByName('roomid_print').active = true;
    	this.node.getChildByName('join').active = true;
    	// cc.director.loadScene(this.scene);
    },
    moving_rabbit:function(){
        this.starts = true;
    },
    Client:function(roomid){
        window.flag = false;
	    window.socket = new WebSocket("wss://superzone.equator8848.xyz/superzone/ws/game/"+window.code);

	    window.socket.addEventListener('open', function (event) {
	        window.socket.send(JSON.stringify({"messageType":"JOIN_GAME","data":{"roomId":roomid}}));
	    });

	    window.socket.addEventListener('message', function (event) {
	        // console.log('Message from server ', event);
	        var eventJson = JSON.parse(event.data);
	        if (eventJson.messageType == "ROOM_INFO") {
                window.roomid = eventJson.data.roomId;
	            window.clients_name = eventJson.data.clients[0].nickName;
	            window.clients_uid = eventJson.data.clients[0].uid;
                window.host_name = eventJson.data.host.nickName;
                window.host_uid = eventJson.data.host.uid;
                if (eventJson.data.readyPlayUids[0] != null){
                    window.ready_1 = true;
                }
                window.state = 1;
                cc.director.loadScene(window.scene_match);
	        }
            if (eventJson.messageType == "PLAY_READY"){
                window.cu_uid = eventJson.data[0];
                if (window.cu_uid == window.host_uid){
                    window.ready_1 = true;
                }
                if (window.cu_uid == window.clients_uid){
                    window.ready_2 = true;
                }
            }
            if (eventJson.messageType == "PROP_PRODUCE") {
                window.prop_trigger = true;
                window.propType = eventJson.data.propType;//道具的类型：1是火堆；2是炸弹染色，3是加速
                window.propZoneId = eventJson.data.zoneId;//哪个格子上有道具
            }
            if (eventJson.messageType == "PROP_CONSUME") {
                window.consume_propType = eventJson.data.propType;
                window.consume_propZoneId = eventJson.data.zoneId;
                window.consume_uid = eventJson.data.uid;
                cc.log(window.consume_propZoneId);
            }
            if (eventJson.messageType == "GAME_START") {
                window.state = 2;
                cc.director.loadScene(window.fighting_scene);
            }
            if (eventJson.messageType == "POSITION_SYCN") {
                window.h_x = eventJson.data.x;
                window.h_y = eventJson.data.y;
                window.re_uid = eventJson.data.uid;
                window.triger = true;
            }
            if(eventJson.messageType == "BOOM_SYNC"){
                // window.C_uid = eventJson.data.uid;
                // window.zid = eventJson.data.zoneId;//列表
                // window.zid.push(eventJson.data.zoneId);
                window.zoneIdList.push({
                    uid: eventJson.data.uid,
                    zid: eventJson.data.zoneId
                });
                window.triger1 = true;
            }
            if(eventJson.messageType == "GAME_RESULT"){
                window.h_score = eventJson.data[0].score;
                window.c_score = eventJson.data[1].score;
            }
            if (eventJson.messageType == "PLAY_LEAVE") {
                window.hostleave = eventJson.data.hostLeave;//布尔型房主离开为ture 客人离开为false
                window.state = 0;
                cc.director.loadScene(window.scene_1_scene);
            }
            window.current_uid = window.clients_uid;
	    });
	},
    onClickRegister:function(){
    	this.sendHttpPost(this.node.getChildByName('key_print').getChildByName('TEXT_LABEL').getComponent(cc.Label).string);
    	if (window.status == 200){
    		cc.log("登录成功！");
    		this.node.getChildByName('create_room').active = true;
    		this.node.getChildByName('join_room').active = true;
    		this.node.getChildByName('key_print').active = false;
    		this.node.getChildByName('register').active = false;
    		window.register_on = true;
    		// this.sendHttpPost(this.node.getChildByName('key_print').getChildByName('TEXT_LABEL').getComponent(cc.Label).string);
    	}
    	else {
    		this.node.getChildByName('key_print').getChildByName('TEXT_LABEL').active = false;
    		cc.log(this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').getComponent(cc.Label).string);
    		this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').getComponent(cc.Label).string = "用户名重复";
    		cc.log(this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').getComponent(cc.Label).string);
    		this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').setPosition(cc.v2(-100, -20));
    		this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').color = cc.color(255, 0, 0, 255);
    		this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').active = true;
    		// scc.log(this.node.getChildByName('key_print').getChildByName('PLACEHOLDER_LABEL').color);
    	}
    },
    onClickJoin:function(){
    	var room_id = this.node.getChildByName('roomid_print').getChildByName('TEXT_LABEL').getComponent(cc.Label).string;
    	this.Client(room_id);
    },
    sendHttpPost: function(string){
    	var self = this;
    	var request = cc.loader.getXMLHttpRequest();
    	var url = "https://superzone.equator8848.xyz/superzone/api/user/login?nickName="+string;
    	request.open("POST",url,false);
    	request.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
    	request.onreadystatechange = function(){
        	if (request.readyState == 4 && (request.status >= 200 && request.status < 300)) {
            	var response = request.responseText;
            	console.log("sendHttpPost:");
            	console.log(response);
            	var responseJson = JSON.parse(response);
            	window.code = responseJson["data"];
            	window.status = responseJson["status"];
        	}
    	}
    	request.send();
        window.socket = new WebSocket("wss://superzone.equator8848.xyz/superzone/ws/game/"+window.code);
	},
	Host:function(){
        window.flag = true;
	    // Create WebSocket connection.
         window.socket = new WebSocket("wss://superzone.equator8848.xyz/superzone/ws/game/"+window.code);

	    // Connection opened
	    window.socket.addEventListener('open', function (event) {
	        window.socket.send(JSON.stringify({"messageType":"CREATE_GAME"}));
	    });
	    window.socket.addEventListener('message', function (event) {
	        // console.log('Message from server ', event);
	        var eventJson = JSON.parse(event.data);
	        if (eventJson.messageType == "ROOM_INFO") {
	            window.roomid = eventJson.data.roomId;
	            window.host_name = eventJson.data.host.nickName;
	            window.host_uid = eventJson.data.host.uid; 
                if (eventJson.data.clients[0]) {
                    window.clients_name = eventJson.data.clients[0].nickName;
                    window.clients_uid = eventJson.data.clients[0].uid;
                }
                window.state = 1;
                cc.director.loadScene(window.scene_match);
	        }
            if (eventJson.messageType == "GAME_START") {
                window.state = 2;
                cc.director.loadScene(window.fighting_scene);
            }
            if (eventJson.messageType == "PROP_PRODUCE") {
                window.prop_trigger = true;
                window.propType = eventJson.data.propType;//道具的类型：0是火堆；1是炸弹染色，2是加速
                window.propZoneId = eventJson.data.zoneId;//哪个格子上有道具
            }
            if (eventJson.messageType == "PROP_CONSUME") {
                window.consume_propType = eventJson.data.propType;
                window.consume_propZoneId = eventJson.data.zoneId;
                window.consume_uid = eventJson.data.uid;
            }
            if (eventJson.messageType == "PLAY_READY"){
                window.cu_uid = eventJson.data[0];
                if (window.cu_uid == window.host_uid){
                    window.ready_1 = true;
                }
                if (window.cu_uid == window.clients_uid){
                    window.ready_2 = true;
                }
            }
            if (eventJson.messageType == "POSITION_SYCN") {
                window.h_x = eventJson.data.x;
                window.h_y = eventJson.data.y;
                window.re_uid = eventJson.data.uid;
                window.triger = true;
            }
            if(eventJson.messageType == "BOOM_SYNC"){
                // window.C_uid = eventJson.data.uid;
                // window.zid = eventJson.data.zoneId;//列表
                //window.zid.push(eventJson.data.zoneId);
                window.zoneIdList.push({
                    uid: eventJson.data.uid,
                    zid: eventJson.data.zoneId
                });
                window.triger1 = true;
            }
            if(eventJson.messageType == "GAME_RESULT"){
                window.h_score = eventJson.data[0].score;
                window.c_score = eventJson.data[1].score;
            }
            if (eventJson.messageType == "PLAY_LEAVE") {
                window.hostleave = eventJson.data.hostLeave;//布尔型房主离开为ture 客人离开为false
                if (window.state == 2){
                    window.ready_2 = false;
                    cc.director.loadScene(window.scene_match);
                }
            }
            window.current_uid = window.host_uid;
	    });
	},
    start () {

    },
    update (dt) {
    	this.time_accumulate += dt;
    	if (this.time_accumulate - this.count_move > 0.5){
    		if (this.L_logo.y == 180){
    			this.L_logo.setPosition(cc.v2(0, 210));
    			this.L_logo.getComponent(cc.Label).fontSize = 90;
    			this.count_move += 1;
    		}
    		else {
    			this.L_logo.setPosition(cc.v2(0, 180));
    			this.L_logo.getComponent(cc.Label).fontSize = 80;
    			this.count_move += 1;
    		}
    	}
        if (Math.ceil(Math.random()*60) == 3 && this.starts == false){
            this.moving_rabbit();
        }
        if (this.starts == true){
            var sprite = this.temporary_node.getComponent(cc.Sprite);
            sprite.spriteFrame = this.rabbit[this.count_frame];
            this.temporary_node.setPosition(cc.v2(this.temporary_node.x+10,this.temporary_node.y-5));
            this.count_frame += 1;
            if (this.count_frame == 6){
                this.starts = false;
                this.count_frame = 0;
            }
        }
        if (this.temporary_node.y <= -320 || this.temporary_node.x >= 640){
            this.x += 200;
            this.temporary_node.setPosition(cc.v2(this.x,180));
        }
    },
});
