(() => {
  "use strict";

  const config = window.SPIN_WHEEL_CONFIG;
  if (!config || !Array.isArray(config.prizes) || config.prizes.length !== 7) {
    throw new Error("config.js must contain exactly 7 prizes.");
  }

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const rotator = document.getElementById("wheel-rotator");
  const wheelWrap = document.querySelector(".wheel-wrap");
  const spinButton = document.getElementById("spin-button");
  const buttonLabel = document.getElementById("spin-button-label");
  const status = document.getElementById("status");
  const backdrop = document.getElementById("result-backdrop");
  const resultTitle = document.getElementById("result-title");
  const resultKicker = document.getElementById("result-kicker");
  const resultCopy = document.getElementById("result-copy");
  const resultIcon = document.getElementById("result-icon");
  const resultAction = document.getElementById("result-action");
  const closeResult = document.getElementById("close-result");
  const confettiCanvas = document.getElementById("confetti");
  const confettiCtx = confettiCanvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let rotation = 0;
  let spinning = false;
  let currentPrize = null;
  let lastFocused = null;
  let confettiFrame = null;
  const prizeImages = new Map();

  document.getElementById("game-title").textContent = config.title;
  document.getElementById("eyebrow").textContent = config.eyebrow;
  document.getElementById("center-logo").src = config.logoImage;
  document.getElementById("instruction").textContent = config.instruction;
  buttonLabel.textContent = config.spinButtonText;

  function makeRimLights() {
    const container = document.getElementById("rim-lights");
    const count = 28;
    for (let i = 0; i < count; i += 1) {
      const bulb = document.createElement("span");
      bulb.className = "rim-light";
      const angle = (i / count) * Math.PI * 2;
      const radius = 48;
      bulb.style.transform = `translate(${Math.cos(angle) * radius}cqw, ${Math.sin(angle) * radius}cqw)`;
      container.appendChild(bulb);
    }
  }

  function splitTitle(text) {
    const words = text.trim().split(/\s+/);
    if (words.length <= 2) return [text];
    const middle = Math.ceil(words.length / 2);
    return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
  }

  function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const segmentAngle = (Math.PI * 2) / config.prizes.length;
    const startOffset = -Math.PI / 2 - segmentAngle / 2;

    ctx.clearRect(0, 0, size, size);

    config.prizes.forEach((prize, index) => {
      const start = startOffset + index * segmentAngle;
      const end = start + segmentAngle;
      const isRed = index % 2 === 0;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = isRed ? "#d71920" : "#ffffff";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#ffd900";
      ctx.stroke();

      const angle = start + segmentAngle / 2;
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const prizeImage = prizeImages.get(index);
      if (prizeImage?.complete && prizeImage.naturalWidth) {
        const imageSize = 76;
        ctx.drawImage(prizeImage, radius * 0.66 - imageSize / 2, -87, imageSize, imageSize);
      } else {
        ctx.fillStyle = isRed ? "#ffffff" : "#d71920";
        ctx.font = "700 34px Montserrat, Arial, sans-serif";
        ctx.fillText(prize.emoji || "🎁", radius * 0.66, -42);
      }

      const lines = splitTitle(prize.title.toUpperCase());
      ctx.font = "900 27px Montserrat, Arial, sans-serif";
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, radius * 0.63, 10 + lineIndex * 34);
      });
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  function weightedPrizeIndex() {
    const weights = config.prizes.map((prize) => Math.max(0, Number(prize.weight) || 0));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (total <= 0) return 0;

    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    let pick = (randomValues[0] / 4294967296) * total;

    for (let index = 0; index < weights.length; index += 1) {
      pick -= weights[index];
      if (pick < 0) return index;
    }
    return weights.length - 1;
  }

  function spin() {
    if (spinning) return Promise.reject(new Error("The wheel is already spinning."));
    if (!backdrop.hidden) return Promise.reject(new Error("Close the current result before spinning again."));

    spinning = true;
    spinButton.disabled = true;
    buttonLabel.textContent = "SPINNING…";
    status.textContent = "Good luck!";
    wheelWrap.classList.add("spinning");

    const winnerIndex = weightedPrizeIndex();
    currentPrize = config.prizes[winnerIndex];
    const segmentDegrees = 360 / config.prizes.length;
    const desiredRotation = (360 - winnerIndex * segmentDegrees) % 360;
    const currentPosition = ((rotation % 360) + 360) % 360;
    const correction = (desiredRotation - currentPosition + 360) % 360;
    rotation += 6 * 360 + correction;

    const duration = Math.max(1500, Number(config.spinDurationMs) || 5200);
    rotator.style.transition = `transform ${duration}ms cubic-bezier(.12,.72,.08,1)`;
    rotator.style.transform = `rotate(${rotation}deg)`;

    return new Promise((resolve) => {
      window.setTimeout(() => {
        spinning = false;
        wheelWrap.classList.remove("spinning");
        showResult(currentPrize);
        resolve(currentPrize);
      }, duration + 120);
    });
  }

  function setResultVisual(prize) {
    resultIcon.replaceChildren();
    if (prize.image) {
      const image = document.createElement("img");
      image.src = prize.image;
      image.alt = "";
      resultIcon.appendChild(image);
    } else {
      resultIcon.textContent = prize.emoji || "🎁";
    }
  }

  function showResult(prize) {
    const isRetry = prize.type === "retry";
    resultKicker.textContent = isRetry ? "LUCKY YOU!" : "CONGRATULATIONS!";
    resultTitle.textContent = prize.title;
    resultCopy.textContent = isRetry
      ? "You have earned another spin. Give it one more try!"
      : "You won! Collect your gift from our team.";
    resultAction.textContent = isRetry ? "SPIN AGAIN" : "NEXT PLAYER";
    setResultVisual(prize);

    lastFocused = document.activeElement;
    backdrop.hidden = false;
    resultAction.focus();
    status.textContent = isRetry ? "One more chance unlocked!" : `Winner: ${prize.title}`;

    if (!prefersReducedMotion.matches) launchConfetti(isRetry ? 75 : 140);
  }

  function closeModal(resetForNextPlayer = false) {
    backdrop.hidden = true;
    stopConfetti();
    spinButton.disabled = false;
    buttonLabel.textContent = config.spinButtonText;
    if (resetForNextPlayer) status.textContent = "Ready for the next player.";
    (lastFocused || spinButton).focus();
  }

  function handleResultAction() {
    const isRetry = currentPrize?.type === "retry";
    closeModal(!isRetry);
    if (isRetry) window.setTimeout(() => void spin(), 180);
  }

  function launchConfetti(count) {
    stopConfetti();
    const ratio = window.devicePixelRatio || 1;
    confettiCanvas.width = window.innerWidth * ratio;
    confettiCanvas.height = window.innerHeight * ratio;
    confettiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const colors = ["#ffd900", "#d71920", "#ffffff", "#231509"];
    const pieces = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: -30 - Math.random() * window.innerHeight * 0.3,
      width: 7 + Math.random() * 9,
      height: 4 + Math.random() * 8,
      speed: 2.5 + Math.random() * 5,
      drift: -1.5 + Math.random() * 3,
      rotation: Math.random() * Math.PI,
      turn: -0.13 + Math.random() * 0.26,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    let frames = 0;
    function animate() {
      frames += 1;
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach((piece) => {
        piece.y += piece.speed;
        piece.x += piece.drift;
        piece.rotation += piece.turn;
        confettiCtx.save();
        confettiCtx.translate(piece.x, piece.y);
        confettiCtx.rotate(piece.rotation);
        confettiCtx.fillStyle = piece.color;
        confettiCtx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        confettiCtx.restore();
      });
      if (frames < 340) confettiFrame = requestAnimationFrame(animate);
      else stopConfetti();
    }
    confettiFrame = requestAnimationFrame(animate);
  }

  function stopConfetti() {
    if (confettiFrame) cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  function preloadPrizeImages() {
    config.prizes.forEach((prize, index) => {
      if (!prize.image) return;
      const image = new Image();
      image.addEventListener("load", drawWheel, { once: true });
      image.src = prize.image;
      prizeImages.set(index, image);
    });
  }

  function registerWebMcpTool() {
    const modelContext = document.modelContext;
    if (!modelContext?.registerTool) return;

    try {
      void Promise.resolve(modelContext.registerTool({
        name: "complete_prize_spin",
        title: "Spin the prize wheel",
        description: "Spin the visible Ariant anniversary prize wheel once and return the winning prize after the animation finishes.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length > 0) {
            throw new Error("This action does not accept any inputs.");
          }
          const prize = await spin();
          return { prize: prize.title, extraChance: prize.type === "retry" };
        }
      })).catch(() => {});
    } catch (_) {
      // Browsers without WebMCP support continue using the visible spin button.
    }
  }

  spinButton.addEventListener("click", () => void spin());
  resultAction.addEventListener("click", handleResultAction);
  closeResult.addEventListener("click", () => closeModal(true));
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal(true);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) closeModal(true);
    if ((event.key === "Enter" || event.key === " ") && document.activeElement === document.body) spin();
  });

  makeRimLights();
  preloadPrizeImages();
  drawWheel();
  registerWebMcpTool();
})();
