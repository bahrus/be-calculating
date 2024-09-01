export class Calculator {
    handleEvent(e){
        e.target.value = e.factors.a + e.factors.b;
    }
}