const bcrypt = require('bcryptjs');

const plainpassword = '123666'

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hashSync
})