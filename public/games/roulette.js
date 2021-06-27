let username
let socket = io();

$.ajax({
    url: '/pageload',
    success: function (response){
        username = response.username
        userLoaded()
    }
})

function userLoaded(){

    socket.emit('rouletteStart', username)
    socket.on('rouletteStartRes', (balance, allBets)=>{
        $('.balance').text(`Твой баланс - ${balance.toFixed(3)}`)
        for(let i = 0; i<allBets.length; i++){

            $('.list').prepend(`${allBets[i].username} - поставил ${allBets[i].value}, его шансы -<br>`)
            console.log(1)

        }
    })

    $('.bet').click(()=>{

        let betValue = $('.betValue').val();
        socket.emit('doBet', betValue)

    })

    socket.on('doBetRes', (balance, tickets)=>{

        $('.balance').text(`Твой баланс - ${balance.toFixed(3)}`)
        $('.betValue').val = 0;

    })

    socket.on('userBet', (allBets)=>{

        $('.list').empty()
        for(let i = 0;  i< allBets.length; i++){
            $('.list').prepend(`${allBets[i].username} - поставил ${allBets[i].value.toFixed(3)}, его шансы - 
            ${allBets[i].chance*100}%<br>`)
        }


    })

    socket.on('rouletteClear', (winUser, allBetsValue, balance)=>{

        let time = 16

        if (winUser === username){

            $('.balance').text('Твой баланс - ' + balance)

        }
        if(winUser){
            $('.winner').text(`Выйграл ${winUser} и забрал ${allBetsValue}`).toggle(1000)
        }


        let id = setInterval(()=>{

            time -= 1
            $('.time').text(time)


            if(time === 0){
                clearInterval(id)
            }
            if(time === 10 && winUser){
                $('.winner').toggle(1000)
            }

        }, 1000)

        $('.list').empty()


    })

}


