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
      <div className="app-container">
        <header className="app-header">
          <div className="app-title-block">
            <div className="app-badge">Julefrokost</div>
            <h1 className="app-title">Seating Engine</h1>
            <p className="app-subtitle">
              Tryk på knappen. Få et sædenummer. Ingen snyd, ingen favorisering.
            </p>
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
                <div className="table-board">
                  <div className="table-board-inner">Langbord</div>
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
                "spin-button" +
                (isSpinning || availableSeats.length === 0
                  ? " spin-button--disabled"
                  : "")
              }
            >
              {availableSeats.length === 0
                ? "Alle pladser er taget"
                : isSpinning
                ? "Finder plads..."
                : "FIND DIN PLADS"}
            </button>

            <div className="result-card">
              <h2 className="result-title">Sidste resultat</h2>
              {lastResult ? (
                <div className="result-big">
                  <div className="result-label">Din plads</div>
                  <div className="result-value">{lastResult.id}</div>
                </div>
              ) : (
                <div className="result-placeholder">
                  Gå op til skærmen og tryk på knappen for at få din plads.
                </div>
              )}
            </div>

            <div className="legend-card">
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
