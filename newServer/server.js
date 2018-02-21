const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
//Cloud functions
const admin = require('firebase-admin');
var serviceAccount = require('./path/quizPictionary-f2c49e85f0c4.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();

// Setup
// Push Data to Firebase
var docRef = db.collection('users').doc('alovelace');

var setAda = docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
});

var aTuringRef = db.collection('users').doc('aturing');

var setAlan = aTuringRef.set({
    'first': 'Alan',
    'middle': 'Mathison',
    'last': 'Turing',
    'born': 1912
});

// Retrieve Data from firebase
db.collection('users').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });


io.on('connection', function(socket) {
});

http.listen(port, () => console.log('listening on port ' + port));
