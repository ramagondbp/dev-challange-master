/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

function sortNumber(a, b){
  return a.lastChangeBid - b.lastChangeBid;
}

function displayTableList(listArray1){
  var dataList =  [...listArray1]
  // if(resetFlag){
    $("#priceDetail thead ").find("tr:gt(0)").remove();
  // }
  // console.log(dataList)
  var table = document.getElementById("priceDetail");  
      //  var unique = Array.from(new Set(dataList.map(JSON.stringify))).map(JSON.parse);
      //  console.log(unique);

      var sortArrayList = dataList.sort(sortNumber);

      function addCell(tr, text) {
        var td = tr.insertCell();
        td.textContent = text;
        return td;
      }

      sortArrayList.forEach(function(item) {
        var row = table.insertRow();
        addCell(row, item.name);
        addCell(row, item.bestBid);
        addCell(row, item.bestAsk);
        addCell(row, item.lastChangeBid);
        addCell(row, item.lastChangeAsk);

        var lastCell = addCell(row, ''); 
        var dataSpan = $("<span>");
        dataSpan.appendTo(lastCell);
        dataSpan.sparkline([30, item.bestBid, (item.bestBid + item.bestAsk)/2, item.bestAsk, 30]);    
      });
}

function connectCallback() {  
  var listArray = [];
  var flag = false;
  var stopFlag = false;

  callback = function(message) {
    var res = JSON.parse(message.body)
    listArray.push(res);
    
    setTimeout(function(){      
      flag=true; 
      if(!stopFlag) {
        stopFlag =true;
        displayTableList(listArray, true);
      }      
    }, 30000);

    if(!flag){
      displayTableList(listArray, false);
      // listArray=[]
      // flag=false
    }
  };

  client.subscribe("/fx/prices", callback);
  document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})