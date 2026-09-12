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
  title: "30th Ariant Anniversary",
  eyebrow: "CELEBRATION SPECIAL",
  logoImage: "assets/ariant-logo.png",
  spinButtonText: "SPIN THE WHEEL",
  instruction: "Tap the button and win your anniversary surprise!",
  spinDurationMs: 5200,

  prizes: [
    {
      title: "Dairy Milk",
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
      title: "Dairy Milk",
      type: "chocolate",
      emoji: "🍫",
      image: "",
      weight: 1
    },
    {
      title: "Surprise Gift",
      type: "surprise",
      emoji: "🎊",
      image: "",
      weight: 1
    },
    {
      title: "5 Star",
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
