import { Client } from './Client'

describe('Client', ()=> {
    let client: Client
    const firstTransaction = {
        type: 'deposit',
        client: '1',
        tx: '1',
        amount: '5.54'

    }

    beforeEach(() => {
        client = new Client(firstTransaction)
    })

    describe('handleTransaction', () => {
        it('should call handleDeposit()', () => {
            const spy = jest.spyOn(client, 'depositFunds')

            client.handleTransaction(firstTransaction)

            expect(spy).toHaveBeenCalled()
        })

        it('should call withdrawFunds()', () => {
            const spy = jest.spyOn(client, 'withdrawFunds')
            
            client.handleTransaction({...firstTransaction, type: 'withdrawal'})

            expect(spy).toHaveBeenCalled()
        })

        it('should call disputeTransaction()', () => {
            const spy = jest.spyOn(client, 'disputeTransaction')
            
            client.handleTransaction({...firstTransaction, type: 'dispute'})

            expect(spy).toHaveBeenCalled()
        })

        it('should call resolveTransaction()', () => {
            const spy = jest.spyOn(client, 'resolveTransaction')
            
            client.handleTransaction({...firstTransaction, type: 'resolve'})

            expect(spy).toHaveBeenCalled()
        })

        it('should call chargeback()', () => {
            const spy = jest.spyOn(client, 'chargeback')
            
            client.handleTransaction({...firstTransaction, type: 'chargeback'})

            expect(spy).toHaveBeenCalled()
        })
    })

    describe('depositFunds', () => {
        it('should deposit funds, update total and available amount, save the transaction', () => {
            client.total = 1.64

            const newTransaction = {
                type: 'deposit',
                client: '1',
                tx: '2',
                amount: '1.95'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.depositFunds(newTransaction)

            expect(spy).toHaveBeenCalled()
            expect(client.total).toBe(3.59)
            expect(client.transactions).toContain(newTransaction)
        })
    })

    describe('withdrawFunds', () => {
        it('should withdraw funds, update total and available amount, save the transaction', () => {
            client.total = 8.23

            const newTransaction = {
                type: 'withdrawawl',
                client: '1',
                tx: '3',
                amount: '2.32'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.withdrawFunds(newTransaction)

            expect(spy).toHaveBeenCalled()
            expect(client.total).toBe(5.91)
            expect(client.transactions).toContain(newTransaction)
        })
    })

    describe('disputeTransaction', () => {
        it('should do nothing as the tx does not exist within the clients transactions', () => {
            const falseDispute = {
                type: 'dispute',
                client: '1',
                tx: '12'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.disputeTransaction(falseDispute)

            expect(spy).not.toHaveBeenCalled()
        })
        
        it('should hold the disputed funds, update available amount. and put the transaction under dispute', () => {
            const newTransaction =  {
                type: 'withdrawawl',
                client: '1',
                tx: '4',
                amount: '5'
            }
            const transactionDispute: any = {
                type: 'dispute',
                client: '1',
                tx: '4'
            }
            client.total = 10
            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.depositFunds(newTransaction)
            client.disputeTransaction(transactionDispute)

            expect(spy).toHaveBeenCalled()
            expect(client.transactions[0].underDispute).toBeTruthy()
            expect(client.held).toEqual(parseFloat(newTransaction.amount))
        })
    })

    describe('resolveTransaction', () => {
        it('should do nothing as the tx does not exist within the clients transactions', () => {
            const falseResolve = {
                type: 'resolve',
                client: '1',
                tx: '12'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.resolveTransaction(falseResolve)

            expect(spy).not.toHaveBeenCalled()
        })

        it('should do nothing as the tx was not under dispute', () => {
            client.transactions = [{         
                type: 'withdrawawl',
                client: '1',
                tx: '4',
                amount: '5'}]
            const falseResolve = {
                type: 'resolve',
                client: '1',
                tx: '4'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.resolveTransaction(falseResolve)

            expect(spy).not.toHaveBeenCalled()
        })

        it('should set the transaction to no longer be disputed, and update the held/available amoumnts', () =>{
            client.held = 5
            client.transactions = [{         
                type: 'deposit',
                client: '1',
                tx: '4',
                amount: '5',
                underDispute: true
            }]
            const resolveTransaction = {
                type: 'resolve',
                client: '1',
                tx: '4'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.resolveTransaction(resolveTransaction)

            expect(spy).toHaveBeenCalled()
            expect(client.transactions[0].underDispute).toBeFalsy()
            expect(client.held).toEqual(0)

        })
    })

    describe('chargeback', () => {
        it('should do nothing as the tx does not exist', () => {
            const falseChargeback = {
                type: 'chargeback',
                client: '1',
                tx: '12'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.chargeback(falseChargeback)

            expect(spy).not.toHaveBeenCalled()
        })

        it('should do nothing as the tx was not under dispute', () => {
            client.transactions = [{         
                type: 'withdrawawl',
                client: '1',
                tx: '4',
                amount: '5'}]
            const chargeback = {
                type: 'chargeback',
                client: '1',
                tx: '4'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.chargeback(chargeback)

            expect(spy).not.toHaveBeenCalled()
        })

        it('should lock the account, remove the held funds, and update the total/available amount', () => {
            client.total = 5
            client.held = 5
            client.transactions = [{         
                type: 'withdrawal',
                client: '1',
                tx: '4',
                amount: '5',
                underDispute: true
            }]
            const chargeback = {
                type: 'chargeback',
                client: '1',
                tx: '4'
            }

            const spy = jest.spyOn(client, 'updateAvailableAmount')

            client.chargeback(chargeback)

            expect(spy).toHaveBeenCalled()
            expect(client.locked).toBeTruthy()
            expect(client.held).toBe(0)
            expect(client.total).toBe(0)
        })
    })

    describe('updateAvailableAmount', () => {
        it('should update the available amount', () => {
            client.total = 100
            client.held = 50

            client.updateAvailableAmount()

            expect(client.available).toBe(50)
        })
    })

    describe('formatOutput', () => {
        it('should return a formatted output object', () => {
            const expected = {
                client: '1',
                available: 50,
                held: 0,
                total: 50,
                locked: false
            }

            client.available = 50
            client.held = 0
            client.total = 50

            expect(client.formatOutput()).toEqual(expected)
        })
    })

})