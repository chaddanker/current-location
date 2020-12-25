<template>
  <ion-page>
    <ion-content :fullscreen="true">
    <div id="map"></div>
      <div id="container">
        <div v-if="!hasPosition">
          <h1 id="heading">
            click for your current location
          </h1>
        </div>
      </div>
      <ion-fab vertical="top" horizontal="end" slot="fixed" @click="changeTheme">
        <ion-fab-button class="ion-margin-vertical" color="dark">
          <ion-icon :icon="moon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-fab vertical="bottom" horizontal="center" slot="fixed" @click="buttonClick" v-if="!hasPosition">
        <ion-fab-button class="ion-margin-vertical">
          <ion-icon :icon="locationOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" @click="reset" v-else>
        <ion-fab-button class="ion-margin-vertical">
          <ion-icon :icon="refresh"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage, loadingController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { locationOutline, refresh, moon } from 'ionicons/icons';
import { Plugins } from '@capacitor/core';
import { io } from 'socket.io-client';
import keys from '../config/keys';

const { Geolocation } = Plugins;
const socket = io(keys.socketUri);

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonPage,
  },
  data() {
    return {
      locationOutline,
      refresh,
      hasPosition: false,
      coords: {},
      moon,
      darkMode: false,
      southAfricaCenter: [22.9375, -30.5595],
      isConnected: false,
      socketMessage: ''
    }
  },
  mounted() {
    this.presentLoading('Please wait...', 2000);
    document.body.classList.toggle('dark');
    this.buildMap(this.southAfricaCenter, 3, this.darkMode);
  },
  methods: {
    async getCurrentPosition() {
      const coordinates = await Geolocation.getCurrentPosition();
      this.hasPosition = true;
      this.coords = coordinates.coords;
      return coordinates;
    },
    buildMap(center, zoom, isDark) {
      window.mapboxgl.accessToken = keys.mapBoxKey;
      const map = new window.mapboxgl.Map({
        container: 'map', // container id
        style: `mapbox://styles/mapbox/${isDark ? 'dark' : 'light'}-v10`, // style URL
        center, // starting position [lng, lat]
        zoom // starting zoom
      });    

      map.on('load', () => {
        map.resize();
      });

      this.hasPosition ? new window.mapboxgl.Marker()
      .setLngLat(center)
      .addTo(map) : null;
    },
    async buttonClick() {
      const position = await this.getCurrentPosition();
      const coords = [position.coords.longitude, position.coords.latitude];
      socket.emit('location', coords);
      this.presentLoading('locating...', 1000);
      this.buildMap(coords, 12, this.darkMode);
    },
    reset() {
      this.presentLoading('re-initializing...', 1500);
      this.hasPosition = false;
      this.buildMap(this.southAfricaCenter, 3, this.darkMode);
      setTimeout(() => {
        document.querySelector('#heading').style.color = this.darkMode ? '#ffffff' : '#000000';
      }, 800);
    },
    async presentLoading(message, duration) {
      const loading = await loadingController
        .create({
          cssClass: 'my-custom-class',
          message: message,
          duration: duration,
        });

      await loading.present();

      setTimeout(function() {
        loading.dismiss()
      }, duration);
    },
    changeTheme() {
      this.darkMode ? this.darkMode = false : this.darkMode = true;
      this.presentLoading(`Changing to ${this.darkMode ? 'dark' : 'light'} theme...`, 1000);
      document.body.classList.toggle('dark');
      const headingColor = this.darkMode ? '#ffffff' : '#000000';
      document.querySelector('#heading') ? 
      document.querySelector('#heading').style.color = headingColor :
      null;
      let center = this.southAfricaCenter;
      let zoom = 3;
      if(this.hasPosition) { 
        center = [this.coords.longitude, this.coords.latitude];
        zoom = 12; 
      }
      this.buildMap(center, zoom, this.darkMode);
    },
  },
});
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.light {
  color: #ffffff;
}

.dark {
  color: #000000;
}

#map { 
  width: 100%; 
  height: 100vh;
}

h1 {
  position: relative;
  top: 30vh;
  color: #000000;
}

@media screen and (max-width: 600px){
  h1 {
    display: none;
  }
  ion-fab-button {
    margin-bottom: 2em;
  }
}

</style>