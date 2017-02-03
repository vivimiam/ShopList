
var list_shopped = [];
var list_unshopped = [];
var status = 0;
//swipe variables
var touchorigin;
var movement;
var threshold=150;
//global settings
var app = {
  touch:0,
  movement:0,
  threshold:150
}

var userId;
var listsRoot;
var listsRef;
var usersRef;
var sharedKey;
var containerShopped = document.getElementById("shopped-item");
containerShopped.innerHTML="";

var containerUnshopped = document.getElementById("unshopped-item");
containerUnshopped.innerHTML="";

//when an item is added, it's added into unshopped list
function createItem(item)
{
  	listsRef.child(item).once('value', function(snapshot) {	
    	if (snapshot.val() == null)
    	{
			listsRef.child(item).set(0);

			containerShopped.innerHTML="";
			containerUnshopped.innerHTML="";
			loadList();
		}
    	else
    	{
    		if (snapshot.val() == 0)
	    	{
    			alert("Item already exists on unshopped list!");
    		}
    		else
    		{
     			alert("Item already exists on shopped list!");   		
    		}
    	}
  });  
}

function showItem(key, val)
{
    		//create the list item
    		listitem = document.createElement('LI');
    		//create the div for the text of task
    		listitemcontainer = document.createElement('DIV');
		    //text container to prevent text from shrinking on swipe
		    txtcontainer = document.createElement('DIV');
		    txtcontainer.setAttribute("class","text-container");
		    txtcontainer.setAttribute('data-id',key);
		    txtcontainer.setAttribute('data-text',key);    
		    //give the text container a class
		    //create the task text using its name
		    listtext = document.createTextNode(key);
		    //create the remove button
		    listbutton = document.createElement('BUTTON');
		    listbutton.setAttribute('data-id',key);
		    //add the text into the div element
		    txtcontainer.appendChild(listtext);
		    listitemcontainer.appendChild(txtcontainer);
    		//add the div into the list item
		    listitem.appendChild(listbutton);
		    listitem.appendChild(listitemcontainer);
		    listitem.setAttribute("data-id",key);

		    if ((val == 0) || (val == 1))
		    {
  				if (val == 0) //unshopped item
  				{
			    	containerUnshopped.appendChild(listitem);
  				}
  				else //shopped item
  				{
		    		containerShopped.appendChild(listitem);
  				}
  			}	
}

function writeListData(email) {
  firebase.database().ref('users/' + userId).set({
    email: email
  });
}

//load local Storage accordingly with the list_name (can be "unshopped" or "shopped")
function loadList()
{
	if (userId)
	{	
		//find all lists shared with this user
		listsRoot = firebase.database().ref("lists");
		listsRoot.orderByChild(userId).equalTo('shared').once('value', function(snapshot){
			snapshot.forEach(function(child){
				//show list of lists
				//on click button: set listsRef = lists/+userId
				console.log("user", child.key);
			});
		});

		listsRef = firebase.database().ref("lists/" + userId);
		usersRef = firebase.database().ref("users");
		listsRef.orderByKey().once("value", function(snapshot) {		
  		snapshot.forEach(function(data) {
  			showItem(data.key, data.val());
  		});
	});
	}
}

function touchStart(event)
{ 
   	//record touch x position when it starts
   	app.touch = event.touches[0].clientX;    
}

function checkToDelete(event)
{
    //get the x position of the touch
	var touchx = event.touches[0].clientX;
	//calculate how far the swipe has moved by subtracting app.touch(the origin point) from current touch position
    	app.movement=touchx-app.touch;

   	//identify the touch target tag
   	var touchtarget = event.target.tagName;

   	//since the target is the text-container we need to get the parent of its parent
   	//=the li element, then get to the button (the button is created on renderList function)
   	var button = event.target.parentNode.parentNode.getElementsByTagName('BUTTON')[0];
   	//only move element if target is a div
   	if(touchtarget.toLowerCase()=="div"){
   		if(app.movement>0 && app.movement<=app.threshold+50){
     		//if movement is less than the threshold
       		button.style.width = app.movement+"px";
      	}
      	else if(app.movement<0){
       		width = parseFloat(button.style.width,10);
       		button.style.width = app.threshold+app.movement+"px";
      	}
    }
}

function addInput(event)
{
	event.preventDefault();
  	//get task input value
  	item = document.getElementById("item-input").value;
  	if (item.trim() != "")
  	{
    	createItem(item);
    	document.getElementById("input-form").reset();
  	}
}

var tapedTwice = false;

function tapHandlerList(list_name, event) {
	//update list (status)
	if(!tapedTwice) {
    	tapedTwice = true;
        setTimeout( function() { tapedTwice = false; }, 300 );
        return false;
    }

  	id=event.target.getAttribute("data-id");

    if (list_name == "unshopped") //status 0
    {
    	itemUpdated = {}; 
		itemUpdated[id] = 1;
    	listsRef.update(itemUpdated);
		containerShopped.innerHTML="";
		containerUnshopped.innerHTML="";
		loadList();

	}
	else //status 1
	{
    	itemUpdated = {}; 
		itemUpdated[id] = 0;
    	listsRef.update(itemUpdated);
		containerShopped.innerHTML="";
		containerUnshopped.innerHTML="";
		loadList();
    }   
}


function touchEnd(list_name, event)
{
	var touchtarget = event.target.tagName;
   	//since the target is the text-container we need to get the parent of its parent
   	//=the li element, then get to the button
   	var button = event.target.parentNode.parentNode.getElementsByTagName('BUTTON')[0];
   	//only move element if target is a div
   	if(touchtarget.toLowerCase()=="div"){
		//if swipe right goes beyond the threshold
    	if(app.movement>=app.threshold){
    		button.style.width = app.threshold;
   		}
      	//if swipe right does not go beyond threshold, change button back to 0 width
	    if(app.movement<app.threshold && app.movement>0){
    		button.style.width = '0px';
      	}
      	//if swipe left (movement<0) and it is smaller than threshold snap button back to 0
      	else if(app.movement<0 && app.movement<app.threshold){
       		button.style.width = '0px';
   		}
   	}

    //if touchtarget is a button
	if(touchtarget.toLowerCase()=="button"){
    	var taskid = event.target.parentNode.getAttribute('data-id');   	

  		listsRef.once("value").then(function(snapshot) {
    		snapshot.forEach(function(child) {
    			if (child.key == taskid)
    			{
		        	child.ref.remove();
					containerShopped.innerHTML="";
					containerUnshopped.innerHTML="";
					loadList();
		        }
		    });
      });
    }
}

function showForm(evt){
  evt.preventDefault();
  var id = evt.target.id;
  if(id==='signup-link'){
    var hideelm = document.getElementById('login');
    hideelm.style.visibility='hidden';
    hideelm.style.height=0;
    var showelm = document.getElementById('signup');
    showelm.style.visibility='visible';
    showelm.style.height='auto';
  }
  if(id==='login-link'){
    var hideelm = document.getElementById('signup');
    hideelm.style.visibility='hidden';
    hideelm.style.height=0;
    var showelm = document.getElementById('login');
    showelm.style.visibility='visible';
    showelm.style.height='auto';
  }
}

function toggleShareVisibility(status){
  if(status=='show'){
    document.getElementById('share').style.visibility='visible';    
    document.getElementById('shared').style.visibility='visible';
  }
  if(status=='hide'){
    document.getElementById('share').style.visibility='hidden';
    document.getElementById('shared').style.visibility='hidden';
  }
}

function toggleOverlayVisibility(status){

  if(status=='show'){
    document.getElementById('overlay').style.visibility='visible';
    document.getElementById('login').style.visibility = 'visible';
    document.getElementById('signup').style.visibility = 'hidden';
  }
  if(status=='hide'){
    document.getElementById('overlay').style.visibility='hidden';
    document.getElementById('login').style.visibility = 'hidden';
    document.getElementById('signup').style.visibility = 'hidden';
  }
}

function getData(e){
  e.preventDefault();
  var id = e.target.id;
  var formData = new FormData(document.getElementById(id));
  e.target.reset();
  if(id=='signup-form'){
    signUpUser(formData.get('email'),formData.get('password'));
  }
  if(id=='login-form'){
    signInUser(formData.get('email'),formData.get('password'));
  }
}

function signUpUser(email,password){
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(){
  	//access the database and insert the current user
	userId = firebase.auth().currentUser.uid;
	var email = firebase.auth().currentUser.email;
	writeListData(email);
    loadList(); 
  })
  .catch(function(error) {
  // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error);
  });
}

function signInUser(email,password){
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function (snapshot) {
  	//access the database and select the current user
	userId = firebase.auth().currentUser.uid;	
    loadList();  		
  })
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
}
function signOutUser(){
	containerUnshopped.innerHTML="";
	containerShopped.innerHTML="";
  	firebase.auth().signOut().then(function() {
  	// Sign-out successful
    	toggleOverlayVisibility('show');
    	var hideelm = document.getElementById('signup');
    	hideelm.style.visibility='hidden';
    	hideelm.style.height=0;
    	var showelm = document.getElementById('login');
    	showelm.style.visibility='visible';
    	showelm.style.height='auto';

  	}, function(error) {
   		// An error happened.
  	});
}

function shareData(e)
{
	e.preventDefault();
	toggleShareVisibility('hide');
	var id = e.target.id;
  	var formData = new FormData(document.getElementById(id));
  	e.target.reset();

  	var email = formData.get('email');

	usersRef.orderByChild("email").equalTo(email).once("value", function(snapshot) {
        snapshot.forEach(function(child) {
        	if (child.val() != null)
        	{
            	sharedKey = child.key;
			  	listsRef.child(sharedKey).once('value', function(snapshot) {	
    				if (snapshot.val() == null)
	    			{
						listsRef.child(sharedKey).set('shared');
					}
	    			else
		    		{
    					alert("List already shared with: " + email);
    				}
    			});
    		}
    		else
    		{
  				alert("There is no user for: " + email);
    		}
  		});
  	});
}

window.addEventListener("load",function()
{
  	addCordovaEvents();

	//add firebase auth observer
  	firebase.auth().onAuthStateChanged(function(user) {
  		toggleShareVisibility('hide');
    	if (user) {
      		//user is logged in
      		//hide the overlay
      		toggleOverlayVisibility('hide');
      		//hide menu items
      		document.getElementById('user-login').style.display='none';
      		document.getElementById('user-signup').style.display='none';
      		document.getElementById('user-logout').style.display='flex';      		
    	}
    	else{
      		toggleOverlayVisibility('show');
      		//user is logged out
      		//hide the logout button
      		document.getElementById('user-login').style.display='flex';
      		document.getElementById('user-signup').style.display='flex';      		
      		document.getElementById('user-logout').style.display='none'; 
    	}

  	});
  	//listeners for form switcher
  	document.getElementById('signup-link').addEventListener('click',showForm);
  	document.getElementById('login-link').addEventListener('click',showForm);
  	//sign up user
  	document.getElementById('signup-form').addEventListener('submit',getData);
  	document.getElementById('login-form').addEventListener('submit',getData);
  	//add listeners to main navigation functions
  	//--logout
  	document.getElementById('user-logout').addEventListener('click',signOutUser);  	

  	//add item from input form into unshopped list
  	document.getElementById("btnadd").addEventListener("click", addInput); 

  	//add item from input form into unshopped list
  	document.getElementById("btnshare").addEventListener("click", function(){
  		toggleShareVisibility('show');
  	});

  	document.getElementById('share-form').addEventListener('submit',shareData);  	

	document.getElementById("unshopped-item").addEventListener("touchstart",touchStart);
	document.getElementById("unshopped-item").addEventListener("touchstart", function() {
    	tapHandlerList("unshopped", event);});
	document.getElementById("unshopped-item").addEventListener("touchmove", checkToDelete);
  	document.getElementById("unshopped-item").addEventListener("touchend", function() {
    	touchEnd("unshopped", event);}); 	

	document.getElementById("shopped-item").addEventListener("touchstart",touchStart);
	document.getElementById("shopped-item").addEventListener("touchstart", function() {
    	tapHandlerList("shopped", event);});
	document.getElementById("shopped-item").addEventListener("touchmove", checkToDelete);
  	document.getElementById("shopped-item").addEventListener("touchend", function() {
    	touchEnd("shopped", event);}); 

});
  

function addCordovaEvents(){
  document.addEventListener("deviceready",onDeviceReady,false);
}

function onDeviceReady(){
  document.addEventListener("pause",function(){
    saveList("unshopped", list_unshopped);
    saveList("shopped", list_shopped);
  },false);
  document.addEventListener("resume",function(){
    loadList();
    loadList()
  },false);
  document.addEventListener("backbutton",function(){
    saveList("unshopped", list_unshopped);
    saveList("shopped", list_shopped);
    navigator.app.exitApp();
  },false);
}
