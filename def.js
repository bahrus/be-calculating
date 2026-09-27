import  'assign-gingerly/object-extension.js';

/**
 * Registers be-calculating's config with the enhancement registry, so it can
 * be attached programmatically via `enh.set.beCalculating` or `enh.get(emc)`.
 * @param {Element | undefined} ref
 */
export async function defBeCalculating(ref){
    const {default: emc} = await import('./emc.json', {with: {type: 'json'}});
    return await push(ref, emc);
}

async function push(ref, emc){
    const {BeCalculating} = await import('./be-calculating.js');
    const {enhConfig} = emc;
    enhConfig.spawn = BeCalculating;
    enhConfig.customData = emc.customData;
    const registry = ref?.customElementRegistry ?? customElements;
    const {enhancementRegistry} = registry;
    enhancementRegistry.push(enhConfig);
    return enhConfig;
}
