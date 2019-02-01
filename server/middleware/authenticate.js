const {User} = require('./../models/user');

var authenticated = (req, res, next)=> {
    var token = req.header('x-auth');

    User.findByToken(token).then(user => {
        if(!user){
            return Promise.reject();
        }
        console.log(user);
        
        req.user = user;
        req.token = token;

        next(); 
    }).catch(err => {
        res.status(401).send(err);
    })
}

module.exports = {
     authenticated
}