import i18next from 'i18next';
import English from './English';
//import German from './German';
//import Japanese from './Japanese';
//import Spanish from './Spanish';
//import Chinese from './Chinese';
import {initReactI18next} from 'react-i18next';

i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: English,
    //de: German,
    //ja: Japanese,
    //es: Spanish,
    //zh: Chinese,
  },
  react: {
    useSuspense: true,
  },
});

export default i18next;
