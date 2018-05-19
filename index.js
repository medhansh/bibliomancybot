const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const cool = require('cool-ascii-faces')
var ejs = require("ejs");
var util = require('util');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Show unhandled rejections
process.on('unhandledRejection', function(reason, promise) {
    console.log(promise);
});


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
  console.log('Testing');
});

app.get('/', function (req, res) {
  res.render('pages/chatbot.ejs')
})

app.get('/cool', function (req, res) {
  res.send(cool());
})


app.post('/ai', (req, res) => {

    // console.log(req.body);
    // console.log(req.body.queryResult.intent.displayName);
    
    if (req.body.queryResult.intent.displayName === 'book.recommend') {

    	
   	    let tastedivefetch = function() {
		    return new Promise(function(resolve, reject) {
	        	let title = req.body.queryResult.parameters['booktitle'];
		    	console.log('Title is : ', title);
	    		let restUrl = 'https://tastedive.com/api/similar?q=book:'+title+'&type=books&k=271716-Biblioma-6STCBQWM&limit=2&verbose=1';
	    		request.get(restUrl, (err, response, body) => {
	     			if (!err && response.statusCode == 200) {
	        
			       		let json = JSON.parse(body);
			        	console.log(json.Similar.Results);
			        	console.log(json.Similar.Results.length);
			        	let finres = ' ';
			       	    if (json.Similar.Results.length == 0) {
							finres = 'I could not find books similar to ' + title + '. Please try with some other title';
							reject("no such title");
						} 
						else {
							console.log('inside else');  
							console.log('Finished tastedivefetch. Going to resolve');
     						resolve(json);
							//finres = 'You might enjoy reading one of the following books';
							//var messageData = { "title 1" : json.Similar.Results[0].Name, "title 2" : json.Similar.Results[1].Name };
							//messageData1 = "Title 1: " + json.Similar.Results[0].Name + ":" + json.Similar.Results[0].wTeaser;
							//messageData2 = "Title 2: " + json.Similar.Results[1].Name + ":" + json.Similar.Results[1].wTeaser;
							//var messageData = {"title" : json.Similar.Results[0].Name, "description" : json.Similar.Results[0].wTeaser}
							//mdata = JSON.stringify(messageData);
							//var lowercasetitle = json.Similar.Results[0].Name.toLowerCase();
							//console.log('lowercasetitle = ', lowercasetitle);	
							//var replacedtitle = lowercasetitle.split(' ').join('_');
							//console.log('replacedtitle = ', replacedtitle);
						}							
					}
     			});

  			}).catch((err) => {
  				// Handle any error that occurred in any of the previous
  				// promises in the chain.
  				console.log(err);
			});
		};

 	    let goodreadsfetch = function(json) {
		    return new Promise(function(resolve, reject) {
	        	console.log('Inside goodreadsfetch : ', json);
	        	console.log('json = ', json.Similar.Results[0]);
	        	let imgurl = "";
	    		let restUrl1 = 'https://www.goodreads.com/search/index.xml?key=ebZOU4Nm4gLQ6ZZ6Fa3A&q='+json.Similar.Results[0].Name;
	    		request.get(restUrl1, (err1, response1, body1) => {
	     			if (!err1 && response1.statusCode == 200) {
	        
			       		var parseString = require('xml2js').parseString;
						var xml = body1;
						parseString(xml, function (err2, result2) {
    						//console.dir(result);
    						console.log(util.inspect(result2.GoodreadsResponse.search[0].results[0].work[0].best_book[0].image_url, false, null));
    						imgurl = util.inspect(result2.GoodreadsResponse.search[0].results[0].work[0].best_book[0].image_url, false, null);
			        		console.log(imgurl);
    					});


			       		if (body1.length == 0) {
							//finres = 'I could not find books similar to ' + title + '. Please try with some other title';
						} 
						else {
							console.log('successful fetch from goodreads.');
							console.log(imgurl);

							var retobj = {
				    			title:json.Similar.Results[0].Name,
				    			desc:json.Similar.Results[0].wTeaser,
				    			wurl:json.Similar.Results[0].wUrl,
				    			imageurl:imgurl
							};     			

     						console.log(retobj);

     						resolve(retobj);  
							//finres = 'You might enjoy reading one of the following books';
							//var messageData = { "title 1" : json.Similar.Results[0].Name, "title 2" : json.Similar.Results[1].Name };
							//messageData1 = "Title 1: " + json.Similar.Results[0].Name + ":" + json.Similar.Results[0].wTeaser;
							//messageData2 = "Title 2: " + json.Similar.Results[1].Name + ":" + json.Similar.Results[1].wTeaser;
							//var messageData = {"title" : json.Similar.Results[0].Name, "description" : json.Similar.Results[0].wTeaser}
							//mdata = JSON.stringify(messageData);
							//var lowercasetitle = json.Similar.Results[0].Name.toLowerCase();
							//console.log('lowercasetitle = ', lowercasetitle);	
							//var replacedtitle = lowercasetitle.split(' ').join('_');
							//console.log('replacedtitle = ', replacedtitle);
						}							
					}
     			});

	    		
  			}).catch((err) => {
  				// Handle any error that occurred in any of the previous
  				// promises in the chain.
  				console.log(err);
			});
		};


		tastedivefetch().then(function(result3){
			return goodreadsfetch(result3);
		}).then(function(result3){
			console.log('finished ' + result3);
					//let responseObj = {"booktitle" : json.Similar.Results[0].Name};

			let newimgurl = result3.imageurl.substr(3,result3.imageurl.length-6);
			console.log(newimgurl);

			let responseObj={
				     "fulfillmentText": "You may be interested in one of the following books"
				    ,"fulfillmentMessages":[
				        {
				            "card": {
				                "title": result3.title,
				                "subtitle" : result3.desc,
				                "imageUri": newimgurl,
				                "buttons": [
		          					{
		            					"text": "Show Details",
		            					"postback": result3.wurl
		          					}
		        				]
				            }

				        },
				        {
				            "card": {
				                "title": result3.title,
				                "subtitle" : result3.desc,
				                "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
				                "buttons": [
		          					{
		            					"text": "Show Details",
		            					"postback": result3.wurl
		          					}
		        				]
				            }
				        }		            

				    ]
				    ,"source":""
				}

	   		console.log(JSON.stringify(responseObj));
	   		//res.json({ 'fulfillmentText': finres, 'fulfillmentMessages' : JSON.stringify(responseObj) });
		   	return res.json(responseObj);
		})



   		     
  }
  
    
});
