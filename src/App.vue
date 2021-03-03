<template>
  <v-app>
    <v-app-bar app color="primary" dense dark>
      <v-btn text>
        <v-icon>mdi-home</v-icon>
        <span class="ml-2">Home</span>
      </v-btn>
      <v-spacer style="margin-right:-110px"></v-spacer>
      <div>
        <v-btn
          dense
          text
          v-for="folder in folders"
          :key="folder"
          @click="go(folder)"
          >{{ folder }}</v-btn
        >
      </div>
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
  methods: {
    go(where) {
      switch (where) {
        case "Anime TV (Finished)":
          this.$router.push("/Finished");
          break;

        case "Anime TV (En Cours)":
          this.$router.push("/");
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    const fs = window.require("fs");
    this.folders = fs.readdirSync("D:/Anime");
    this.folders.length -= 2;
  },
  data: () => ({
    folders: [],
  }),
};
</script>
