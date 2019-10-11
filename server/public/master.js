// Make Connection

console.log("werkt dut?")
var socket = io();


var testbutton = getElementById('testbutton');
var message= "test"

testbutton.addEventListener('click', function(){

	socket.emit('test',{
		message:message.value
	});
	