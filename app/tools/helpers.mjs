import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    bcrypt.hashSync(password, salt);
};