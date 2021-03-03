<template>
  <v-app class="mt-2">
    <div class="d-flex justify-center">
      <v-text-field
        style="max-width:800px"
        label="Search"
        color="secondary"
        prepend-icon="mdi-magnify"
        v-model="search"
      ></v-text-field>
    </div>
    <div v-for="anime in animes" :key="anime.titre" class="mx-auto mt-2 mb-2">
      <div v-if="anime.from == null && anime.titre.includes(search)">
        <h2 v-if="anime.media != null" class="text-center">
          {{ anime.media.media.title.romaji }}
        </h2>
        <h2 v-else class="text-center">{{ anime.titre }}</h2>
        <v-img
          v-if="anime.media != null"
          class="mx-auto mb-5 rounded-lg"
          max-width="1000"
          max-height="200"
          elevation="2"
          :src="anime.media.media.bannerImage"
        ></v-img>
        <v-card-text class="mx-auto text-center">
          <div style="max-width:1000px" v-if="anime.episodes.length > 0">
            <v-tooltip
              bottom
              v-for="episode in anime.episodes"
              :key="episode.ep + Math.random()"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  text
                  class="mr-2 mb-2"
                  outlined
                  :color="
                    anime.media && anime.media.progress >= episode.epIndex
                      ? 'secondary'
                      : ''
                  "
                  @click="$store.state.open(anime.path + '/' + episode.ep)"
                >
                  {{ episode.epIndex }}
                </v-btn>
              </template>
              <span
                >Watch episode
                {{
                  episode.epIndex.startsWith("0")
                    ? episode.epIndex.slice(1)
                    : episode.epIndex
                }}
                !</span
              >
            </v-tooltip>
          </div>
          <div v-else style="max-width:1000px">
            <div v-for="anime2 in animes" :key="anime2.titre + 'from'">
              <div v-if="anime2.from != null && anime2.from == anime.titre">
                <h3 v-if="anime2.media != null" class="text-left">
                  {{ anime2.media.media.title.romaji }}
                </h3>
                <h3 v-else class="text-left">{{ anime2.titre }}</h3>

                <v-card-text class="mx-auto text-left">
                  <div
                    style="max-width:1000px"
                    v-if="anime2.episodes.length > 0"
                  >
                    <v-tooltip
                      bottom
                      v-for="episode in anime2.episodes"
                      :key="episode.ep"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          text
                          class="mr-2 mb-2"
                          outlined
                          :color="
                            anime2.media &&
                            anime2.media.progress >= episode.epIndex
                              ? 'secondary'
                              : ''
                          "
                          @click="
                            $store.state.open(anime2.path + '/' + episode.ep)
                          "
                        >
                          {{ episode.epIndex }}
                        </v-btn>
                      </template>
                      <span
                        >Watch episode
                        {{
                          episode.epIndex.startsWith("0")
                            ? episode.epIndex.slice(1)
                            : episode.epIndex
                        }}
                        !</span
                      >
                    </v-tooltip>
                  </div>
                </v-card-text>
              </div>
            </div>
          </div>
        </v-card-text>
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
      search: "",
      folders: [],
      animes: [],
    };
  },
  methods: {
    init: async function() {
      const list = await this.$store.state.getList();
      this.animes.forEach((anime, index) => {
        list.forEach((e) => {
          if (this.animes[index].media != null) return;
          const i = e.entries.findIndex(
            (y) =>
              y.media.title.romaji
                .toLowerCase()
                .replace(/[^\w\s]/gi, "")
                .includes(anime.titre.toLowerCase().replace(/[^\w\s]/gi, "")) ||
              y.media.synonyms.some((p) =>
                p
                  .toLowerCase()
                  .replace(/[^\w\s]/gi, "")
                  .includes(anime.titre.toLowerCase().replace(/[^\w\s]/gi, ""))
              )
          );
          if (i == -1) {
            console.log();
          } else {
            this.animes[index].media = e.entries[i];
          }
        });
      });
    },
    getFolder(fs, nomDossier, from) {
      const x = fs.readdirSync("D:/Anime/" + nomDossier);
      x.forEach((titre) => {
        if (this.animes.some((e) => e.titre == titre)) return;
        if (titre.startsWith("--ignore")) return;
        const extSplit1 = titre.split(".");
        if (extSplit1.length == 2) return;
        const path = "D:/Anime/" + nomDossier + "/" + titre;
        const episodes = fs.readdirSync(path);
        if (episodes.length == 0) return;
        let animeEps = [];
        episodes.forEach((ep) => {
          const extSplit = ep.split(".");
          if (extSplit.length == 1)
            return this.getFolder(fs, nomDossier + "/" + titre, titre);

          if (ep == "desktop.ini") return;
          if (!ep.endsWith(".mkv") && !ep.endsWith(".mp4")) return;
          if (ep.startsWith("--ignore")) return;
          const stat = fs.statSync(path + "/" + ep);

          animeEps.push({
            ep,
            epIndex: this.$store.state.getEpisodeIndex(ep),
            creation: stat.birthtime,
          });
        });
        animeEps = animeEps.sort(function(a, b) {
          return a.epIndex - b.epIndex;
        });

        this.animes.push({
          titre,
          episodes: animeEps,
          path,
          media: null,
          from: from ? from : null,
        });
      });
    },
  },
  mounted() {
    const fs = window.require("fs");
    this.folders = fs.readdirSync("D:/Anime");
    this.folders.length -= 1;
    this.folders.forEach((nomDossier) => {
      if (nomDossier != "Anime TV (Finished)") return;
      this.getFolder(fs, nomDossier);
    });
    this.init();
  },
};
</script>
