import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import CurrentLocation from '../views/CurrentLocation.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/location'
  },
  {
    path: '/location',
    name: 'CurrentLocation',
    component: CurrentLocation
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
