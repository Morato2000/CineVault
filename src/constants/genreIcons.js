import {
  IoCompassOutline,
  IoHappyOutline,
  IoSkull,
  IoEyeOutline,
  IoHeartOutline,
  IoRocketOutline,
  IoSparklesOutline,
  IoColorPaletteOutline,
  IoSearchOutline,
  IoCameraOutline,
  IoPeopleOutline,
  IoMusicalNotesOutline,
  IoLibraryOutline,
  IoTvOutline,
  IoGameControllerOutline,
  IoVideocamOutline,
  IoPricetagOutline,
} from "react-icons/io5";
import { FaGun, FaMasksTheater  } from "react-icons/fa6";
import { GiCrossedSwords, GiCowboyBoot  } from "react-icons/gi";

export const GENRE_ICONS = {
  Action: FaGun,
  Adventure: IoCompassOutline,
  "Action & Adventure": IoCompassOutline,
  Comedy: IoHappyOutline,
  Drama: FaMasksTheater ,
  Horror: IoSkull,
  Thriller: IoEyeOutline,
  Romance: IoHeartOutline,
  "Science Fiction": IoRocketOutline,
  "Sci-Fi & Fantasy": IoRocketOutline,
  Fantasy: IoSparklesOutline,
  Animation: IoColorPaletteOutline,
  Crime: IoSearchOutline,
  Mystery: IoSearchOutline,
  Documentary: IoCameraOutline,
  Family: IoPeopleOutline,
  War: GiCrossedSwords,
  "War & Politics": GiCrossedSwords,
  Western: GiCowboyBoot,
  Music: IoMusicalNotesOutline,
  History: IoLibraryOutline,
  "TV Movie": IoTvOutline,
  Kids: IoGameControllerOutline,
  Reality: IoVideocamOutline,
};

const FALLBACK_ICON = IoPricetagOutline;

export function getGenreIcon(genreName) {
  return GENRE_ICONS[genreName] || FALLBACK_ICON;
}