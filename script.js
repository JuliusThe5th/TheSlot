const debugEl = document.getElementById("debug"),
  icon_width = 79,
  icon_height = 79,
  num_icons = 9,
  time_per_icon = 100,
  indexes = [0, 0, 0];

const roll = (reel, offset = 0) => {
  // Výpočet hodnoty delta pro posun válců
  const delta =
    (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

  // Vrací promise, abychom mohli počkat, až se všechny válce dokončí
  return new Promise((resolve) => {
    const style = getComputedStyle(reel),
      // Současná pozice pozadí
      backgroundPositionY = parseFloat(style["background-position-y"]),
      // Předpověděná pozice pozadí
      targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
      // Normalizovaná pozice pozadí, pro reset
      normTargetBackgroundPositionY =
        targetBackgroundPositionY % (num_icons * icon_height);

    // Zpoždění animace s timeoutem
    setTimeout(() => {
      // Nastavení přechodu ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
      reel.style.transition = `background-position-y ${
        (8 + 1 * delta) * time_per_icon
      }ms cubic-bezier(.41,-0.01,.63,1.09)`;
      // Nastavení pozice pozadí
      reel.style.backgroundPositionY = `${
        backgroundPositionY + delta * icon_height
      }px`;
    }, offset * 150);

    // Po skončení animace
    setTimeout(() => {
      // Resetování pozice, aby nedošlo k nekonečnému růstu
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      // Rozhodnutí tohoto promise
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

// Zatočit všemi válci
function rollAll() {
  // Najde element s třídou 'debug'
  const debugEl = document.getElementById("debug");
  debugEl.textContent = "Spinning...";

  // Seznam všech válců
  const reelsList = document.querySelectorAll(".slots > .reel");

  // Spustí otáčení všech válců a počká na dokončení pomocí Promise
  Promise.all([...reelsList].map((reel, i) => roll(reel, i))).then((deltas) => {
    // Zpracuje výsledky otáčení
    deltas.forEach(
      (delta, i) => (indexes[i] = (indexes[i] + delta) % num_icons)
    );
    const debugEl = document.getElementById("debug");
    const winType = checkWinType(indexes); // Určí typ výhry
    switch (winType) {
      case "win2":
        debugEl.textContent = "You win!";
        document.querySelector(".slots").classList.add("win2");
        setTimeout(
          () => document.querySelector(".slots").classList.remove("win2"),
          2000
        );
        break;
      case "win1":
        debugEl.textContent = "!JACKPOT!";
        document.querySelector(".slots").classList.add("win1");
        setTimeout(
          () => document.querySelector(".slots").classList.remove("win1"),
          3000
        );
        break;
      default:
        debugEl.textContent = "Better luck next time.";
    }

    // Po dokončení otáčení povolí tlačítko
    const startButton = document.getElementById("start-button");
    startButton.disabled = false;
  });
}

// Funkce na porovnání typu výhry
function checkWinType(indexes) {
  if (
    indexes[0] === indexes[1] &&
    indexes[1] === indexes[2] &&
    indexes[0] === indexes[2]
  ) {
    return "win1";
  } else if (indexes[0] === indexes[1] || indexes[1] === indexes[2]) {
    return "win2";
  } else {
    return "none";
  }
}

function buttonTrigger() {
  const startButton = document.getElementById("start-button");

  // Přidá posluchač události kliknutí na tlačítko
  startButton.addEventListener("click", () => {
    // Kontroluje, zda je tlačítko deaktivováno
    if (!startButton.disabled) {
      // Deaktivuje tlačítko
      startButton.disabled = true;
      // Spustí funkci rollAll pro spuštění otáčení válců
      rollAll();
    }
  });
}

// Inicializuje spouštěč tlačítka při načtení stránky
document.addEventListener("DOMContentLoaded", buttonTrigger);
