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
    f;
    /**
     * 
     * @param {Array<any>} args 
     * @param {{[key: string]: any}} f 
     */
    constructor(args, f){
        super(CalcEvent.eventName);
        this.args = args;
        this.f = f;
    }
}