import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
    dark: {
      primary: colors.deepPurple.darken2, // #E53935
      secondary: colors.green.accent3, // #FFCDD2
      accent: colors.indigo.base, // #3F51B5
    }
  }
  },
});
