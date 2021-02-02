import jsonexport from "jsonexport/dist"
import csv from 'csvtojson'
const csvFilePath = '../example-input.csv'

import { Client, ClientOutput } from './Client/Client'
import { Transaction} from './interfaces/Transaction'

let clients: Array<Client> = []

function getClient(transaction: Transaction) {
    const foundClient = clients.find(client => client.clientId === transaction.client)
    if(foundClient) return foundClient

    const newClient =  new Client(transaction)
    clients.push(newClient)
    return newClient
}

function getClientOutputList(): Array<ClientOutput>{
    return clients.map(client => client.formatOutput())
}

csv()
.fromFile(csvFilePath)
.then((transactions)=> {
    transactions.forEach(transaction => {
        const client = getClient(transaction)
    
        client.handleTransaction(transaction)
    })     

    const clientOutputList = getClientOutputList()

    jsonexport(clientOutputList, function(err, csv){
        if (err) return console.error(err)

        console.log(csv)
    })   
})


// What happens if you deposit 5, withdraw 5, dispute your deposit and then chargback the deposit? - now your total is -5
// Should you be able to dispute deposits?
// Should you be able to chargeback deposits?
// How do you unlock your account?
// Can you still file a dispute if your account is locked?
// Can you still resolve disputes if your account is locked?
// Can you chargeback with a locked account?


//todo - fix decimals to 4 places
//     - allow csv file as arg