const mongoose = require('mongoose');

// on fait en sorte que mangoose et node utilisent la même version de l'interface promise
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/TodoApp', {
    useNewUrlParser:true
});
// mongoose.set('useNewUrlParser',true);
mongoose.set('useFindAndModify',false);
mongoose.set('useCreateIndex',true);

module.exports = {
    mongoose
}