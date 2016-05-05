var mongo = require('mongodb');

var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('chat', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'chat' database");
        db.collection('chat', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'chat' collection doesn't exist. Creating it with sample data...");
                //populateDB();
                var chat = [
                {
                    title: "CHATEAU DE SAINT COSME",
                    year: "2009",
                    grapes: "Grenache / Syrah",
                    country: "France",
                    region: "Southern Rhone",
                    description: "The aromas of fruit and spice...",
                    picture: "saint_cosme.jpg"
                },
                {
                    name: "LAN RIOJA CRIANZA",
                    year: "2006",
                    grapes: "Tempranillo",
                    country: "Spain",
                    region: "Rioja",
                    description: "A resurgence of interest in boutique vineyards...",
                    picture: "lan_rioja.jpg"
                }];

                db.collection('chat', function(err, collection) {
                    collection.insert(chat, {safe:true}, function(err, result) {});
                });
            }
        });
    }
});

exports.findById = function(req, res) {
    //var id = req.params.id;
    var id = new mongo.ObjectID(req.params.id)
    console.log('Retrieving wine: ' + id);
    db.collection('chat', function(err, collection) {
        collection.findOne({'_id':id}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('chat', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addChat = function(req, res) {
    var chat = req.body;
    console.log('Adding chat: ' + JSON.stringify(chat));
    db.collection('chat', function(err, collection) {
        collection.insert(chat, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateChat = function(req, res) {
    var id = req.params.id;
    var chat = req.body;
    console.log('Updating chat: ' + id);
    console.log(JSON.stringify(chat));
    db.collection('chat', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, chat, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating chat: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(chat);
            }
        });
    });
}

exports.deleteChat = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    db.collection('chat', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
