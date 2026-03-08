
import { RadioInfo } from './types';

export interface ExtendedRadioInfo extends RadioInfo {
  frequency: string;
  slogan: string;
  location: string;
  promoter: string;
  socials: {
    tiktok?: string;
    facebook?: string;
    x?: string;
    instagram?: string;
  };
}

export const RADIO_DATA: ExtendedRadioInfo = {
  name: "Radio Iqra TV",
  logo: "https://radioiqraburkina.com/wp-content/uploads/2025/09/2732x2732-1.png",
  streamUrl: "https://radioiqrabf-1.radiohls.infomaniak.com/radioiqrabf-1/manifest.m3u8",
  description: "Station islamique dédiée à la diffusion des enseignements authentiques de l'Islam, dans un esprit de paix, de fraternité et d'éducation spirituelle au Burkina Faso.",
  frequency: "96.1 MHz",
  slogan: "La Voix du Saint Coran",
  location: "Ouagadougou, Burkina Faso",
  promoter: "Communauté Musulmane du Burkina",
  socials: {
    tiktok: "https://www.tiktok.com/@radio.iqra.tv",
    facebook: "https://www.facebook.com/profile.php?id=61571862830361",
    x: "https://x.com/iqra_radio4578",
    instagram: "https://www.instagram.com/radioiqratv_officielle"
  }
};

export const COLORS = {
  GREEN: "#009E49", // Islamic Green
  GOLD: "#D4AF37",  // Gold accents
  WHITE: "#FFFFFF",
  DARK: "#050505"
};
