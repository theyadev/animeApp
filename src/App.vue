<template>
  <v-app>
    <v-app-bar app color="primary" dense dark>
      <v-btn text>
        <v-icon>mdi-home</v-icon>
        <span class="ml-2">Home</span>
      </v-btn>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    //
  }),
};
</script>
