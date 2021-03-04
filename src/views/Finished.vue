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
      <div
        v-if="
          anime.from == null &&
            anime.titre.toLowerCase().includes(search.toLowerCase())
        "
      >
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
            <div v-for="anime2 in froms" :key="anime2.titre">
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
      froms: [],
    };
  },
  methods: {
    async timeoutList() {
      let list = await this.$store.state.getList();
      setTimeout(() => {
        if (list == null) {
          return false;
        }
      }, 10000);
      if (list == null) {
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        await delay(5000);
        list = await this.timeoutList();
      }
      return list;
    },
    init: async function() {
      let list = await this.timeoutList();
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
      console.log(this.animes);
    },
    getFolder(fs, nomDossier, from) {
      const x = fs.readdirSync(this.$store.state.path.trim() + nomDossier);
      x.forEach((titre) => {
        if (
          this.animes.some((e) => e.titre == titre) ||
          this.froms.some((e) => e.titre == titre)
        )
          return;
        if (titre.startsWith("--ignore")) return;
        const extSplit1 = titre.split(".");
        if (extSplit1.length == 2) return;
        const path = this.$store.state.path.trim() + nomDossier + "/" + titre;
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

        if (from) {
          this.froms.push({
            titre,
            episodes: animeEps,
            path,
            media: null,
            from: from ? from : null,
          });
        } else {
          this.animes.push({
            titre,
            episodes: animeEps,
            path,
            media: null,
            from: from ? from : null,
          });
        }
      });
    },
  },
  mounted() {
    const fs = window.require("fs");
    this.$store.state.folders.forEach((nomDossier) => {
      if (nomDossier != this.$store.state.foldersDetails.completed) return;
      this.getFolder(fs, nomDossier);
    });
    this.init();
  },
};
</script>
