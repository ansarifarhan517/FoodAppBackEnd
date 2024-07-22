export const GenerateOTP = () => {

    const otp = Math.floor(100000 + Math.random() * 900000);
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (5 * 60 * 1000))

    return {
        otp, expiry
    }
}

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    console.log("reachef")
    // const accountSid = 'ACfc5bd669d767ab3e03ab4db13bf8aff6'
    // const authToken = 'c959979261ad384a57fe61b5762cd1ea'

    // const client = require('twilio')(accountSid, authToken)

    // const res = await client.messages.create({
    //     body: `Your Otp is ${otp}`,
    //     from: '+16189348293',
    //     to: `+91${toPhoneNumber}`
    // })
    // return res;
}