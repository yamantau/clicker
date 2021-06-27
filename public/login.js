let durat = 400;
$('.regLogo').click(()=>{
    $('.login').hide(durat);
    $('.reg').show(durat);
    $('.authLogo').animate({
        color: 'black'
    },durat)
    $('.regLogo').animate({
        color: 'rgb(122, 217, 183)'
    },durat)
})
$('.authLogo').click(()=>{
    $('.reg').hide(durat);
    $('.login').show(durat);
    $('.regLogo').animate({
        color: 'black'
    },durat)
    $('.authLogo').animate({
        color: 'rgb(122, 217, 183)'
    },durat)
})