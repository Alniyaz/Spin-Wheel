/**
 * ARIANT SPIN WHEEL — EASY EDIT FILE
 *
 * Change the title, logo, gift names and gift images here.
 * For an image stored inside the assets folder, use a path like:
 * image: "assets/my-chocolate.png"
 *
 * Leave image as "" to use the emoji instead.
 * Increase a prize's weight to make it more likely to be selected.
 */
window.SPIN_WHEEL_CONFIG = {
  title: "Ariant 30th Anniversary",
  eyebrow: "CELEBRATION SPECIAL",
  logoImage: "assets/ariant-logo.png",
  spinButtonText: "SPIN THE WHEEL",
  instruction: "Tap the button and win your anniversary surprise!",
  spinDurationMs: 5200,

  /**
   * Put background songs in assets/song and applause sounds in assets/clap.
   * When this site is online, supported audio files are found automatically.
   * For offline/local use, add filenames to songFiles and clapFiles below.
   */
  audio: {
    enabled: true,
    repository: "Alniyaz/Spin-Wheel",
    branch: "main",
    songFolder: "assets/song",
    clapFolder: "assets/clap",
    songFiles: ["celebration-theme.wav"],
    clapFiles: ["gift-applause.wav"],
    backgroundVolume: 0.35,
    clapVolume: 0.9
  },

  prizes: [
    {
      title: "Chocolate",
      type: "chocolate",
      emoji: "🍫",
      image: "",
      weight: 1
    },
    {
      title: "Chocolate",
      type: "chocolate",
      emoji: "🍫",
      image: "",
      weight: 1
    },
    {
      title: "Chocolate",
      type: "chocolate",
      emoji: "🍫",
      image: "",
      weight: 1
    },
    {
      title: "Chocolate",
      type: "chocolate",
      emoji: "🍫",
      image: "",
      weight: 1
    },
    {
      title: "Chocolate",
      type: "chocolate",
      emoji: "🍫",
      image: "",
      weight: 1
    },
    {
      title: "Surprise Gift",
      type: "surprise",
      emoji: "🎁",
      image: "",
      weight: 1
    },
    {
      title: "Try One More Chance",
      type: "retry",
      emoji: "🔄",
      image: "",
      weight: 1
    }
  ]
};
