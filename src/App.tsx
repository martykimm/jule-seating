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
      setSeats(generateSeats(seatCount));
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
      setMessage("Alle pladser er taget.");
      return;
    }

    setIsSpinning(true);
    setMessage(null);

    let currentIndex = 0;
    let remainingSteps = 25 + Math.floor(Math.random() * 15);
    let delay = 40;
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
      <div className="app-backdrop" />
      <div className="snow-layer snow-layer--slow" />
      <div className="snow-layer snow-layer--fast" />

      <div className="app-container">
        <header className="app-header">
          <div className="app-title-block">
            <div className="app-badge">Julefrokost 2024</div>
            <h1 className="app-title">Jule Seating Engine</h1>
            <p className="app-subtitle">
              Lodtrækning til langbordet. Fair, festligt og fuldt tilfældigt.
            </p>

            <div className="app-garland">
              <span className="garland-light garland-light--red" />
              <span className="garland-light garland-light--gold" />
              <span className="garland-light garland-light--green" />
              <span className="garland-light garland-light--gold" />
              <span className="garland-light garland-light--red" />
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
              Reset alle pladser
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
              <span>Ledige pladser: {availableSeats.length}</span>
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
                ? "Alle pladser er taget"
                : isSpinning
                ? "Finder plads..."
                : "TRÆK DIN JULEPLADS"}
            </button>

            <div className="result-card result-card--xmas">
              <h2 className="result-title">Sidste lodtrækning</h2>
              {lastResult ? (
                <div className="result-big">
                  <div className="result-label">Din plads</div>
                  <div className="result-value">{lastResult.id}</div>
                  <div className="result-hint">
                    Find nummeret på bordet og sæt dig til rette.
                  </div>
                </div>
              ) : (
                <div className="result-placeholder">
                  Gå op til skærmen, tryk på knappen og få din juleplads.
                </div>
              )}
            </div>

            <div className="xmas-card">
              <div className="xmas-card-header">Julefakta</div>
              <p className="xmas-card-text">
                Hver plads trækkes tilfældigt, og alle ledige pladser har samme
                sandsynlighed. Ingen favorisering, kun statistik.
              </p>
              <p className="xmas-card-text">
                Når alle pladser er taget, låser systemet automatisk og siger
                pænt tak for i aften.
              </p>
            </div>

            <div className="legend-card legend-card--xmas">
              <h3 className="legend-title">Status</h3>
              <div className="legend-row">
                <span className="legend-dot legend-dot--free" />
                <span>Ledig plads</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot legend-dot--assigned" />
                <span>Plads er taget</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot legend-dot--highlight" />
                <span>Aktuelt lodtrækning</span>
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
