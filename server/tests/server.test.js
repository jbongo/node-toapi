const expect = require('expect');  // appel implicitement mocha
const request = require('supertest');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [
    {text: 'Todo number 1'},
    {text: 'Todo number 2'}
];

beforeEach((done)=>{
    Todo.deleteMany({}).then(()=>{
        // 
        return Todo.insertMany(todos);
    }).then(()=> done());
});

// describe permet de reunir des tests unitaire
describe('POST /todos', ()=>{
    it('doit creer un nouveau todo', (done)=>{
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text:text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text)
            })
            .end(done);
    }) ;

    it('Ne doit pas creer un todo avec un body non valide.', (done)=>{

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end(done);
    }) ;

});


describe('GET /todos', ()=>{
    it('doit recevoir tous les todos', (done)=>{
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    })
})

describe('DELETE /todos/id', ()=>{
    it('doit un supprimer un todos', (done)=>{
        var id = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todos._id).toBe(id);
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
                Todo.findById(id).then(todo => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch(err => { done(err)});
            });
    });
    it("doit retourner 404 si l'dentifiant n'existe pas en base de donnée",(done)=>{
        request(app)
        .get('/todo/123')
        .expect(200)
        .end(done)
    });
})