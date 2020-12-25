import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

export const getCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    return coordinates;
};