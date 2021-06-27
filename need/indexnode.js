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
                incomeAuto()
            }
            function abc(){
                socket.emit('loadingGameRes', balance)
            }
            balanceCheckFunc().then(abc)
        } else {

        }

    })

    /*game balance save*/

    socket.on('clickBalance', ()=>{

        async function balanceSave(){
            let candidate = await users.findOne({username: user});
            balance = (candidate.balance + 0.001).toFixed(3);
            await users.updateOne({username: user}, {
                balance: balance
            })
        }
        function abc(){
            io.emit('balanceSaved', balance, summAuto)
        }
        balanceSave().then(abc);

    })

    /*auto click cell lvl up*/

    socket.on('cursorLvlUp', ()=>{

        if(balance - 0.030*1.15**cursorLvl >= 0){

            function abc(){
                balance -= 0.030*1.15**cursorLvl
                cursorLvl++
            }

            async function upLvl(){
                await users.updateOne({username: user}, {
                    balance: balance,
                    cursorLvl: cursorLvl
                })
            }

            function abc2(){
                socket.emit('lvlUpdateRes', cursorLvl)
            }

            abc()
            upLvl().then(abc2)
        }

    })

    function incomeAuto(){
        socket.emit('lvlUpdateRes', cursorLvl)
        setInterval(()=>{

            summAuto = cursorLvl*0.001 + videoLvl*0.003 + videoCellsLvl*0.1
            balance = Number(balance) + summAuto

            async function balanceAfterAutoSave(){
                await users.updateOne({username: user}, {
                    balance: balance
                })
                console.log(balance)
            }
            balanceAfterAutoSave()
            io.emit('balanceSaved', balance, summAuto)

        }, 1000)
    }
})



io.on('connection', (socket)=>{

    let user = [];

    /*loading game*/
    socket.on('loadingGame', (username)=>{

        let balance;
        let cursorLvl;

        async function balanceCheckFunc() {

            let candidate = await users.findOne({username: username});
            balance = candidate.balance
            cursorLvl = candidate.cursorLvl
            user.push({
                username: username,
                balance: balance,
                cursorLvl: cursorLvl,
                id: socket.id
            })
            console.log(user)
            console.log('end')
            socket.emit('lvlUpdateRes', cursorLvl)
            incomeAuto()

        }

        function abc() {
            socket.emit('loadingGameRes', balance)
            socket.emit('autoIncomeValue', cursorLvl)
        }

        balanceCheckFunc().then(abc)

    })

    /*game balance save when user is clicking*/
    socket.on('clickBalance', (currentUser)=>{

        let i = user.findIndex((value)=>{
            return value.username == currentUser
        })
        user[i].balance += 0.001

        socket.emit('balanceSaved', user[i].balance)

    })

    /*income for each user func*/
    function incomeAuto(){

        setInterval(()=>{

            user.forEach((value)=>{

                let sumAuto = 0.001*value.cursorLvl
                value.balance += sumAuto

                socket.emit('balanceSaved', value.balance, sumAuto)

            })
        }, 1000)
    }

    /*auto click cell lvl up*/
    socket.on('cursorLvlUp', (currentUser)=>{

        let i = user.findIndex((value)=>{
            return value.username == currentUser
        })

        if(user[i].balance - 0.030*1.15**user[i].cursorLvl >= 0){

            user[i].balance -= 0.030*1.15**user[i].cursorLvl
            user[i].cursorLvl++

            socket.emit('lvlUpdateRes', user[i].cursorLvl)
            socket.emit('autoIncomeValue', user[i].cursorLvl)

        }
    })

    /*save game when user is going out*/
    socket.on('disconnect', ()=>{

        let i = user.findIndex((value)=>{
            return value.id == socket.id
        })

        async function gameSave() {

            await users.updateOne({username: user[i].username}, {
                balance: user[i].balance,
                cursorLvl: user[i].cursorLvl
            })

        }
        function arrSplice(){
            user.splice(i)
        }

        gameSave().then(arrSplice)

    })
})

//mechanic

function gameStart(){

    /*game load*/

    socket.emit('loadingGame', user)
    socket.on('loadingGameRes', (balance)=>{
        balance = balance.toFixed(3)
        $('.userBalanceCount').text(balance)
    })
    socket.on('autoIncomeValue', (value)=>{
        let sum = value*0.001
        $('.autoIncomeInfo').text(sum.toFixed(3) + '/sec')
    })

    /*balance save on click*/

    $('.mainButton').click(() => {
        socket.emit('clickBalance', user)
    })
    socket.on('balanceSaved', (balance)=>{
        $('.userBalanceCount').text(Number(balance).toFixed(3))
    })

    /*auto income value*/



    /*auto click cells*/

    $('.cursor').children('.cellCost').click(()=>{
        socket.emit('cursorLvlUp', user)
    })
    socket.on('lvlUpdateRes', (cur)=>{
        let nextCost = (0.03*1.15**cur).toFixed(3)
        $('.cursor').children('.cellCost').text( `Купить за ${nextCost}`)
    })

    $('.graphicsCard').children('.cellCost').click(()=>{
        socket.emit('graphicsCardLvlUp')
    })
    $('.graphicsCardRack').children('.cellCost').click(()=>{
        socket.emit('rackLvlUp')
    })

}