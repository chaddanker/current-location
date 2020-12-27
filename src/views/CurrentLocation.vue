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
    // show loading when component is mounted
    this.presentLoading('Please wait...', 2000);
    // make sure app is not in dark mode
    document.body.classList.remove('dark');
    // create a new map instance, this will show a map on the page of south africa
    this.map = getMap(this.southAfricaCenter, 3, this.darkMode, 'map');
    // resize map, if this line is removed map will not show full screen
    this.map.on('load', () => {
      this.map.resize();
    });
  },
  methods: {
    //when a user clicks on locate button
    async locateButtonClick() {
      // request users current position
      const position = await getCurrentPosition();
      // updated component data, we now have a users position
      this.hasPosition = true;
      this.coords = position.coords;
      // get the address of the position
      this.address = await getAddress(this.coords);
      // convert coordinates to mapbox usable position fro center of the map
      const center = [position.coords.longitude, position.coords.latitude];
      // send the location in real time to socket server
      socket.emit('location', center);
      // present loading while map initializes
      this.presentLoading('locating...', 1000);
      // create a new map instance with new position
      this.map = getMap(center, 13, this.darkMode, 'map');
      // add a marker in the center of map
      addMarker(center, this.map);
      // starts interval to track for location changes
      this.startTracking();
    },
    // when a user clicks on reset button
    reset() {
      // clears the track position interval
      clearInterval(this.intervalID);
      // removes the marker from the page
      const elem = document.querySelector('.marker');
      elem.parentNode.removeChild(elem);
      // presents loading while map re-initializes
      this.presentLoading('re-initializing...', 1500);
      // reset component data, as we now dont have their position anymore
      this.hasPosition = false;
      // re-initializes a new map instance
      this.map = getMap(this.southAfricaCenter, 3, this.darkMode, 'map');
      // once the heading is on the page, change its color according to theme
      setTimeout(() => {
        document.querySelector('#heading').style.color = this.darkMode ? '#ffffff' : '#000000';
      }, 800);
    },
    async presentLoading(message, duration) {
      // will show a loading component on the page
      const loading = await loadingController
        .create({
          cssClass: 'loading',
          message: message,
          duration: duration,
        });
      // shows the loading component
      await loading.present();

      // dismisses loading component after duration
      setTimeout(function() {
        loading.dismiss()
      }, duration);
    },
    changeTheme() {
      // changes component data that keeps track of theme
      this.darkMode ? this.darkMode = false : this.darkMode = true;
      // shows loading component
      this.presentLoading(`Changing to ${this.darkMode ? 'dark' : 'light'} theme...`, 1000);
      // adds dark to document body's classlist
      document.body.classList.toggle('dark');
      // changes the heading color according to theme
      const headingColor = this.darkMode ? '#ffffff' : '#000000';
      document.querySelector('#heading') ? 
      document.querySelector('#heading').style.color = headingColor :
      null;
      // center of map set to south africas center and zoom set to initial zoom
      let center = this.southAfricaCenter;
      let zoom = 3;
      //if there is a position, update center and zoom
      if(this.hasPosition) { 
        center = [this.coords.longitude, this.coords.latitude];
        zoom = 12; 
      }
      // initialize the map with center and zoom
      this.map = getMap(center, zoom, this.darkMode, 'map');
      // if there is a position, remove any markers on page and add a new one, to assure marker's color changes with theme
      if(this.hasPosition) {
        const elem = document.querySelector('.marker');
        elem.parentNode.removeChild(elem);
        addMarker(center, this.map);
      }
    },
    // function to keep track of users position on an interval
    startTracking() {
      // set intervalID as to clear interval on unmount 
      this.intervalID = setInterval( async () => {
        // get the users current position
          const position = await getCurrentPosition();
          // if the position has changed, update the marker on page with new coordinates
          if(this.coords.latitude !== position.coords.latitude) {
            // create a mapbox usable variable for markers center
            const loc = [position.coords.longitude, position.coords.latitude];
            // update component data
            this.coords = position.coords;
            this.hasPosition = true;
            // remove the old marker
            const elem = document.querySelector('.marker');
            elem.parentNode.removeChild(elem);
            // add new marker
            addMarker(loc, this.map);
            // update physical address
            this.address = await getAddress(position.coords);
        }
      }, 2000);
    }
  },
  unmounted() {
    // clear tracking interval
    clearInterval(this.intervalID);
  }
});
</script>

