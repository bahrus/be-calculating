export async function doNotify(self) {
    const { notify, value, enhancedElement } = self;
    const propertyName = enhancedElement.name;
    if (!propertyName) {
        throw 404;
    }
    const s = ['closestOrHost', '[itemscope]'];
    const { findRealm } = await import('trans-render/lib/findRealm.js');
    const scopeContainer = await findRealm(enhancedElement, s);
    if (scopeContainer === null)
        throw 404;
    switch (notify) {
        case 'scope':
            import('be-scoped/be-scoped.js');
            const base = await scopeContainer.beEnhanced.whenResolved('be-scoped');
            base.scope[propertyName] = value;
            break;
        default:
            throw 'NI';
    }
}
