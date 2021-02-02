export interface Transaction {
    type: string
    client: string
    tx: string
    amount?: string
    underDispute? : boolean
}