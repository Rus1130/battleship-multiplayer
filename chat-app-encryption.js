function toBase100(number){
    let base100 = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+{}|"<>?[];\',./`~¡¹²³£¢¬¥§µ×÷'
    let result = ''

    while(number > 0){
        result += base100[number % 100]
        number = Math.floor(number / 100)
    }

    if(result.length == 0) result = '0'

    return result
}

function fromBase100(string){
    let base100 = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+{}|"<>?[];\',./`~¡¹²³£¢¬¥§µ×÷'
    let result = 0

    for(let i = 0; i < string.length; i++){
        result += base100.indexOf(string[i]) * Math.pow(100, i)
    }

    return result
}



function encrypt(message, recipient, expirationInSecs){

}


function decrypt(body, decrypter, currentTimeMs){

}
