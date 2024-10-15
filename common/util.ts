export const deviceVersion = {
    V1_2_0_rc1 : "1.2.0-rc.1",
    V1_2_0_rc2 : "1.2.0-rc.2"
}

export const deviceUids = {
    Mitra_device_7420 : "100fc133742000000000000000000010",
    Mitra_device_7421 : "100fc133742100000000000000000010",
    Mitra_device_7422 : "100fc133742200000000000000000010",
    Mitra_device_7423 : "100fc13374230000000000000000010",
    Mitra_device_7424 : "100fc133742400000000000000000010",
    Mitra_device_7425 : "100fc133742500000000000000000010"
}

// Use a mapping object for UIDs to their corresponding updateAvailableIDs
export const updateMappings = {
    [deviceUids.Mitra_device_7420]: 5551986, // UID 7420
    [deviceUids.Mitra_device_7421]: 5872905, // UID 7421
    [deviceUids.Mitra_device_7422]: 5551989, // UID 7422
    [deviceUids.Mitra_device_7423]: 5551992, // UID 7423
    [deviceUids.Mitra_device_7424]: 5551995, // UID 7424
    [deviceUids.Mitra_device_7425]: 5873694  // UID 7425
};

// Utility function to get the updateAvailableID for a given UID
export const getUpdateAvailableID = (uid: string): number | undefined => {
    return updateMappings[uid];
};