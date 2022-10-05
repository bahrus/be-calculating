export function rewrite({ self, nameOfCalculator, args }, instance) {
    const inner = self.innerHTML.trim();
    if (inner.indexOf('=>') === -1) {
        const strArgs = [];
        instance.getStringArgs(args, strArgs);
        const str = `export const ${nameOfCalculator} = async ({${strArgs.join(',')}}) => ({
            value: ${inner}
        })`;
        self.innerHTML = str;
    }
    else if (!inner.startsWith(`export const ${nameOfCalculator} = async `)) {
        self.innerHTML = `export const ${nameOfCalculator} = async ` + inner;
    }
}
