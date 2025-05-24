export default store => {
    store.subscribe((mutation, state) => {
        // Ovde možeš proveriti koju mutaciju hoćeš da reaguješ
        // npr. samo kada se uređaji menjaju
        if (mutation.type.startsWith('device/')) {
            // Poziv neke akcije (iz drugog modula)
            store.dispatch('group/assignDevicesToGroups');
        }
    });
};