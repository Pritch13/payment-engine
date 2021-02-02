import { Transaction } from '../interfaces/Transaction'

export interface ClientOutput {
    client: string
    available: number
    held: number
    total: number
    locked: boolean
}

export class ClientAccount {

    clientId: string
    total: number = 0
    held: number = 0
    available: number = 0
    locked: boolean = false
    transactions: Array<any> = []

    constructor(transaction: Transaction) {
        this.clientId = transaction.client
    }

    public handleTransaction(transaction: Transaction): void {
        if(transaction.type === 'deposit') {
            this.depositFunds(transaction)
        }

        if(transaction.type === 'withdrawal') {
            this.withdrawFunds(transaction)
        }

        if(transaction.type === 'dispute') {
            this.disputeTransaction(transaction)
        }

        if(transaction.type === 'resolve') {
            this.resolveTransaction(transaction)
        }

        if(transaction.type === 'chargeback') {
            this.chargeback(transaction)
        }
    }

    public formatOutput(): ClientOutput {
        return {
            client: this.clientId,
            available: parseFloat(this.available.toFixed(4)),
            held: this.held,
            total: parseFloat(this.total.toFixed(4)),
            locked: this.locked
        }
    }

    public depositFunds(transaction: Transaction): void {
        const depositedAmount = parseFloat(transaction.amount!)

        this.total = this.total + depositedAmount
        this.transactions.push(transaction)
        this.updateAvailableAmount()
    }

    public withdrawFunds(transaction: Transaction): void {
        const amountToWithDraw = parseFloat(transaction.amount!)

        if(this.total - amountToWithDraw < 0) return

        this.total = this.total - amountToWithDraw
        this.transactions.push(transaction)
        this.updateAvailableAmount()
    }

    public disputeTransaction(transaction: Transaction): void {
        const foundTransactionToDispute = this.transactions.find(trans => trans.tx === transaction.tx)

        if(!foundTransactionToDispute) return

        foundTransactionToDispute.underDispute = true
        this.held = this.held + parseFloat(foundTransactionToDispute.amount)
        this.updateAvailableAmount()
    }

    public resolveTransaction(transaction: Transaction): void {
        const foundTransactionToResolve = this.transactions.find(trans => trans.tx === transaction.tx && trans.underDispute === true)

        if(!foundTransactionToResolve) return

        foundTransactionToResolve.underDispute = false
        this.held = this.held - parseFloat(foundTransactionToResolve.amount)
        this.updateAvailableAmount()
    }

    public chargeback(transaction: Transaction): void {
        const foundTransactionToChargeback = this.transactions.find(trans => trans.tx === transaction.tx && trans.underDispute === true)

        if(!foundTransactionToChargeback) return

        this.locked = true
        this.held = this.held - parseFloat(foundTransactionToChargeback.amount)
        this.total = this.total - parseFloat(foundTransactionToChargeback.amount)
        this.updateAvailableAmount()
    }

    public updateAvailableAmount(): void {
        this.available = this.total - this.held
    }
}