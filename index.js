const express = require('express');
const authController = require('./authcontrol');
const users = require('./db')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)
let port = process.env.PORT || 8080;

// json + html + css

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

// Сесии + подключение к базе данных

async function start(){
    try {
        const db = await mongoose.connect(`mongodb+srv://user:userPass@cluster0.dig6l.mongodb.net/Clicker?retryWrites=true&w=majority`,
            { useNewUrlParser: true });
    }catch (e) {
        console.log(e);
    }
}
start()

app.use( session({
        secret: 'yoy',
        cookie: {
            maxAge: 2 * 7 * 24 * 60 * 60 * 1000
        },
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: `mongodb+srv://user:userPass@cluster0.dig6l.mongodb.net/Clicker?retryWrites=true&w=majority`})
    })
)
let username;
app.get('/menu', (req, res) => {

    res.sendFile(__dirname + '/public/main.html')
    username = req.session.username
})
app.get('/messenger', (req, res) => {
    if (username){
        res.sendFile(__dirname + '/public/auth.html')
    } else {
        res.json({hui: 'idi nahui'})
    }
})
app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/public/profile.html')
})
app.get('/roulette', (req, res) => {
    res.sendFile(__dirname + '/public/games/roulette.html')
})
app.get('/games', (req, res) => {
    res.sendFile(__dirname + '/public/games/games.html')
})

app.use('/home', (req, res, next) => {
    console.log(req.session)
    next()
})

app.get('/pageload', (req, res) => {
    res.json({username: req.session.username})
})

    // Прерывание сессии
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.end()
})

const mesSchema = new mongoose.Schema({
    mes: String,
    username: String,
    hours: Number,
    minutes: Number
})
const messages = new mongoose.model('messages', mesSchema)

app.post('/getMesToArray', (req, res) => {
    abc();
    async function abc(){
        let allMes = await messages.find();
        res.json(allMes);
    }

})
app.post('/reg', authController.registration)
app.post('/login',authController.login)


startRole()
let allTime = 15000
let betTime = 7000
let statusRole = 'time'

function startRole(){

    let id = setInterval(roleRulett, 100)

    function roleRulett(){
        if(allTime>0){
            allTime -= 100;
        }else{
            statusRole = 'rolling';
            clearInterval(id);
            let tp = setInterval(()=>{
                if(betTime > 0){
                    betTime -= 100;
                } else {
                    allTime = 15000
                    betTime = 7000
                    statusRole = 'time'
                    clearInterval(tp);
                    startRole()
                }
            }, 100)
        }

    }
}



let i = 0;

io.on('connection', (socket)=>{

    i++;
    io.emit('countUsers', i)
    socket.on('disconnect', ()=>{
        i--;
        io.emit('countUsers', i);
    })

    socket.on('getTime', ()=>{
        socket.emit('postTime', statusRole, allTime, betTime)
    })

    socket.on('sendMess', (msg, name, ch, min)=>{
        abc();
        async function abc(){
            const lastMess = new messages({
                mes: msg,
                username: name,
                hours: ch,
                minutes: min
            })
            await lastMess.save();
        }
        io.emit('getMes', msg, name, ch, min)
    })
})

//game mechanic
io.on('connection', (socket)=>{

    let user;
    let balance = 0;
    let cursorLvl = 0;
    let videoLvl = 0;
    let videoCellsLvl = 0;
    let sumAuto = 0;


    /*loading game*/
    socket.on('loadingGame', (currentUser)=>{

        if(currentUser){

            user = currentUser;

            async function balanceCheckFunc(){

                let candidate = await users.findOne({username: user});
                balance = candidate.balance;
                cursorLvl = candidate.cursorLvl;
                videoLvl = candidate.videoLvl;
                videoCellsLvl = candidate.videoCellsLvl;
                sumAuto = cursorLvl*0.001 + videoLvl*0.003 + videoCellsLvl*0.01
                incomeAuto()

            }
            function abc(){

                socket.emit('loadingGameRes', balance, cursorLvl,
                    videoLvl, videoCellsLvl)

            }

            balanceCheckFunc().then(abc)

        }

    })

    /*game balance save when user is clicking*/
    socket.on('clickBalance', ()=>{

        balance += 0.001
        socket.emit('balanceSave', balance)

    })

    /*auto click cell lvl up*/
    socket.on('cursorLvlUp', ()=>{

        if(balance - 0.030*2.2**cursorLvl >= 0){

            balance -= 0.030*2.2**cursorLvl
            cursorLvl++
            sumAuto += 0.001
            socket.emit('cursorLvlUpRes', cursorLvl, sumAuto)
            socket.emit('balanceSave', balance)

        }

    })

    socket.on('graphicsCardLvlUp', ()=>{

        if(balance - 0.1*2.2**videoLvl >= 0){

            balance -= 0.1*2.2**videoLvl
            videoLvl++
            sumAuto += 0.003
            socket.emit('graphicsCardLvlUpRes', videoLvl, sumAuto)
            socket.emit('balanceSave', balance)

        }

    })

    socket.on('rackLvlUp', ()=>{

        if(balance - 2.2**videoCellsLvl >= 0){

            balance -= 2.2**videoCellsLvl
            videoCellsLvl++
            sumAuto += 0.01
            socket.emit('rackLvlUpRes', videoCellsLvl, sumAuto)
            socket.emit('balanceSave', balance)

        }

    })

    /*income for each user func*/
    function incomeAuto(){

        setInterval(()=>{

            balance = Number(balance) + sumAuto
            socket.emit('balanceSave', balance)

        }, 1000)
    }

    /*save game when user is going out*/
    socket.on('disconnect', ()=>{

        async function balanceSave(){

            await users.updateOne({username: user}, {
                balance: balance,
                cursorLvl: cursorLvl,
                videoLvl: videoLvl,
                videoCellsLvl: videoCellsLvl
            })

        }

        balanceSave()

    })

})

//roulette
let allBets = [];
let time = 15;
let lastTicket = 0;
let allTickets = [];
let allBetsValue = 0;
let winBalance
setInterval(()=>{

    time -= 1

    if (time === -1){

        let winNumber = Math.floor(Math.random() * lastTicket)
        let winUser = allTickets[winNumber]


        async function balanceSave(){

            if (winUser){

                let candidate = await users.findOne({username: winUser});
                winBalance = candidate.balance;

                winBalance += allBetsValue

                await users.updateOne({username: winUser}, {
                    balance: winBalance
                })

            }

        }

        balanceSave().then(abc)

        function abc(){

            io.emit('rouletteClear', winUser, allBetsValue, winBalance)
            allBets.length = 0
            lastTicket = 0
            allTickets.length = 0
            time = 15
            allBetsValue = 0
            winBalance = 0

        }

    }

}, 1000)

io.on('connection', (socket)=>{
    let balance = 0;
    let user;

    socket.on('rouletteStart', (username)=>{
        user = username;

        async function balanceCheckFunc(){
            let candidate = await users.findOne({username: user});
            balance = candidate.balance;

        }
        function abc(){

            socket.emit('rouletteStartRes', balance, allBets)

        }

        balanceCheckFunc().then(abc)

    })

    socket.on('doBet', (betValue)=>{

        betValue = Number(betValue)
        let chance;
        async function balanceCheckFunc(){
            let candidate = await users.findOne({username: user});
            balance = candidate.balance;

        }
        balanceCheckFunc().then(asd)

        function asd(){

            if(balance - betValue >= 0 && betValue >= 1){

                balance -= betValue
                allBetsValue += betValue
                let backBorder = lastTicket + betValue

                for (; lastTicket < backBorder; lastTicket++){
                    allTickets[lastTicket] = user;
                }

                let i = allBets.findIndex((value)=>{

                    return value.username === user

                })

                if (i > -1){
                    allBets[i].value += betValue
                } else {
                    allBets.push({
                        username: user,
                        value: betValue
                    })
                }

                for (let i = 0; i < allBets.length; i++){
                    allBets[i].chance = (allBets[i].value/allBetsValue).toFixed(3)
                }



                async function balanceSave(){

                    await users.updateOne({username: user}, {
                        balance: balance
                    })


                }

                balanceSave().then(abc)

                function abc(){

                    socket.emit('doBetRes', balance)
                    io.emit('userBet', allBets)

                }

            }

        }



    })

})


http.listen(port, ()=>{
    console.log(`App is listening at ${port} port`)
})
