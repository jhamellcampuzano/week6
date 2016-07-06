// JavaScript Document

var app = {
	//vars
	drop:$("#image_box"),
	file:$("#file"),
	title:$("#title"),
	name:$("#name"),
	email:$("#email"),
	desc:$("#description"),
	form:$("#image_form"),
	list:$("#image_list ul"),
	body:$(document),
	data:{},
	insert:[],
	
	//initialize
	init:function(){
		//drag and drop
		app.drop.on("dragover",function(e){e.preventDefault();app.drop.addClass("over");});
		app.drop.on("dragleave",function(e){e.preventDefault();app.drop.removeClass("over");});
		app.drop.on("drop",function(e){
			e.preventDefault();
			app.fileCheck(e.originalEvent.dataTransfer.files[0]);
		});
		app.drop.not(".drop").on("click",function(){
			app.file.click();
		});
		app.drop.find("button").on("click",function(e){
			app.drop.removeClass("drop wrong image over");
			app.drop.css({backgroundImage:"none"});
			$(this).addClass("hide");
		});
		app.file.on("change",function(e){
			e = e.originalEvent;
			app.fileCheck(e.target.files[0]);
		});
		
		//validation
		app.formValidation();
		
		//data load
		app.dataLoad();
		
		//image list delete
		app.body.on("click","button.delete",function(e){
			var num = app.getNum(this);
			app.modal(num,"list_delete","Do you want delete?");
		});
		
		//image edit
		app.body.on("click","button.edit",function(e){
			var num = app.getNum(this);
			app.edit(num);
		});
		
		//canvas
		app.body.on("mousedown","canvas",function(e){
			app.allow=true;
			app.pos1 = [e.offsetX, e.offsetY];
			app.drawStart();
		});
		app.body.on("mousemove","canvas",function(e){
			if(app.allow===true){
				app.pos2 = [e.offsetX, e.offsetY];
				app.drawMove();
			}
		});
		app.body.on("mouseup","canvas",function(e){
			if(app.allow===true){
				app.allow=false;
				app.drawEnd();
			}
		});
		app.body.on("mouseleave","canvas",function(e){
			if(app.allow===true){
				app.allow=false;
				app.drawEnd();
			}
		});
		
		//color chage
		app.body.on("change",".color",function(){
			app.color = $(this).val();
		});
	},
	
	//functions
	fileCheck:function(file){
		if(app.drop.hasClass("drop")){return false;}
		var name = file.name;
		var type = file.type;
		var match = /^image.jpeg|image.jpg|image.png|image.gif$/;
		if(type.match(match)){
			app.drop.removeClass("wrong over");
			var read = new FileReader();
			read.onload=function(){
				app.data.href=read.result;
				app.data.name=name;
				app.drop.addClass("drop");
				app.drop.css({backgroundImage:"url("+(app.data.href)+")"});
				app.drop.find("button").removeClass("hide");
			};
			read.readAsDataURL(file);
		}else{
			app.drop.addClass("wrong");
		}
	},
	formValidation:function(){
		app.form.submit(function(e){
			var title = app.title.val();
			var name = app.name.val();
			var email = app.email.val();
			var desc = app.desc.val();
			var reg1 = /^[a-zA-Z0-9_-\s\s+\.]{10,30}$/;
			var reg2 = /^[a-zA-Z0-9_-\s\s+\.]{3,10}$/;
			var reg3 = /^([a-zA-Z0-9_-]+)@([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){1,3}$/;
			var reg4 = /^[a-zA-Z0-9_-\s\s+\.]{30,}$/;
			app.drop.parent().removeClass("image");
			app.title.parent().removeClass("title");
			app.name.parent().removeClass("name");
			app.email.parent().removeClass("email");
			app.desc.parent().removeClass("desc");
			if(app.drop.hasClass("drop") && reg1.test(title) && reg2.test(name) && reg3.test(email) && reg4.test(desc)){
				app.data.title=title;
				app.data.name=name;
				app.data.email=email;
				app.data.desc=desc;
				app.formNull();
				app.dataAppend(app.data,app.insert.length);
				app.dataInsert();
				app.data = {};
				app.drop.find("button").addClass("hide");
			}else{
				!app.drop.hasClass("drop") ? app.drop.parent().addClass("image") : "";
				!reg1.test(title) ? app.title.parent().addClass("title") : "";
				!reg2.test(name) ? app.name.parent().addClass("name") : "";
				!reg3.test(email) ? app.email.parent().addClass("email") : "";
				!reg4.test(desc) ? app.desc.parent().addClass("desc") : "";
			}
			e.preventDefault();
		});
	},
	formNull:function(){
		app.drop.removeClass("drop wrong image over");
		app.drop.css({backgroundImage:"none"});
		app.name.val("");
		app.title.val("");
		app.email.val("");
		app.desc.val("");
	},
	dataLoad:function(){
		if(localStorage.image){
			var data = JSON.parse(localStorage.image);
			data.forEach(function(self,i){
				app.insert[i] = self;
			});
			app.dataPut();
		}
	},
	dataPut:function(){
		app.insert.forEach(function(self,i){
			app.dataAppend(self, i);
		});
	},
	dataAppend:function(self,num){
		var li = $("<li>",{class:"hide"});
		var div = $("<div>",{class:"image_wrap"});
		var img = $("<img>");
		var btn = $("<button>",{type:"button",class:"delete"});
		var edit = $("<button>",{type:"button",class:"edit"});
		btn.text("X");
		btn.attr("data-num",num);
		edit.attr("data-num",num);
		edit.text("EDIT");
		img.attr({src:self.href,alt:self.name,title:self.name});
		div.attr({"data-num":num});
		div.append(img);
		li.append(div);
		li.append(btn);
		li.append(edit);
		app.list.append(li);
		li.stop().show(600);
	},
	dataInsert:function(){
		if(localStorage.image){
			app.insert[app.insert.length] = app.data;
		}else{
			app.insert[0] = app.data;
		}
		localStorage.image = JSON.stringify(app.insert);
	},
	dataSort:function(){
		app.list.find("li").each(function(i,self){
			$(self).find("[data-num]").attr({"data-num":i});
		});
	},
	dataRemove:function(num){
		var data = JSON.parse(localStorage.image);
		data.splice(num,1);
		localStorage.image = JSON.stringify(data);
		app.list.find("[data-num='"+(num)+"']").stop().hide(600,function(){
			$(this).remove();
			app.dataSort();
		});
	},

	//modal
	modal:function(num,type,msg){
		$("<div>").html(msg).dialog({
			title:msg,
			modal:true,
			buttons:{
				"YES":function(){
					switch(type){
						case "list_delete":
							app.dataRemove(num);
							break;
						case "crop":
							var MAXW = Math.max(app.pos1[0], app.pos2[0]);
							var MINW = Math.min(app.pos1[0], app.pos2[0]);
							var MAXH = Math.max(app.pos1[1], app.pos2[1]);
							var MINH = Math.min(app.pos1[1], app.pos2[1]);
							var w = MAXW - MINW;
							var h = MAXH - MINH;
							app.newImg = app.ctx.getImageData(MINW,MINH, w,h);
							app.ctx.clearRect(0,0,app.cvs.width, app.cvs.height);
							app.cvs.width=w;
							app.cvs.height=h;
							app.ctx.putImageData(app.newImg,0,0);
							break;
						case "save":
							var href = app.cvs.toDataURL();
							app.insert[num].href = href;
							localStorage.image = JSON.stringify(app.insert);
							app.list.find("[data-num='"+(num)+"']").find("img").attr("src",href);
							app.getImg = app.newImg;
							break;
					}
					$(this).dialog("close");
				},
				"NO":function(){
					switch(type){
						case "crop":
							app.ctx.putImageData(app.getImg,0,0);
							break;
					}
					$(this).dialog("close");
				},
			},
		});
	},
	edit:function(num){
		var data = JSON.parse(localStorage.image);
		data = data[num];
		var title = $("<p>").html("Title: "+data.title);
		var name= $("<p>").html("Name: "+data.name);
		var email = $("<p>").html("Email: "+data.email);
		var desc = $("<p>").html("Description: "+data.desc);
		var color = ["Black","White","Red","Yellow","Green","Blue"];
		var op = $("<select>",{class:"color"});
		color.forEach(function(self,i){
			op.append("<option value='"+(self.toLowerCase())+"'>"+(self)+"</option>");
		});
		app.color = "black";
		app.type = "line";
		app.allow = false;
		app.cvs = document.createElement("canvas");
		app.ctx = app.cvs.getContext("2d");
		var img = new Image();
		img.src = data.href;
		img.onload=function(){
			var size = [img.width, img.height];
			size = app.getResizeImage(size);
			app.width = size[0];
			app.height = size[1];
			img.width=size[0];
			img.height=size[0];
			app.cvs.width=size[0];
			app.cvs.height=size[1];
			app.ctx.drawImage(img,0,0,size[0],size[1]);
			$("<div>").append(app.cvs).append(op).append(title).append(name).append(email).append(desc).dialog({
				modal:true,
				width:900,
				height:900,
				title:"Edit: " + data.name,
				buttons:{
					"Line":function(){
						app.type="line";
					},
					"Crop":function(){
						app.type="crop";
						app.num = num;
					},
					"Clear":function(){
						app.cvs.width=app.width;
						app.cvs.height=app.height;
						app.ctx.putImageData(app.getImg,0,0);
					},
					"Save":function(){
						app.modal(num,"save","Do you want save?");
					},
					"Download":function(){
						var a = document.createElement("a");
						a.href=app.cvs.toDataURL();
						a.download=app.insert[num].name;
						a.click();
					},
					"Close":function(){
						$(this).dialog("close");
					},
				},
			});
		};
	},
	
	//get data
	getNum:function(self){
		return parseInt($(self).attr("data-num"));
	},
	getResizeImage:function(size){
		var w = 800 / size[0];
		var h = 900 / size[1];
		var s = w < h ? w : h;
		s = s > 1 ? 1 : s;
		return [s*size[0],s*size[1]];
	},

	//draw canvas
	drawStart:function(){
		var pos1 = app.pos1;
		if(app.type==="line"){
			app.ctx.beginPath();
			app.ctx.moveTo(pos1[0], pos1[1]);
			app.ctx.setLineDash([0,0]);
		}
		app.getImg = app.ctx.getImageData(0,0,app.cvs.width,app.cvs.height);
	},
	drawMove:function(){
		var pos1 = app.pos1;
		var pos2 = app.pos2;
		var color = app.color;
		if(app.type === "line"){
			app.ctx.lineTo(pos2[0],pos2[1]);
			app.ctx.strokeStyle=color;
			app.ctx.stroke();
		}else if(app.type === "crop"){
			app.ctx.beginPath();
			app.ctx.setLineDash([10,2]);
			app.ctx.strokeStyle="red";
			app.ctx.moveTo(pos1[0], pos1[1]);
			app.ctx.lineTo(pos2[0], pos1[1]);
			app.ctx.lineTo(pos2[0], pos2[1]);
			app.ctx.lineTo(pos1[0], pos2[1]);
			app.ctx.closePath();
			app.ctx.putImageData(app.getImg,0,0);
			app.ctx.stroke();
		}
	},
	drawEnd:function(){
		if(app.type === "crop"){
			var pos1 = app.pos1;
			var pos2 = app.pos2;
			app.ctx.beginPath();
			app.ctx.putImageData(app.getImg,0,0);
			app.ctx.fillStyle="rgba(0,0,0, .5)";
			app.ctx.fillRect(0,0,app.cvs.width, app.cvs.height);
			app.ctx.closePath();
			
			app.ctx.beginPath();
			app.ctx.putImageData(app.getImg,0,0,pos1[0],pos1[1],(pos2[0]-pos1[0]), (pos2[1]-pos1[1]));
			app.ctx.closePath();
			app.modal(app.num,"crop","Do you want crop?");
		}
		app.ctx.closePath();
	},
};

window.onload=function(){
	app.init();
};