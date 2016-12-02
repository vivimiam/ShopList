
var list_shopped = [];
var list_unshopped = [];
var status = 0;

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
    
    listitem = document.createElement('LI');
    listtext = document.createTextNode(item.name);

    listitem.appendChild(listtext);
    listitem.setAttribute("id",item.id);
    listitem.setAttribute("name", item.name);

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
  id=event.target.getAttribute("id");
  name=event.target.getAttribute("name");

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


window.addEventListener("load",function()
{
  addCordovaEvents();

  //load unshopped list
  loadList("unshopped-item", "unshopped");

  //listener for touch on the list of unshopped
  document.getElementById("unshopped-item").addEventListener("touchstart",function(event)
  {
    var startCoordinates = {x:event.changedTouches[0].clientX,
                            y:event.changedTouches[0].clientY};
    var endHandler = function(event)
    {
        var xDiff = Math.abs(Math.abs(startCoordinates.x) - 
                             Math.abs(event.changedTouches[0].clientX));
        //unbind handler, avoid double listeners
        document.getElementById("unshopped-item").removeEventListener('touchend', endHandler, false); 
        if (xDiff >= 100)
        {//assume small movement wasn't intended as swipe
            name = event.target.getAttribute("name");
            if (confirm('Are you sure you want to delete ' + name + ' ?'))
            {
              //remove item from shopped list
              removeItem(event, "unshopped", list_unshopped);               
            }
        }
    };
    document.getElementById("unshopped-item").addEventListener('touchend',endHandler,false);
  });

  //load shopped list
  loadList("shopped-item", "shopped");
  
  //listener for touch on the list of shopped
  document.getElementById("shopped-item").addEventListener("touchstart",function(event)
  {
    var startCoordinates = {x:event.changedTouches[0].clientX,
                            y:event.changedTouches[0].clientY};
    var endHandler = function(event)
    {
        var xDiff = Math.abs(Math.abs(startCoordinates.x) - 
                             Math.abs(event.changedTouches[0].clientX));
        //unbind handler, avoid double listeners
        document.getElementById("shopped-item").removeEventListener('touchend', endHandler, false); 
        if (xDiff >= 100)
        {//assume small movement wasn't intended as swipe
            name = event.target.getAttribute("name");
            if (confirm('Are you sure you want to delete ' + name + ' ?'))
            {
              //remove item from shopped list
              removeItem(event, "shopped", list_shopped);               
            }
        }
    };
    document.getElementById("shopped-item").addEventListener('touchend',endHandler,false);
  });  

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

//add item from input form into unshopped list
var inputform = document.getElementById("input-form");
inputform.addEventListener("submit",function(event){
  event.preventDefault();
  //get task input value
  item = document.getElementById("item-input").value;
  if (item.trim() != "")
  {
    createItem(item, "unshopped");
    inputform.reset();
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
