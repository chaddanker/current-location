<template>
  <ion-page>
    <ion-content :fullscreen="true">
    <div id="map"></div>
      <div id="container">
        <div v-if="!coordinates.coords">
          <h1>
            click for your current location
          </h1>
        </div>
      </div>
      <ion-fab vertical="bottom" horizontal="center" slot="fixed" @click="buttonClick" v-if="!coordinates.coords">
        <ion-fab-button class="ion-margin-vertical">
          <ion-icon :icon="locationOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonContent, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue';
import { locationOutline } from 'ionicons/icons';
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonPage
  },
  data() {
    return {
      locationOutline,
      coordinates: {}
    }
  },
  mounted() {
    this.buildMap([22.9375, -30.5595], 3);
  },
  methods: {
    async getCurrentPosition() {
      const coordinates = await Geolocation.getCurrentPosition();
      this.coordinates = coordinates;
      return coordinates;
    },
    buildMap(center, zoom) {
      window.mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhZGRhbmtlciIsImEiOiJjazcxc2E1bnIwMmE0M21ud2oxOTdhNTlvIn0.vPS-2MWv9PRKcuRmmJG13w';
      const map = new window.mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/dark-v10', // style URL
        center, // starting position [lng, lat]
        zoom // starting zoom
      });    

      map.on('load', () => {
        map.resize();
      });

      this.coordinates.coords ? new window.mapboxgl.Marker()
      .setLngLat(center)
      .addTo(map) : null;
    },
    async buttonClick() {
      const position = await this.getCurrentPosition();
      const coords = [position.coords.longitude, position.coords.latitude];

      this.buildMap(coords, 10);
    }
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

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}

#map { 
  width: 100%; 
  height: 100vh;
}

h1 {
  position: relative;
  top: 7em
}

</style>