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
      <div v-if="anime.titre.includes(search)">
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
      folders: [],
      animes: [],
    };
  },
  methods: {
    init: async function() {
      const list = await this.$store.state.getList();
      this.animes.forEach((anime, index) => {
        const i = list[8].entries.findIndex(
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
        this.animes[index].media = list[8].entries[i];
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
      if (nomDossier != "Anime TV (En Cours)") return;
      this.getFolder(fs, nomDossier);
    });
    this.init();
  },
};
</script>
