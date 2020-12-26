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
      <ion-card class="locationInfo" v-if="hasPosition">
        <ion-card-content>
          {{ address }}
        </ion-card-content>
      </ion-card>
      <ion-fab vertical="top" horizontal="end" slot="fixed" @click="changeTheme">
        <ion-fab-button class="ion-margin-vertical" color="dark">
          <ion-icon :icon="moon"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-fab vertical="bottom" horizontal="center" slot="fixed" @click="locateButtonClick" v-if="!hasPosition">
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
import { IonContent, IonPage, loadingController, IonCard, IonCardContent } from '@ionic/vue';
import { defineComponent } from 'vue';
import { locationOutline, refresh, moon } from 'ionicons/icons';

import { getMap, getAddress, addMarker } from '../utils/useMapBox';
import { getCurrentPosition } from '../utils/useLocation';
import { socket } from '../utils/useSocket';

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonPage,
    IonCard,
    IonCardContent
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
      socketMessage: '',
      address: '',
      map: null
    }
  },
  mounted() {
    this.presentLoading('Please wait...', 2000);
    document.body.classList.remove('dark');
    this.map = getMap(this.southAfricaCenter, 3, this.darkMode, 'map');
    this.map.on('load', () => {
      this.map.resize();
    });
  },
  methods: {
    async locateButtonClick() {
      const position = await getCurrentPosition();
      this.hasPosition = true;
      this.coords = position.coords;
      this.address = await getAddress(this.coords);
      const center = [position.coords.longitude, position.coords.latitude];
      socket.emit('location', center);
      this.presentLoading('locating...', 1000);
      this.map = getMap(center, 13, this.darkMode, 'map');
      addMarker(center, this.map);
      this.startTracking();
    },
    reset() {
      clearInterval(this.intervalID);
      const elem = document.querySelector('.marker');
      elem.parentNode.removeChild(elem);
      this.presentLoading('re-initializing...', 1500);
      this.hasPosition = false;
      this.map = getMap(this.southAfricaCenter, 3, this.darkMode, 'map');
      setTimeout(() => {
        document.querySelector('#heading').style.color = this.darkMode ? '#ffffff' : '#000000';
      }, 800);
    },
    async presentLoading(message, duration) {
      const loading = await loadingController
        .create({
          cssClass: 'loading',
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
      this.map = getMap(center, zoom, this.darkMode, 'map');
      if(this.hasPosition) {
        const elem = document.querySelector('.marker');
        elem.parentNode.removeChild(elem);
        addMarker(center, this.map);
      }
    },
    startTracking() {
      this.intervalID = setInterval( async () => {
          const position = await getCurrentPosition();

          if(this.coords.latitude !== position.coords.latitude) {
            const center = [position.coords.longitude, position.coords.latitude];
            this.coords = position.coords;
            this.hasPosition = true;
            const elem = document.querySelector('.marker');
            elem.parentNode.removeChild(elem);
            addMarker(center, this.map);
            this.address = await getAddress(position.coords);
        }
      }, 2000);
    }
  },
  unmounted() {
    clearInterval(this.intervalID);
  }
});
</script>

