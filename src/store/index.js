import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    open: function(path) {
      const { shell } = window.require("electron");
      shell.openPath(path);
    },
    getEpisodeIndex: function(ep) {
      ep = ep
        .replace("S1", "")
        .replace("S01", "")
        .replace("S2", "")
        .replace("S02", "")
        .replace("S03", "")
        .replace("S3", "")
        .replace(".mp4", "")
        .replace("1080", "")
        .replace("720", "")
        .replace("x265", "")
        .replace("2003", "")
        .replace("2017", "")
        .trim();
      let g = ep.match(/\d+/g);
      if (ep.toLowerCase().includes("movie")) {
        g = ["Movie"];
      } else if (ep.includes(" ED ")) {
        g = ["ED"];
      } else if (ep.includes(" OP ")) {
        g = ["OP"];
      }
      if (g == null) {
        if (
          ep.toLowerCase().includes("oav") ||
          ep.toLowerCase().includes("ova")
        ) {
          g = ["OAV"];
        } else if (ep.toLowerCase().includes("ed")) {
          g = ["ED"];
        } else if (ep.toLowerCase().includes("op")) {
          g = ["OP"];
        } else if (ep.toLowerCase().includes("movie")) {
          g = ["Movie"];
        } else if (g == null) {
          g = ["Other"];
        }
      }
      return g[0];
    },
    getList: function() {
      const query = `
       query ($userName: String, $type: MediaType) {
  anime: MediaListCollection(userName: $userName, type: $type) {
    lists {
      entries {
        status
        progress
        media {
          type
          id
          bannerImage
          coverImage {
            extraLarge
            large
            medium
            color
          }
          title {
            romaji
            english
          }
          format
          synonyms
          description
    averageScore
    genres
        }
      }
    }
  }
}
`;

      return fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: { userName: "Theya", type: "ANIME" },
        }),
      })
        .then(handleResponse)
        .then(handleData)
        .catch(handleError);

      function handleResponse(response) {
        return response.json().then(function(json) {
          return response.ok ? json : Promise.reject(json);
        });
      }

      function handleData(data) {
        return data.data.anime.lists;
      }

      function handleError() {
        return null;
      }
    },
  },
  mutations: {},
  actions: {},
  modules: {},
});
