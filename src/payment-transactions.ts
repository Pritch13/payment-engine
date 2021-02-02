import jsonexport from "jsonexport/dist"
import csv from 'csvtojson'
import { ClientAccount, ClientOutput } from './ClientAccount/ClientAccount'
import { Transaction} from './interfaces/Transaction'

const args = process.argv.slice(2)
const csvFilePath = args[0]

let clients: Array<ClientAccount> = []

function getClient(transaction: Transaction) {
    const foundClient = clients.find(client => client.clientId === transaction.client)
    if(foundClient) return foundClient

    const newClient =  new ClientAccount(transaction)
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
