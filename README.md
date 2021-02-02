# payment-engine

Get started:
    `npm i` to install required packages

Run program:
    `cd src` then `ts-node payment-transactions.ts + "path to csv file"` to run 

Run test:
    `cd src` then `npm test Client.spec.ts` to run test suite

Edge cases/questions/comments: 

    What happens if you deposit 5, withdraw 5, dispute your deposit and then chargback the deposit? - now your total is -5
    Should you be able to dispute deposits?
    Should you be able to chargeback deposits?
    How do you unlock your account?
    Can you still file a dispute if your account is locked?
    Can you still resolve disputes if your account is locked?
    Can you chargeback with a locked account?