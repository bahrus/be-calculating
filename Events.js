export const rguid = 'XM5dz7tqZkeFCtytNXHPzw';
export class CalcEvent extends Event {
    static eventName = 'calculate';
    /** @type {any} */
    r = rguid;
    /** @type {Array<any>} */
    args;
    /** 
     * Event view model
     * @type {{[key: string]: any}} 
    */
    evm;
    /**
     * 
     * @param {Array<any>} args 
     * @param {{[key: string]: any}} evm 
     */
    constructor(args, evm){
        super(CalcEvent.eventName);
        this.args = args;
        this.evm = evm;
    }
}