import { useEffect, useState } from "react";

type Seat = {
  id: number;
  side: "top" | "bottom";
  indexOnSide: number;
  assigned: boolean;
};

function generateSeats(count: number): Seat[] {
  const topCount = Math.ceil(count / 2);
  const bottomCount = count - topCount;

  const seats: Seat[] = [];
  let id = 1;

  for (let i = 0; i < topCount; i++) {
    seats.push({ id: id++, side: "top", indexOnSide: i, assigned: false });
  }
  for (let i = 0; i < bottomCount; i++) {
    seats.push({ id: id++, side: "bottom", indexOnSide: i, assigned: false });
  }

  return seats;
}

// simple localStorage helper
function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default function App() {
  const [seatCount, setSeatCount] = usePersistentState<number>("seatCount", 20);
  const [seats, setSeats] = usePersistentState<Seat[]>("seats", []);
  const [highlightSeatId, setHighlightSeatId] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<Seat | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (seats.length !== seatCount) {
      const newSeats = generateSeats(seatCount);
      setSeats(newSeats);
      setLastResult(null);
      setMessage(null);
      setHighlightSeatId(null);
    }
  }, [seatCount, seats.length, setSeats]);

  const availableSeats = seats.filter((s) => !s.assigned);

  function handleReset() {
    setSeats(generateSeats(seatCount));
    setLastResult(null);
    setMessage(null);
    setHighlightSeatId(null);
    setIsSpinning(false);
  }

  function spinForSeat() {
    if (isSpinning) return;
    if (availableSeats.length === 0) {
      setMessage("🎄 Alle pladser er taget. God jul!");
      return;
    }

    setIsSpinning(true);
    setMessage("🎅 Nisserne lodtrækker...");

    let currentIndex = 0;
    let remainingSteps = 28 + Math.floor(Math.random() * 18);
    let delay = 42;
    const seatsPool = [...availableSeats];

    const step = () => {
      const seat = seatsPool[currentIndex % seatsPool.length];
      setHighlightSeatId(seat.id);
      currentIndex++;
      remainingSteps--;

      if (remainingSteps <= 0) {
        const finalSeat = seat;

        setSeats((prev) =>
          prev.map((s) =>
            s.id === finalSeat.id ? { ...s, assigned: true } : s
          )
        );

        setLastResult(finalSeat);
        setIsSpinning(false);
        
        // Festive success messages
        const messages = [
          "🎉 Tillykke! Din plads venter!",
          "⭐ God plads! Glædelig jul!",
          "🎄 Perfekt! Sid godt!",
          "🎅 Nisserne har talt!",
          "✨ Din lucky plads er klar!"
        ];
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        
        return;
      }

      delay *= 1.08;
      window.setTimeout(step, delay);
    };

    step();
  }

  const topSeats = seats.filter((s) => s.side === "top");
  const bottomSeats = seats.filter((s) => s.side === "bottom");

  return (
    <div className="app-root">
      {/* baggrundslag */}
      <div className="app-backdrop" />
      <div className="snow-layer snow-layer--back" />
      <div className="snow-layer snow-layer--front" />
      <div className="snow-hill" />
      <div className="xmas-forest xmas-forest--left">
        <div className="xmas-tree" />
        <div className="xmas-tree xmas-tree--small" />
      </div>
      <div className="xmas-forest xmas-forest--right">
        <div className="xmas-tree" />
        <div className="xmas-tree xmas-tree--small" />
      </div>

      {/* flyvende julemand */}
      <div className="santa-flight">
        <div className="santa-sleigh">
          <div className="sleigh-base" />
          <div className="sleigh-runner" />
          <div className="santa-body" />
          <div className="santa-head" />
          <div className="santa-beard" />
          <div className="santa-hat" />
          <div className="santa-reindeer santa-reindeer--1" />
          <div className="santa-reindeer santa-reindeer--2" />
          <div className="santa-reindeer santa-reindeer--3" />
        </div>
      </div>

      {/* nisser ved snebakken */}
      <div className="xmas-elves">
        <div className="elf elf--left" />
        <div className="elf elf--right" />
      </div>

      <div className="app-container">
        <header className="app-header">
          <div className="app-title-block">
            <div className="app-badge">🎄 Julefrokost 2025 🎄</div>
            <h1 className="app-title">Jule Seating Engine</h1>
            <p className="app-subtitle">
              🎅 Lodtrækning til langbordet. Hvid jul, dansk hygge og helt fair
              pladser. God jul! ⭐
            </p>

            <div className="app-garland">
              <span className="garland-light garland-light--red" />
              <span className="garland-light garland-light--gold" />
              <span className="garland-light garland-light--green" />
              <span className="garland-light garland-light--gold" />
              <span className="garland-light garland-light--red" />
            </div>

            <div className="hygge-tagline">
              <span className="hygge-pill">❄️ Hvid jul</span>
              <span className="hygge-pill">🍽️ Langbord &amp; snak</span>
              <span className="hygge-pill">🎄 Dansk julemad</span>
              <span className="hygge-pill">🎅 Nissevenlig lodtrækning</span>
            </div>
          </div>

          <div className="app-controls">
            <div className="control-group">
              <label className="control-label">Antal sæder</label>
              <input
                type="number"
                min={2}
                max={100}
                value={seatCount}
                onChange={(e) =>
                  setSeatCount(
                    Number(e.target.value) > 0 ? Number(e.target.value) : 0
                  )
                }
                className="control-input"
              />
            </div>
            <button onClick={handleReset} className="reset-button">
              🔄 Nulstil pladekort
            </button>
          </div>
        </header>

        <main className="app-main">
          <div className="table-wrapper">
            <div className="table-area">
              <div className="seat-row seat-row--top">
                {topSeats.map((seat) => (
                  <SeatBubble
                    key={seat.id}
                    seat={seat}
                    isHighlighted={seat.id === highlightSeatId}
                  />
                ))}
              </div>

              <div className="table-middle">
                <div className="table-board table-board--xmas">
                  <div className="table-board-inner">
                    Julebord
                    <div className="table-board-runners">
                      <span className="runner runner--red" />
                      <span className="runner runner--green" />
                    </div>
                    <div className="table-placemat table-placemat--left" />
                    <div className="table-placemat table-placemat--right" />
                  </div>
                </div>
              </div>

              <div className="seat-row seat-row--bottom">
                {bottomSeats.map((seat) => (
                  <SeatBubble
                    key={seat.id}
                    seat={seat}
                    isHighlighted={seat.id === highlightSeatId}
                  />
                ))}
              </div>
            </div>

            <div className="status-bar">
              <span>🎁 Ledige pladser: {availableSeats.length}</span>
              {message && <span className="status-message">{message}</span>}
            </div>
          </div>

          <aside className="side-panel">
            <button
              onClick={spinForSeat}
              disabled={isSpinning || availableSeats.length === 0}
              className={
                "spin-button spin-button--xmas" +
                (isSpinning || availableSeats.length === 0
                  ? " spin-button--disabled"
                  : "")
              }
            >
              {availableSeats.length === 0
                ? "🎄 Alle pladser er taget 🎄"
                : isSpinning
                ? "🎅 Finder plads... 🎅"
                : "🎁 TRÆK DIN JULEPLADS 🎁"}
            </button>

            <div className="result-card result-card--xmas">
              <h2 className="result-title">⭐ Sidste lodtrækning ⭐</h2>
              {lastResult ? (
                <div className="result-big">
                  <div className="result-label">🎄 Din plads</div>
                  <div className="result-value">{lastResult.id}</div>
                  <div className="result-hint">
                    Find nummeret på bordet. Resten er snak, latter og hygge. God jul! 🎅
                  </div>
                </div>
              ) : (
                <div className="result-placeholder">
                  🎁 Gå op til skærmen, tryk på knappen og få din juleplads. ✨
                </div>
              )}
            </div>

            <div className="xmas-card">
              <div className="xmas-card-header">🎄 Julehygge regler 🎄</div>
              <p className="xmas-card-text">
                🎅 Lodtrækningen er helt tilfældig. Alle ledige pladser har samme
                chance. Det eneste ikke-tilfældige er hyggen omkring bordet.
              </p>
              <p className="xmas-card-text">
                ⭐ Når du har fået en plads, så find din stol, hæld noget i glasset
                og giv plads til den næste i køen. Glædelig jul!
              </p>
            </div>

            <div className="legend-card legend-card--xmas">
              <h3 className="legend-title">🎁 Pladekort</h3>
              <div className="legend-row">
                <span className="legend-dot legend-dot--free" />
                <span>✨ Ledig plads</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot legend-dot--assigned" />
                <span>🎄 Plads er taget</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot legend-dot--highlight" />
                <span>⭐ Aktuel lodtrækning</span>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function SeatBubble({
  seat,
  isHighlighted,
}: {
  seat: Seat;
  isHighlighted: boolean;
}) {
  const classes = [
    "seat",
    seat.assigned ? "seat--assigned" : "seat--free",
    isHighlighted ? "seat--highlight" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{seat.id}</div>;
}
