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
      <div v-if="anime.titre.toLowerCase().includes(search.toLowerCase())">
        <h2 v-if="anime.media != null" class="text-center">
          {{ anime.media.media.title.romaji }}
        </h2>
        <h2 v-else class="text-center">{{ anime.titre }}</h2>
        <v-img
          v-if="anime.media != null"
          class="mx-auto mb-5 rounded-lg"
          max-width="1000"
          elevation="2"
          :src="anime.media.media.bannerImage"
        ></v-img>
        <div class="d-flex justify-center">
          <v-tooltip bottom v-for="episode in anime.episodes" :key="episode.ep">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                class="mr-2"
                text
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
      animes: [],
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
      const listIndex = list.findIndex((e) =>
        e.entries.some((y) => y.status == "CURRENT")
      );
      this.animes.forEach((anime, index) => {
        const i = list[listIndex].entries.findIndex(
          (e) =>
            e.media.title.romaji
              .toLowerCase()
              .includes(anime.titre.toLowerCase()) ||
            e.media.synonyms.some((p) =>
              p
                .toLowerCase()
                .replace(/[^\w\s]/gi, "")
                .includes(anime.titre.toLowerCase().replace(/[^\w\s]/gi, ""))
            )
        );
        if (index == -1) return;
        this.animes[index].media = list[listIndex].entries[i];
      });
    },
    getFolder(fs, nomDossier, from) {
      const x = fs.readdirSync(
        this.$store.state.path.trim() + nomDossier.trim()
      );
      x.forEach((titre) => {
        if (this.animes.some((e) => e.titre == titre)) return;
        if (titre.startsWith("--ignore")) return;
        const extSplit1 = titre.split(".");
        if (extSplit1.length == 2) return;
        const path =
          this.$store.state.path.trim() + nomDossier.trim() + "/" + titre;
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
    this.$store.state.folders.forEach((nomDossier) => {
      if (nomDossier != this.$store.state.foldersDetails.watching) return;
      this.getFolder(fs, nomDossier);
    });
    this.init();
  },
};
</script>
