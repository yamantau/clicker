const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const users = require('./db')

/*const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    balance: "Number",
    cursorLvl: "Number",
    videoLvl: "Number",
    videoCellsLvl: "Number"
})
const users = mongoose.model('users', userSchema)
module.exports = users;
module.exports = mongoose.model('users', userSchema);*/

class authController{

    async registration(req, res, next){

        try {

            const {usernameReg, passwordReg, rePasswordReg} = req.body;
            if (usernameReg != '' && passwordReg!=''){
                let candidate = await users.findOne({username: usernameReg});
                if(!candidate ){
                    if (passwordReg == rePasswordReg){

                        const hashPassword = bcrypt.hashSync(passwordReg, 7);

                        const user = new users({
                            username: usernameReg,
                            password: hashPassword,
                            balance: 0,
                            cursorLvl: 0,
                            videoLvl: 0,
                            videoCellsLvl: 0,
                            role: 'user'
                        })

                        await user.save();
                        req.session.authorized = true;
                        req.session.username = usernameReg;
                        req.session.save();
                        res.redirect('/menu')
                        next()

                    } else {
                        res.json({message: 'Пароли не совпадают'})
                    }

                } else {
                    res.json({message: 'Логин уже занят'})
                }

            }else{
                res.json({message: 'Неправильный ввод данных'})
            }

        } catch (e){
            console.log(e)
        }

    }

    async login(req, res, next){

        const {usernameLogin, passwordLogin} = req.body;
        if (usernameLogin != '' && passwordLogin!='') {
            const candidate = await users.findOne({username: usernameLogin});
            if (candidate) {
                let isPassValid = bcrypt.compareSync(passwordLogin, candidate.password);
                if(isPassValid){

                    req.session.authorized = true;
                    req.session.username = usernameLogin;
                    req.session.save();
                    res.redirect('/menu')
                    next()

                } else {
                    res.json({message: 'Пароль неверный'})
                }
            } else {
                res.json({message: 'Такого пользователя не существует'})
            }
        } else {
            res.json({message: 'Некоректные данные'})
        }

    }

}

module.exports = new authController();