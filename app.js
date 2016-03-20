var io = require('socket.io-client');

var socket = io.connect('http://147.46.242.59:8001');
socket.on('connect', function(){
	socket.emit('adduser', 'edison');
});

socket.on('updateuser',function(data){
	console.log(data);
});

socket.on('From_mobile',function(data){
	if(data.hasOwnProperty("current") && data.hasOwnProperty("to")){
		console.log("mobile data : "+data);
		var current_pos = data.current;
		var desire_pos = data.to;

		//console.log(current_pos);
		//console.log(desire_pos);
		var angle = Math.round(PointsToAngle(current_pos, desire_pos));
		var sending_data = angle+";";
		console.log(sending_data);
		serialPort.write(sending_data);
	} 
});

function PointsToAngle(current_pos, desire_pos){
	var r1 = current_pos.latitude*Math.PI/180;
	var p1 = current_pos.longitude*Math.PI/180;
	var r2 = desire_pos.latitude*Math.PI/180;
	var p2 = desire_pos.longitude*Math.PI/180;

	var y = Math.sin(r2-r1)*Math.cos(p2);
	var x = Math.cos(p1)*Math.sin(p2) - Math.sin(p1)*Math.cos(p2)*Math.cos(r2-r1);

	var brng = Math.atan2(y,x)*180/Math.PI;

	return (brng+450)%360;
}


// Serial communication /////////////////////////////
var mraa = require('mraa');
console.log('MRAA Version: ' + mraa.getVersion());

u = new mraa.Uart(0);
var serialPath = u.getDevicePath();

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort(serialPath,{
	baudrate: 9600
});

serialPort.on("open",function(){
	console.log("Serial open");


	serialPort.on("data",function(data){
		data = data.toString('ascii');
		console.log(data);		
		var success = true;
		var a = null;
		try{
			a = JSON.parse(data);
		}catch(e){
			console.log('error!');
			success = false;
		}
		if(success){
			socket.emit("To_mobile",a);
		}
	});
});
