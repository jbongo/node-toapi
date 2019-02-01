const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticated} = require('./middleware/authenticate');


var app = express();
// middleware décondanr le json inclu dans le body des requêtes
app.use(bodyParser.json());

// #######routes TODO ######
// GET / todos

app.get('/todos',(req,res)=>{
    Todo.find().then(todos => {
        res.send({todos:todos})
    }).catch(err => {
        res.status(400).send(err);
    })
})


// POST / todos
app.post('/todos',(req,res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then(doc => { // sauvegarde les data / retourne une prmesse
        res.status(200).send(doc);
    }).catch( err => {
        res.status(400).send(err);
    });  
});


// GET /todos/id
app.get('/todos/:id', (req,res) => {
    var id = req.params.id;

    Todo.findById(id).then((todo)=> {
        if(!todo){
            return res.status(404).send(); // on sort carrement
        }else{
            res.status(200).send({todo});
        }
    }).catch(err => {
        res.status(400).send(err);
    });
    
});

// DELETE todo/id

app.delete('/todos/:id',()=>{

    it('doit supprimer un todo',(todo)=>{
        app.delete('/todos/:id')
    })
})


//PATCH /todos/id
app.patch('todos/:id',(req,res)=>{
    var id = req.params.id;
    var body = _.pick(req.body, ['text','completed']); // pick va reccuperer toutes les propriétés text et completed du body et les met dans un objet
    
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body},{new: true})  //{$set: body} == {$set: {text:"mon new text", completed:true}}
        .then(todo => {
            if(!todo){
                return res.status(404).send();
            }

            res.status(200).send({todo});
        }).catch(err => {res.status(400).send(err)});
})

// #### FIN TODO


// ###### ROUTES USER

// POST / users Route pour l'enregistrement d'un utilsateur
app.post('/users',(req,res)=> {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(doc => {
        res.status(200).send(doc);
    }).catch(err => {
        res.status(400).send(err);
    })
});

// POST /users/login

app.post('/users/login',(req,res)=> {
    var body = _.pick(req.body, ['email', 'password']);


    User.findByCredentials(body.email, body.password)
    .then(user => {
        // res.status(200).send(user);
        user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        });
    }).catch(err => {
        res.status(400).send();
    })
})

// GET /users/me
// on lui rajoute le middleware authenticated qu'on a crée
app.get('/users/me',authenticated,(req,res)=> {

    res.send(req.user);
    console.log(req.user);
    
});



app.listen(3000,() => {
    console.log('Serveur ecoutant le port 3000...');
});

module.exports = {app}