function encrypt(message, recipient, expirationInSecs){
    let plainMessage = message.split("").map((char) => char.charCodeAt(0))
    let plainRecipient = recipient.split("").map((char) => char.charCodeAt(0))
    let plainExpiration = expirationInSecs.toString().split("").map((char) => char.charCodeAt(0))


    let shiftProducts = {
        message: [],
        recipient: [],
        expiration: []
    }

    let shiftRemainders = {
        message: [],
        recipient: [],
        expiration: []
    }

    /*

        72 >> 5 = 2
        2 << 5 = 64

        shiftProducts = 2
        shiftRemainders = 8


    */

    console.log(plainMessage, plainRecipient, plainExpiration)
    return [shiftProducts, shiftRemainders]
}


function decrypt(encryptedBody, key, currentTimeMs){
    console.log('decrypting message')
}
