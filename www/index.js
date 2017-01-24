
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

//when an item is added, it's added into unshopped list
function createItem(item, list_name)
{
  id = new Date().getTime();
  name = item;

  //Check if the item already exists in both lists
  status = 0;
  checkExits(name, "Unshopped", list_unshopped);
  checkExits(name, "Shopped", list_shopped);
  
  if(status == 0)
  {
    if (list_name == "unshopped")
    {
      unshopped ={id:id,name:name};
      list_unshopped.push(unshopped);  
      renderList("unshopped-item", "unshopped", list_unshopped);
    }
    else
    {
      shopped ={id:id,name:name};
      list_shopped.push(shopped);  
      renderList("shopped-item", "shopped", list_shopped);    
    }
  }
}


//chech if the item already exists on shopped and unshopped lists
function checkExits(name, list_name, list_array)
{
  for(i=0;i<list_array.length;i++)
  {
    if(list_array[i].name == name)
    {
      alert("Item already exists on " + list_name + " list!");
      status = 1;
      break;
    }
  }
}

//add the array into the local storage
function saveList(list_name, list_array)
{
  if(window.localStorage)
  {
    localStorage.setItem(list_name,JSON.stringify(list_array));
  }
}

//update the list after having the item added
function renderList(elm,list_name, list_array)
{
  var container = document.getElementById(elm);
  saveList(list_name, list_array);

  // sort by name
  list_array.sort(function(a, b) 
  {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });

  container.innerHTML="";
  itemstotal = list_array.length;
  for(i=0;i<itemstotal;i++)
  {
    item = list_array[i];
    
    //create the list item
    listitem = document.createElement('LI');
    //create the div for the text of task
    listitemcontainer = document.createElement('DIV');
    //text container to prevent text from shrinking on swipe
    txtcontainer = document.createElement('DIV');
    txtcontainer.setAttribute("class","text-container");
    txtcontainer.setAttribute('data-id',item.id);
    txtcontainer.setAttribute('data-text',item.name);    
    //give the text container a class
    //create the task text using its name
    listtext = document.createTextNode(item.name);
    //create the remove button
    listbutton = document.createElement('BUTTON');
    listbutton.setAttribute('data-id',item.id);
    //add the text into the div element
    txtcontainer.appendChild(listtext);
    listitemcontainer.appendChild(txtcontainer);
    //add the div into the list item
    listitem.appendChild(listbutton);
    listitem.appendChild(listitemcontainer);
    listitem.setAttribute("data-id",item.id);

    container.appendChild(listitem);
  }
}

//load local Storage accordingly with the list_name (can be "unshopped" or "shopped")
function loadList(elm, list_name)
{
  if(window.localStorage)
  {
    try
    {
      if(JSON.parse(localStorage.getItem(list_name)))
      {
        if (list_name == "unshopped")
        {
          list_unshopped = JSON.parse(localStorage.getItem(list_name));
          renderList(elm, list_name, list_unshopped);
        }
        else
        {
          list_shopped = JSON.parse(localStorage.getItem(list_name));
          renderList(elm, list_name, list_shopped);
        }
      }
    }
    catch(error)
    {
      console.log("error"+error);
    }
  }
}


function removeItem(event, list_name, list_array)
{
  //item selected
  id=event.target.getAttribute("data-id");
  name=event.target.getAttribute("data-text");
  
  for(i=0;i<list_array.length;i++)
  {
    if(list_array[i].id == id)
    {
      //Delete the selected item from the list
      list_array.splice(i,1);

      if (list_name == "unshopped")
      {
         elm = "unshopped-item";
      }
      else
      {
        elm = "shopped-item";
      }
      renderList(elm, list_name, list_array);
    }
  }
}

function getPosition(event)
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
    createItem(item, "unshopped");
    document.getElementById("input-form").reset();
  }
}

window.addEventListener("load",function()
{
  	addCordovaEvents();

	//add item from input form into unshopped list
	document.getElementById("input-form").addEventListener("submit",addInput);

  	//load unshopped list
  	loadList("unshopped-item", "unshopped");
	document.getElementById("unshopped-item").addEventListener("touchstart",getPosition);
	document.getElementById("unshopped-item").addEventListener("touchmove", checkToDelete);

  	//load shopped list
  	loadList("shopped-item", "shopped");
	document.getElementById("shopped-item").addEventListener("touchstart",getPosition);
	document.getElementById("shopped-item").addEventListener("touchmove", checkToDelete);

  	document.getElementById("unshopped-item").addEventListener("touchend",function(event)
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
      		removeItem(event, "unshopped", list_unshopped);  
    	}
  	},{passive:true}); 

  	document.getElementById("shopped-item").addEventListener("touchend",function(event)
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
      		removeItem(event, "shopped", list_shopped);  
    	}
 	},{passive:true});  

  	document.getElementById("unshopped-item").addEventListener("touchstart", tapHandlerUnshopped);
  	var tapedTwice = false;
  	function tapHandlerUnshopped(event) {
    	if(!tapedTwice) {
        	tapedTwice = true;
          	setTimeout( function() { tapedTwice = false; }, 300 );
          	return false;
      	}
      	event.preventDefault();
      	removeItem(event, "unshopped", list_unshopped); 
      	//create item in shopped list
      	createItem(name, "shopped");      
   	}  

  	document.getElementById("shopped-item").addEventListener("touchstart", tapHandlerShopped);
  	var tapedTwice = false;
  	function tapHandlerShopped(event) {
    	if(!tapedTwice) {
        	tapedTwice = true;
          	setTimeout( function() { tapedTwice = false; }, 300 );
          	return false;
      	}
      	event.preventDefault();
      	removeItem(event, "shopped", list_shopped); 
      	//create item in unshopped list
      	createItem(name, "unshopped");      
   	}  

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
    loadList("unshopped-item", "unshopped");
    loadList("shopped-item", "shopped")
  },false);
  document.addEventListener("backbutton",function(){
    saveList("unshopped", list_unshopped);
    saveList("shopped", list_shopped);
    navigator.app.exitApp();
  },false);
}
