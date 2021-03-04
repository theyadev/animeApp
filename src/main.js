import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

const fs = window.require("fs");

const defaultData = {
  user: "Theya",
  path: "D:/Anime/",
  folders: ["Anime TV (En Cours)", "Anime TV (Finished)"],
  foldersDetails: {
    watching: "Anime TV (En Cours)",
    completed: "Anime TV (Finished)",
  },
  list: null,
};
if (!fs.existsSync(store.state.configFolderPath)) fs.mkdirSync(store.state.configFolderPath);
if (!fs.existsSync(store.state.configFolderPath + store.state.configFileName)) {
  fs.writeFileSync(
    store.state.configFolderPath + store.state.configFileName,
    JSON.stringify(defaultData)
  );
}

const data = JSON.parse(fs.readFileSync(store.state.configFolderPath + store.state.configFileName));

store.state.path = data.path;
store.state.folders = data.folders;
store.state.foldersDetails = data.foldersDetails;
store.state.user = data.user;
store.state.list = data.list;

function handleResponse(response) {
  return response.json().then(function(json) {
    return response.ok ? json : Promise.reject(json);
  });
}
function handleData(list) {
  store.state.list = list.data.anime.lists;
  fs.writeFileSync(
    store.state.configFolderPath + store.state.configFileName,
    JSON.stringify({
      user: data.user,
      path: data.path,
      folders: data.folders,
      foldersDetails: data.foldersDetails,
      list: list.data.anime.lists,
    })
  );
}

function handleError(error) {
  alert("Error, check console");
  console.error(error);
}

if (data.list == null) {
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

  // Define our query variables and values that will be used in the query request
  var variables = { userName: data.user, type: "ANIME" };

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

  // Make the HTTP Api request
  fetch(url, options)
    .then(handleResponse)
    .then(handleData)
    .catch(handleError);
}
new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
