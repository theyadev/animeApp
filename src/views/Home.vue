<template>
  <v-app class="mt-3">
    <div class="mx-auto">
      <v-btn dense text v-for="folder in folders" :key="folder">{{
        folder
      }}</v-btn>
    </div>
    <v-divider class="mb-2 mt-2"></v-divider>
    <div v-for="anime in animes" :key="anime.titre" class="mx-auto mt-2 mb-2">
      <h2 class="text-center">{{ anime.titre }}</h2>

      <div class="mx-auto">
        <v-btn
          v-for="episode in anime.episodes"
          :key="episode.ep"
          @click="open(anime.path + '/' + episode.ep)"
        >
          {{ episode.epIndex }}
        </v-btn>
      </div>
    </div>
    <v-divider class="my-7"></v-divider>
  </v-app>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      folders: [],
      animes: [],
    };
  },
  methods: {
    open(path) {
      console.log(path);
      const { shell } = window.require("electron");
      shell.openPath(path);
    },
    getEpisodeIndex(ep) {
      let o = ep.split("]");
      if (o[0].startsWith("[")) o.shift();
      o = o.toString();
      o = o.split("[");
      if (o[1] && (o[1].endsWith(".mp4") || o[1].endsWith(".mkv"))) o.pop();
      o = o.toString();
      o = o.split(".");
      if (o[1] && (o[1] == "mp4" || o[1] == "mkv")) o.pop();
      o = o.toString();
      o = o.split("-");
      o.shift();
      o = o.toString();
      o = o.split("VOSTFR");
      if (o[2]) o.pop();
      if (o[1]) o.pop();
      o = o.toString();
      o = o
        .replace(",", "")
        .replace("S2", "")
        .replace("E", "")
        .trim();
      return o;
    },
  },
  mounted() {
    const fs = window.require("fs");
    this.folders = fs.readdirSync("D:/Anime");
    this.folders.length -= 1;
    this.folders.forEach((nomDossier) => {
      if (nomDossier != "Anime TV (En Cours)") return;
      const x = fs.readdirSync("D:/Anime/" + nomDossier);
      x.forEach((titre) => {
        const path = "D:/Anime/" + nomDossier + "/" + titre;
        const episodes = fs.readdirSync(path);
        if (episodes.length == 0) return;
        let animeEps = [];
        episodes.forEach((ep) => {
          if (ep == "desktop.ini") return;
          if (ep.startsWith("--ignore")) return;
          const stat = fs.statSync(path + "/" + ep);

          animeEps.push({
            ep,
            epIndex: this.getEpisodeIndex(ep),
            creation: stat.birthtime,
          });
        });
        animeEps = animeEps.sort(function(a, b) {
          return a.creation - b.creation;
        });
        this.animes.push({
          titre,
          episodes: animeEps,
          path,
        });
      });
    });
  },
};
</script>
