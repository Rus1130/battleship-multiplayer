function encrypt(message, recipient, expirationInSecs){
    expirationInSecs = Date.now() + (expirationInSecs * 1000)
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

    let randomAdditions = {
        message: [],
        recipient: [],
        expiration: []
    }

    let minRand = 160
    let maxRand = 200

    for(i = 0; i < plainMessage.length; i++){
        let randomAddition = Math.floor(Math.random() * (maxRand - minRand + 1) + minRand);
        plainMessage[i] = plainMessage[i] + randomAddition

        randomAdditions.message.push(randomAddition)
        shiftProducts.message.push(plainMessage[i] >> 5)
        shiftRemainders.message.push(plainMessage[i] - ((plainMessage[i] >> 5) << 5))
    }

    for(i = 0; i < plainRecipient.length; i++){
        let randomAddition = Math.floor(Math.random() * (maxRand - minRand + 1) + minRand);
        plainRecipient[i] = plainRecipient[i] + randomAddition
        
        randomAdditions.recipient.push(randomAddition)
        shiftProducts.recipient.push(plainRecipient[i] >> 5)
        shiftRemainders.recipient.push(plainRecipient[i] - ((plainRecipient[i] >> 5) << 5))
    }

    for(i = 0; i < plainExpiration.length; i++){
        let randomAddition = Math.floor(Math.random() * (maxRand - minRand + 1) + minRand);
        plainExpiration[i] = plainExpiration[i] + randomAddition

        randomAdditions.expiration.push(randomAddition)
        shiftProducts.expiration.push(plainExpiration[i] >> 5)
        shiftRemainders.expiration.push(plainExpiration[i] - ((plainExpiration[i] >> 5) << 5))
    }

    shiftRemainders.expiration = shiftRemainders.expiration.map(num => num.toString(36))
    shiftRemainders.message = shiftRemainders.message.map(num => num.toString(36))
    shiftRemainders.recipient = shiftRemainders.recipient.map(num => num.toString(36))

    randomAdditions.expiration = randomAdditions.expiration.map(num => String.fromCharCode(num))
    randomAdditions.message = randomAdditions.message.map(num => String.fromCharCode(num))
    randomAdditions.recipient = randomAdditions.recipient.map(num => String.fromCharCode(num))

    shiftProducts.expiration = shiftProducts.expiration.join("")
    shiftProducts.message = shiftProducts.message.join("")
    shiftProducts.recipient = shiftProducts.recipient.join("")

    shiftRemainders.expiration = shiftRemainders.expiration.join("")
    shiftRemainders.message = shiftRemainders.message.join("")
    shiftRemainders.recipient = shiftRemainders.recipient.join("")

    randomAdditions.expiration = randomAdditions.expiration.join("")
    randomAdditions.message = randomAdditions.message.join("")
    randomAdditions.recipient = randomAdditions.recipient.join("")

    let lengths = [
        shiftProducts.message.length.toString(36),
        shiftProducts.recipient.length.toString(36),
        shiftProducts.expiration.length.toString(36)
    ]

    lengths = lengths.join("-")

    let finalShiftProducts = Object.values(shiftProducts).join("")
    let finalShiftRemainders = Object.values(shiftRemainders).join("")
    let finalRandomAdditions = Object.values(randomAdditions).join("")

    let result = `${lengths}:${finalShiftProducts}${finalShiftRemainders}${finalRandomAdditions}`

    /*

    decode:
    ((shiftProduct << 5) - randomAddition) + shiftRemainder


    */

    console.log(shiftProducts, shiftRemainders, randomAdditions)
    console.log(plainMessage, plainRecipient, plainExpiration)
    return result;
}


function decrypt(body, sender){
    let currentTime = Date.now()
    let [lengths, encryptedMessage] = body.split(":")

    let sectorLength = lengths.split("-").map(num => parseInt(num, 36))

    let sectors = encryptedMessage.match(new RegExp(`.{1,${sectorLength.reduce((a, b) => a + b, 0)}}`, "g"))

    lengths = lengths.split("-").map(num => parseInt(num, 36))

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

    let randomAdditions = {
        message: [],
        recipient: [],
        expiration: []
    }
    
    // for each index in sectors, insert a character at the lengths[0], lengths[1], and lengths[2] indexes
    
    for(i = 0; i < sectors.length; i++){
        sectors[i] = sectors[i].match(new RegExp(`.{1,${lengths[0]}}`, "g"))
    }

    sectors[0][1] = sectors[0][1].concat(sectors[0][2])
    sectors[0].splice(2, 1)



    
    console.log(lengths)
    console.log(sectors)
    return {shiftProducts: shiftProducts, shiftRemainders: shiftRemainders, randomAdditions: randomAdditions}
}
