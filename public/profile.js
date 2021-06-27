let user;

$.ajax({
    url: '/pageload',
    success: function (response) {
        user = response.username
        $('.status').text('Нажмите, чтобы разлогиниться, ' + user)
        if(user){
            $('.status').click(function () {
                $.ajax({
                    url: '/logout',
                    success: function () {
                        location.reload()
                    }
                })
            })
            console.log(user)
        } else {
            $('.status')
                .text('Вы не авторизованы, войти')
                .click(()=>{
                    window.location.href = "/login.html"
                })
            console.log(123)
        }
    }
})





