<template>
   <v-menu bottom left offset-y origin="top right" transition="scale-transition">
      <template v-slot:activator="{ attrs, on }">
         <v-btn class="mt-3 mr-3" min-width="0" text v-bind="attrs" v-on="on">
            <v-badge color="red" overlap bordered>
               <template v-slot:badge>
                  <span>5</span>
               </template>
               <v-icon>mdi-bell</v-icon>
            </v-badge>
         </v-btn>
      </template>
      <v-list min-width="180" max-width="300" nav>
         <v-list-item v-for="(item, index) in notifications" :key="index" @click.prevent="select(item)">
            <v-list-item-content>
               <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item-content>
         </v-list-item>
      </v-list>
   </v-menu>
</template>

<script>
export default {
   name: 'MenuNotifications',
   data: () => ({
      notifications: [
        'Mike John Responded to your emailxx',
        'You have 5 new tasks',
        'You\'re now friends with Andrew',
        'Another Notification',
        'Another one',
      ],
   }),
   methods:{
      select(item) {
         console.log(item);
      }
   }
}
</script>

<style>

</style>