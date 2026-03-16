
import { RadioInfo } from './types';

export interface ExtendedRadioInfo extends RadioInfo {
  frequency: string;
  slogan: string;
  location: string;
  promoter: string;
}

import logoFile from './logo.png';

export const RADIO_DATA: ExtendedRadioInfo = {
  name: "RADIO IQRA TV",
  logo: logoFile,
  streamUrl: "https://a10.asurahosting.com:8170/radio.mp3?type=.mp3",
  description: "RADIO IQRA TV – La Voix de saint coran. Station islamique dédiée à la diffusion des enseignements authentiques de l'Islam.",
  frequency: "LIVE",
  slogan: "La Voix du Saint Coran",
  location: "Burkina Faso",
  promoter: "RADIO IQRA TV"
};

export const COLORS = {
  GREEN: "#009E49",
  RED: "#EF2B2D",
  YELLOW: "#FCD116",
  DARK: "#111111"
};
