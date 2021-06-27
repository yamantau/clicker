$(document).ready(()=> {

    let socket = io();
    let user = 'Инкогнито';

    $.ajax({
        url: '/pageload',
        success: function (response) {
            user = response.username
            gameStart()
            }
    })

    $('body').show()
    $('.burger').on('click', () => {
        $('span').toggleClass('active');
        $('.menu').toggleClass('clck');
    })


    //buttons
    $('.names').click((e)=>{
        let clickClass = $(e.target).text().replace(/\s+/g, '')
        console.log(clickClass)
        switch(clickClass){
            case 'Чат':
                window.location.href = '/messenger';
                break;
            case 'Игры':
                window.location.href = '/games';
                break;
            case 'Профиль':
                window.location.href = '/profile';
                break;
        }
    })

    //game
    let winHeight = $(window).height();
    let winWidth = $(window).width();

    $('html').css({
        "touch-action": "pan-down"
    });

    if (winWidth < 1000){
        $('.mainButton').css({
            height: 0.8 * winWidth,
            width: 0.8 * winWidth,
            bottom: -0.8 * winWidth / 2,
            left: (winWidth - 0.8 * winWidth) / 2
        })
        $('.helpButton').css({
            height: 0.7 * winWidth,
            width: 0.7 * winWidth,
            bottom: -0.7 * winWidth / 2,
            left: (winWidth - 0.7 * winWidth) / 2
        })
    } else {
        $('.mainButton').css({
            height: 0.25 * winWidth,
            width: 0.25 * winWidth,
            bottom: -0.25 * winWidth / 2,
            left: (winWidth - 0.25 * winWidth) / 2
        })
        $('.helpButton').css({
            height: 0.2 * winWidth,
            width: 0.2 * winWidth,
            bottom: -0.2 * winWidth / 2,
            left: (winWidth - 0.2 * winWidth) / 2
        })
    }


    $('.advert').css({height: 0.15 * winHeight})
    $('.helper').css({
        width: winWidth,
        height: winHeight
    })
    $('.autoIncomeCells').css({
        top: winHeight
    })

    $('.autoIncomeLogoName').click(() => {
        $('.autoIncomeLogoArrow').toggleClass('rotate');


        if(parseInt($('.autoIncomeCells').css('top')) >= winHeight){
            $('.autoIncomeCells').toggle().animate({
                top: winHeight - $('.autoIncomeCells').height()
            })
            $('.helper').fadeIn(400)
        } else {
            $('.autoIncomeCells').animate({
                top: winHeight
            }, ()=>{
                $('.autoIncomeCells').toggle()
            })
            $('.helper').fadeOut(400)
        }

        let posY;
        $('.autoIncomeCells').draggable({
            axis: 'y',
            containment: [winWidth - $('.autoIncomeCells').width(),winHeight - $('.autoIncomeCells').height(),winWidth, winHeight],
            start: (e)=>{
                posY = e.clientY
            },
            stop: (e)=>{
                if (Math.abs(posY - e.clientY) > 150){
                    $('.autoIncomeLogoArrow').toggleClass('rotate');
                    $('.autoIncomeCells').draggable('destroy')
                        .animate({
                        top: winHeight
                    }, 400,()=>{
                        $('.autoIncomeCells').toggle()
                    })
                    $('.helper').fadeOut(400)
                } else {
                    $('.autoIncomeCells').animate({
                        top: winHeight - $('.autoIncomeCells').height()
                    })
                    $('.helper').fadeIn(400)
                }
            }
        });

    })

    //



    //mechanic

    $('.mainButton').click(() => {
        socket.emit('clickBalance')
    })


    function gameStart(){

        socket.emit('loadingGame', user)

        /*game load*/

        socket.on('loadingGameRes', (balance, cursorLvl, videoLvl,
            videoCellsLvl)=>{

            balance = balance.toFixed(3)
            let sum = (cursorLvl*0.001 + videoLvl*0.003 + videoCellsLvl*0.01).toFixed(3)
            let curCost = (0.03*2.2**cursorLvl).toFixed(3)
            let videoCost = (0.1*2.2**videoLvl).toFixed(3)
            let cellsCost = (2.2**videoCellsLvl).toFixed(3)

            $('.userBalanceCount').text(balance)
            $('.autoIncomeInfo').text(sum + '/sec')
            $('.cursor').children('.cellCost').text( `Купить за ${curCost}`)
            $('.graphicsCard').children('.cellCost').text( `Купить за ${videoCost}`)
            $('.graphicsCardRack').children('.cellCost').text( `Купить за ${cellsCost}`)

            })

        /*balance save*/
        socket.on('balanceSave', balance=>{
            balance = balance.toFixed(3)
            $('.userBalanceCount').text(balance)
        })

        /*auto click cells*/

        $('.cursor').children('.cellCost').click(()=>{
            socket.emit('cursorLvlUp')
        })
        $('.graphicsCard').children('.cellCost').click(()=>{
            socket.emit('graphicsCardLvlUp')
        })
        $('.graphicsCardRack').children('.cellCost').click(()=>{
            socket.emit('rackLvlUp')
        })

        socket.on('cursorLvlUpRes', (lvl, sum)=>{
            let nextCost = (0.03*2.2**lvl).toFixed(3)
            $('.autoIncomeInfo').text(sum.toFixed(3) + '/sec')
            $('.cursor').children('.cellCost').text( `Купить за ${nextCost}`)
        })
        socket.on('graphicsCardLvlUpRes', (lvl, sum)=>{
            let nextCost = (0.1*2.2**lvl).toFixed(3)
            $('.autoIncomeInfo').text(sum.toFixed(3) + '/sec')
            $('.graphicsCard').children('.cellCost').text( `Купить за ${nextCost}`)
        })
        socket.on('rackLvlUpRes', (lvl, sum)=>{
            let nextCost = (2.2**lvl).toFixed(3)
            $('.autoIncomeInfo').text(sum.toFixed(3) + '/sec')
            $('.graphicsCardRack').children('.cellCost').text( `Купить за ${nextCost}`)
        })
    }
})
