<template>
  <v-app>
    <v-dialog v-model="dialog" width="800">
      <v-card>
        <v-card-title class="headline secondary">
          <v-icon left>mdi-cog</v-icon> Settings
        </v-card-title>
        <v-alert
          v-model="dialogErr"
          dense
          dismissible
          elevation="2"
          class="mt-4 mx-auto mr-8 ml-8"
          type="error"
          >ERROR!</v-alert
        >
        <v-card-text class="mt-4">
          <v-row no-gutters>
            <v-col cols="12" sm="6">
              <v-file-input
                id="animeWatched"
                multiple
                accept="folder"
                webkitdirectory
                color="secondary"
                prepend-icon="mdi-folder"
                class="mr-5"
                label="CURRENT Anime Directory"
              ></v-file-input
            ></v-col>
            <v-col cols="12" sm="6"
              ><v-file-input
                class="ml-5"
                color="secondary"
                id="animeFinished"
                multiple
                accept="folder"
                webkitdirectory
                prepend-icon="mdi-folder"
                label="FINISHED Anime Directory"
              ></v-file-input
            ></v-col>
            <v-text-field
              style="max-width:800px"
              label="Anilist Username"
              color="secondary"
              prepend-icon="mdi-account"
              v-model="username"
            ></v-text-field>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="test()">
            I accept
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-app-bar app color="primary" dense dark>
      <v-btn text @click="dialog = true">
        <v-icon>mdi-cog</v-icon>
        <span class="ml-2">Settings</span>
      </v-btn>
      <v-btn text @click="update" :loading="updateing">
        <v-icon>mdi-update</v-icon>
        <span class="ml-2">Update Anilist</span>
      </v-btn>
      <v-spacer></v-spacer>
      <div>
        <v-btn
          dense
          text
          v-for="folder in $store.state.folders"
          :key="folder"
          @click="go(folder)"
          >{{ folder }}</v-btn
        >
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      dialogErr: false,
      dialog: false,
      username: "",
      updateing: false,
    };
  },
  methods: {
    async update() {
      if (this.updateing == true) return console.log("already");
      this.updateing = true;
      const fs = window.require("fs");
      fs.writeFileSync(
        this.$store.state.configFolderPath + this.$store.state.configFileName,
        JSON.stringify({
          user: this.$store.state.user,
          path: this.$store.state.path,
          folders: this.$store.state.folders,
          foldersDetails: this.$store.state.foldersDetails,
          list: await this.$store.state.queryRequest(this.$store.state.user),
        })
      );
      this.updateing = false;
      window.location.reload();
    },
    getUser(user) {
      const query = `
      query ($userName: String) {
 User(name: $userName) {
  id
}
}
`;

      var variables = { userName: user };

      // Define the config we'll need for our Api request
      var url = "https://graphql.anilist.co",
        options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: query,
            variables: variables,
          }),
        };

      return fetch(url, options)
        .then((response) => {
          return response.json().then(function(json) {
            return response.ok ? json : Promise.reject(json);
          });
        })
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
    },
    async test() {
      const fs = window.require("fs");
      if (this.username == "") return (this.dialogErr = true);
      let animeWatched = document.getElementById("animeWatched").files[0].path;
      let animeFinished = document.getElementById("animeFinished").files[0]
        .path;

      let split = animeWatched.split("\\");
      animeWatched = split[2];

      let mainPath = split[0] + "/" + split[1] + "/";

      split = animeFinished.split("\\");
      animeFinished = split[2];

      if (mainPath != split[0] + "/" + split[1] + "/")
        return (this.dialogErr = true);

      const user = this.username;
      const userVerified = await this.getUser(user);
      if (userVerified == false) return (this.dialogErr = true);

      fs.writeFileSync(
        this.$store.state.configFolderPath + this.$store.state.configFileName,
        JSON.stringify({
          user: user,
          path: mainPath,
          folders: [animeWatched, animeFinished],
          foldersDetails: {
            watching: animeWatched,
            completed: animeFinished,
          },
          list: await this.$store.state.queryRequest(user),
        })
      );
      this.dialog = false;
      window.location.reload();
    },
    go(where) {
      switch (where) {
        case this.$store.state.foldersDetails.completed:
          this.$router.push("/Finished");
          break;

        case this.$store.state.foldersDetails.watching:
          this.$router.push("/");
          break;
        default:
          break;
      }
    },
  },
};
</script>
