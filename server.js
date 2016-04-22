//./mongo todos --> apre il db mongo "todos" (in mongodb/bin)
//./mongod --storageEngine=mmapv1 --dbpath /data/db  --> start listener for mongodb connection (in mongodb/bin)
//node server --> start node server.js




var http = require('http');
var port = 1337;
var express = require('express'),
todos = require('./app/routes/todos.js');

var app = express();
var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('todos', server);


/*app.configure(function () {
    app.use(express.logger('dev'));     // 'default', 'short', 'tiny', 'dev' 
    app.use(express.bodyParser());
});*/
app.get('/', function(req, res){
  res.sendFile(__dirname + '/app/views/index.html');
  
});
app.get('/todos', todos.findAll);
app.get('/todos/:id', todos.findById);
app.post('/todos', todos.addWine);
app.put('/todos/:id', todos.updateWine);
app.delete('/todos/:id', todos.deleteWine);

var io = require('socket.io').listen(app.listen(port));
openDB();
io.on('connection', function(socket){
  console.log('a user connected');
   socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log(msg);
		   var wine = {msg:msg};
		    console.log('Adding todos: ' + JSON.stringify(wine));
			db.collection('chat').insert(wine,{safe:true}, function(err,result){
            //if (err) throw err;
            if (err) {
		            	console.log(err);
		               // res.send({'error':'An error has occurred'});
		            } else {
		                console.log('Success: ' + JSON.stringify(result[0]));
		            //    res.send(result[0]);
		            }
           // db.close();
        	});
		   
  });
});

function openDB()
{
	
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'todos' database");
    }
});

}

console.log('Listening on port '+ port +'...');