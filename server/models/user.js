const mongoose = require('mongoose');
const _ = require('lodash');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


var UserSchema = new mongoose.Schema({
    email:{
        type : String,
        required : true,     
        trim: true,     
        minlength: 4,     
        unique: true,     
        validate:{     
          validator: validator.isEmail,  // fct qui renvoie un boolean pas de () car appel immediat     
          message: 'Email invalide'    }
    },
    password:{
        type : String,
        required : true,
        minlength: 6,
    },
    tokens:[{
        access:{
            type:String,
            required: true
        },
        token:{
            type:String,
            required: true
        }
    }]
});

// ** Méthodes d'istance ** (méthode intégré aux objets)
// la methode toJSON est chargé de renvoyer tout notre objet au client/.... oon va le overrider pour ne pas qu'il envoie toutes les propr au navigateur sur  le mot de passe crypté
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id','email']);
}

UserSchema.methods.generateAuthToken = function (){
    // https://jwt.io
    var user = this;
    var access = 'auth';
    console.log(user);

    // on génère notre token
    var token = jwt.sign({_id: user._id.toHexString(), access},  'abc123').toString();
      
    // Problème potentiel avec la méthode  .push
    user.tokens = user.tokens.concat([{access,token}]);

    // Mise à jour du user
    return user.save().then(()=> {
        return token;
    });
}

// *** Méthodes de modèle ** (méthode intégré au class  dite statiques)

UserSchema.statics.findByCredentials = function(email, password){
    var User = this; // contexte du modèle

    return User.findOne({email}).then(user => {
        if(!user){
            return Promise.reject(); // rejet immediat si user non trouvé
        }else{
            //si user trouvé

            return new Promise ((resolve, reject) => {
                bcrypt.compare(password, user.password, (err,res)=>{
                    if(res){
                        resolve(user);
                    }else{
                        reject("Les mots de passes ne correspondent pas");
                    }
                }); // !# bcrypt
            }); //!# Promesse
        }
    }); //!# findOne
}

UserSchema.statics.findByToken = function(token){
    
   var User = this;
   var decoded;

   try{
        decoded = jwt.verify(token,'abc123');
   }catch(e){
        return Promise.reject();
   }

   return User.findOne({
       '_id': decoded._id,
       'tokens.token': token,
       'tokens.access':'auth' 
   })
}



// Mongoose middlware  =>> on fait une action avant d'utiliser la fonction save de UserSchema
UserSchema.pre('save',function(next){  // avec les fonctions annomyme, on ne peut pas utliser le this pour recccuperer un element exterieur
    var user = this; // context binding
    // Détecte l'insertion ou une mise à jour d'un nouveau mot de passe
    if(user.isModified('password')){
        // cryptage

        bcrypt.genSalt(10, (err, salt)=> {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        }) 
    }else{
        next();
    }    
    
})

var User = mongoose.model('User',UserSchema);


module.exports = {User}