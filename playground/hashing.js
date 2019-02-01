const bcrypt = require('bcryptjs');

var password = "abc123";

bcrypt.genSalt(10,(err, salt) => {
    bcrypt.hash(password,salt, (err, hash)=> {
            console.log(hash);

    });
    
    
});

var hashPassword = '$2a$10$hSS/j5cse84NuMZzPcHhH./VKlMJ.mhP0zRm/iHWMEiJp.h2uJrgO'
     bcrypt.compare( password, hashPassword, (err, res) => {
        console.log(res);
    });