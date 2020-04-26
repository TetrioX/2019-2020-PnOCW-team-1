var passwordPage = document.getElementById('passwordPage');
var userspassword = document.getElementById('masterpassword');
var passwordbutton = document.getElementById('passwordbutton');
var adminPage =document.getElementById('adminPage');
new Promise(function(resolve, reject){

	userspassword.focus();
	userspassword.select();
	userspassword.addEventListener("keyup", function(event) {
  		if (event.keyCode === 13) {
   		event.preventDefault();
   		passwordbutton.click();
  		}
	});
	passwordbutton.addEventListener('click',function(){
		var socket = io('/admin', { query: "passwd="+userspassword.value });
		setTimeout(function(){
			if (socket.connected === true){
				resolve(socket)
			} else {
				document.getElementById('alertdiv').style.display="";
			}
		}, 500)

	});
}).then(function(socket){
  passwordPage.style.display="none";
	adminPage.style.display="";

  var branchPicker = document.getElementById("branchPicker");
  var updateButton = document.getElementById("update");

  let branch = branchPicker.value;
  branchPicker.addEventListener('input', function(){
		branch = branchPicker.value
	});

  updateButton.addEventListener('click', function () {
    console.log(branch)
    socket.emit("update", branch, function(result){
      alert(result);
    })
	});

})
