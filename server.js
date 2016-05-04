//./mongo todos --> apre il db mongo "todos" (in mongodb/bin)
//./mongod --storageEngine=mmapv1 --dbpath /data/db  --> start listener for mongodb connection (in mongodb/bin)
//node server --> start node server.js




var http = require('http');
var port = 1337;
var express = require('express'),
//pug = require('pug'),
todos = require('./app/routes/todos.js');
var hbs = require('hbs');
var expressHbs = require('handlebars');



var app = express();
var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('chat', server);


/*app.configure(function () {
    app.use(express.logger('dev'));     // 'default', 'short', 'tiny', 'dev' 
    app.use(express.bodyParser());
});*/
app.set('views',__dirname + '/app/views');
/*app.set('view engine','pug');*/
//app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
   db.collection('chat', function(err, collection) {
        collection.find().toArray(function(err, items) {
           console.log(items);
           res.render(__dirname + '/app/views/index', { items: (items) });
        });
    });
  //res.sendFile(__dirname + '/app/views/index.html');
//io.sockets.emit('chat message','msg');
/*var msg = {msg:'msg'};
  db.collection('chat').insert(msg,{safe:true}, function(err,result){
            //if (err) throw err;
            if (err) {
                  console.log(err);
                   // res.send({'error':'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result));
                //    res.send(result[0]);
                }
           // db.close();
          });*/
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
		  var msg = {msg:msg};
  db.collection('chat').insert(msg,{safe:true}, function(err,result){
            //if (err) throw err;
            if (err) {
                  console.log(err);
                   // res.send({'error':'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result));
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
