$('.gamesMenu').click((e)=>{
    let clickText = $(e.target).text().replace(/\s+/g, '')
    console.log(clickText)
    switch (clickText){
        case 'РУЛЕТКА':
            window.location.href = '/roulette';
            break;
        case 'КОИНФЛИП':
            window.location.href = '/coin';
            break;
        case 'ДАБЛ':
            window.location.href = '/double';
            break;
    }
})