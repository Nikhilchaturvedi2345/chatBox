import UserModel from '../model/userModel.js'
let data = UserModel.getAllPersons()
export default function buildmsg(message) {
    {
     return {
        message : message,
        date : new Date().getTime()
     }   
    }
}