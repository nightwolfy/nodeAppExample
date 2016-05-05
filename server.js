//./mongo todos --> apre il db mongo "todos" (in mongodb/bin)
//./mongod --storageEngine=mmapv1 --dbpath /data/db  --> start listener for mongodb connection (in mongodb/bin)
//node server --> start node server.js




var http = require('http');
var port = 1337;
var express = require('express'),
//pug = require('pug'),
todos = require('./app/routes/todos.js');
chats = require('./app/routes/chats.js');
var hbs = require('hbs');
var expressHbs = require('handlebars');

var app = express();
var mongo = require('mongodb');
var stanzeColl="stanze";
var chatColl="chat";
var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('chat', server);



app.get('/todos', todos.findAll);
app.get('/todos/:id', todos.findById);
app.post('/todos', todos.addWine);
app.put('/todos/:id', todos.updateWine);
app.delete('/todos/:id', todos.deleteWine);

app.get('/chats', chats.findAll);
app.get('/chats/:id', chats.findById);
app.post('/chats', chats.addChat);
app.put('/chats/:id', chats.updateChat);
app.delete('/chats/:id', chats.deleteChat);
/*app.configure(function () {
    app.use(express.logger('dev'));     // 'default', 'short', 'tiny', 'dev' 
    app.use(express.bodyParser());
});*/
app.set('views',__dirname + '/app/views');
/*app.set('view engine','pug');*/
//app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');
app.get('/', function(req, res){
    global.stanzaID="";
    db.collection(stanzeColl, function(err, collection) 
    {
        collection.find().toArray(function(err, items) {
            //console.log(items);
            res.render(__dirname + '/app/views/index', { items: (items) });
        });
    });
});
app.get('/stanza/:id', function(req, res)
{
    var id = new mongo.ObjectID(req.params.id)
    global.stanzaID = id;

    //console.log("IDSTANZA = " + global.stanzaID);
    //console.log(global.stanzaID);
    //console.log(JSON.stringify(id));
   /* db.collection(stanzeColl, function(err, collection) {
        collection.aggregate([
        {
          $lookup:
          {
              from: "chat",
              localField: "id",
              foreignField: "idStanza",
              as: "messaggi"
          }
      }
      ], function(err, items) {
        console.log(items);
        res.render(__dirname + '/app/views/chat', { items: (items) });
    });
});*/


db.collection(chatColl, function(err, collection) 
{
    collection.find({idStanza:global.stanzaID}).toArray(function(err, items) 
    {
        //console.log("items where:" + JSON.stringify(items));
        res.render(__dirname + '/app/views/chat', { items: (items) });
    });
});
});
app.get('/chat', function(req, res){
    db.collection('chat', function(err, collection) {
        collection.find().toArray(function(err, items) {
            console.log(items);
            res.render(__dirname + '/app/views/chat', { items: (items) });
        });
    });
});

var io = require('socket.io').listen(app.listen(port));
openDB();
io.on('connection', function(socket)
{
   //d console.log('a user connected');
   socket.on('chat message', function(msg)
   {
    io.emit('chat message', msg);
    console.log("IDSTANZA = " + global.stanzaID);
    var msg = {msg:msg,idStanza:global.stanzaID};
    db.collection(chatColl).insert(msg,{safe:true}, function(err,result){
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
   socket.on('stanze message', function(stanza){

    var stanza = {nome:stanza};
    db.collection(stanzeColl).insert(stanza,{safe:true}, function(err,result){
        if (err) 
        {
            console.log(err);
        } 
        else 
        {
           io.emit('stanze message', result.ops[0]);
           console.log('Success: ' + JSON.stringify(result));
       }
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
