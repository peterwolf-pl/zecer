import React, { useEffect, useRef, useState } from "react";

const handleDragEnd = (e) => {
  // ... przed onLinesChange
  console.log("Zmiana linii:", newLines.map(l=>l.map(a=>a.char).join("")));
  // ...
  onLinesChange(newLines);
  resetDrag();
};

const A4_WIDTH = 796;
const A4_HEIGHT = 1123;






export default function PageComposer({
  lines,
  onLinesChange,
  onBack,
  onClearLines,
  onGoToPrint,
}) {
  console.log("Aktualne lines:", lines.map(l=>l.map(a=>a.char).join("")));
  const [pageW, setPageW] = useState(A4_WIDTH);
  const wrapperRef = useRef();

  useEffect(() => {
    function handleResize() {
      const maxW = window.innerWidth * 0.95;
      const stopkaH = 40 + 18;
      const maxH = window.innerHeight - stopkaH - 32;
      const byHeight = maxH * (A4_WIDTH / A4_HEIGHT);
      setPageW(Math.min(A4_WIDTH, maxW, byHeight));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = pageW / A4_WIDTH;
  const pageH = pageW * (A4_HEIGHT / A4_WIDTH);

  // DRAG
  const [dragIndex, setDragIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);
  const [dragY, setDragY] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const handleDragStart = (idx, e) => {
    e.preventDefault();
    setDragIndex(idx);
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    const rect = document.getElementById(`line-${idx}`)?.getBoundingClientRect();
    setDragOffsetY(clientY - (rect?.top ?? 0));
    setDragY(clientY);

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd, { passive: false });
  };

  const handleDragMove = (e) => {
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    setDragY(clientY);

    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const children = Array.from(wrapper.querySelectorAll(".line-draggable"));
    let found = null;

    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        const relY = clientY - rect.top;
        if (relY < rect.height * 0.3) {
          found = { targetIdx: i, pos: "above" };
        } else if (relY > rect.height * 0.7) {
          found = { targetIdx: i, pos: "below" };
        } else {
          found = { targetIdx: i, pos: "merge" };
        }
        break;
      }
    }
    // Poza liniami
    if (!found) {
      if (children.length > 0) {
        const last = children[children.length - 1].getBoundingClientRect();
        if (clientY > last.bottom) {
          found = { targetIdx: children.length - 1, pos: "below" };
        } else {
          found = { targetIdx: 0, pos: "above" };
        }
      } else {
        found = { targetIdx: 0, pos: "above" };
      }
    }
    setDropPosition(found);
  };

  const handleDragEnd = (e) => {
    if (dragIndex === null || !dropPosition) {
      resetDrag();
      return;
    }
    let newLines = [...lines];
    if (
      dropPosition.pos === "merge" &&
      dropPosition.targetIdx !== dragIndex
    ) {
      // MERGE lines
      const merged = [
        ...newLines[dropPosition.targetIdx],
        ...newLines[dragIndex],
      ];
      newLines = newLines.filter(
        (_, idx) => idx !== dragIndex && idx !== dropPosition.targetIdx
      );
      const insertAt =
        dropPosition.targetIdx > dragIndex
          ? dropPosition.targetIdx - 1
          : dropPosition.targetIdx;
      newLines.splice(insertAt, 0, merged);
      onLinesChange(newLines);
    } else if (
      (dropPosition.pos === "above" || dropPosition.pos === "below") &&
      dropPosition.targetIdx !== dragIndex
    ) {
      // Przesuwanie
      const line = newLines[dragIndex];
      newLines.splice(dragIndex, 1);
      let insertAt = dropPosition.targetIdx;
      if (dropPosition.pos === "below") insertAt++;
      if (
        dragIndex < dropPosition.targetIdx &&
        dropPosition.pos === "above"
      )
        insertAt--;
      newLines.splice(insertAt, 0, line);
      onLinesChange(newLines);
    }
    resetDrag();
  };

  function resetDrag() {
    setDragIndex(null);
    setDropPosition(null);
    setDragY(null);
    setDragOffsetY(0);
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("touchend", handleDragEnd);
  }

  const getLineStyle = (i) => {
    if (
      dropPosition &&
      dropPosition.targetIdx === i &&
      dropPosition.pos === "merge" &&
      dragIndex !== null &&
      dragIndex !== i
    ) {
      return {
        background: "#e3f2ff",
        borderRadius: 4 * scale,
        minHeight: 32 * scale,
        outline: "2px dashed #28b0ef",
        transition: "background 0.12s",
      };
    }
    if (
      dropPosition &&
      dropPosition.targetIdx === i &&
      (dropPosition.pos === "above" || dropPosition.pos === "below") &&
      dragIndex !== null &&
      dragIndex !== i
    ) {
      return {
        borderTop:
          dropPosition.pos === "above"
            ? `3px solid #28b0ef`
            : undefined,
        borderBottom:
          dropPosition.pos === "below"
            ? `3px solid #28b0ef`
            : undefined,
        transition: "border 0.12s",
      };
    }
    return {};
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f5f6f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "stretch",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Kartka A4 */}
        <div
          ref={wrapperRef}
          style={{
            background: "#3a3e41",
            border: "4px solid #222",
            borderRadius: 6 * scale,
            width: pageW,
            height: pageH,
            margin: "4px 0",
            boxShadow: "0 6px 48px #0003",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "flex-start",
          }}
        >
          {lines.map((line, i) => {
            const isHidden = dragIndex === i;
            return (
              <div
                className="line-draggable"
                key={i}
                id={`line-${i}`}
                style={{
                  display: isHidden ? "none" : "flex",
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  margin: `${30 * scale}px ${20 * scale}px ${-24 * scale}px 0`,
                  minHeight: 96 / 3 * scale,
                  maxWidth: `calc(100% - ${40 * scale}px)`,
                  cursor: dragIndex === null ? "grab" : "default",
                  userSelect: "none",
                  touchAction: "none",
                  ...getLineStyle(i),
                }}
                onMouseDown={(e) => handleDragStart(i, e)}
                onTouchStart={(e) => handleDragStart(i, e)}
              >
                {line.map((letter, j) => (
                  <img
                    key={j}
                    src={letter.img}
                    alt={letter.char}
                    width={(letter.width / 3) * scale}
                    height={(96 / 3) * scale}
                    style={{ marginLeft: 0, pointerEvents: "none" }}
                    draggable={false}
                  />
                ))}
              </div>
            );
          })}
          {/* Ghost linii przy drag&drop */}
          {dragIndex !== null && dragY !== null && (
            <div
              style={{
                position: "absolute",
                width: `calc(100% - ${40 * scale}px)`,
                left: `${20 * scale}px`,
                top:
                  dragY -
                  dragOffsetY -
                  wrapperRef.current.getBoundingClientRect().top,
                zIndex: 11,
                pointerEvents: "none",
                opacity: 0.92,
                boxShadow: "0 8px 24px #0005",
                transform: "scale(1.03)",
                background: "#e4ecf4",
                borderRadius: 4 * scale,
              }}
            >
              {lines[dragIndex].map((letter, j) => (
                <img
                  key={j}
                  src={letter.img}
                  alt={letter.char}
                  width={(letter.width / 3) * scale}
                  height={(96 / 3) * scale}
                  style={{ marginLeft: 0, pointerEvents: "none" }}
                  draggable={false}
                />
              ))}
            </div>
          )}
        </div>
        {/* Panel boczny po PRAWEJ */}
        <div
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <button
            onClick={onGoToPrint}
            style={{
              background: "#222",
              color: "#fff",
              border: "2px solid #888",
              borderRadius: "10%",
              width: 30,
              height: 30,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "2px 2px 8px #0002",
              outline: "none",
            }}
            title="Przejdź do druku"
            aria-label="Przejdź do druku"
          >
            <span
              style={{ display: "inline-block", transform: "translateY(0px)" }}
            >
              &#8594;
            </span>
          </button>
        </div>
        {/* Panel boczny (lewy) */}
        <div
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "#222",
              color: "#fff",
              border: "2px solid #888",
              borderRadius: "10%",
              width: 30,
              height: 30,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 10,
              boxShadow: "2px 2px 8px #0002",
              outline: "none",
            }}
            title="Powrót do składu zecerskiego"
            aria-label="Powrót do składu zecerskiego"
          >
            <span
              style={{
                display: "inline-block",
                transform: "rotate(180deg) translateY(2px)",
              }}
            >
              &#8594;
            </span>
          </button>
          <button
            onClick={onClearLines}
            style={{
              background: "#fff",
              color: "#fff",
              border: "2px  solid #ff0000",
              borderRadius: "10%",
              width: 30,
              height: 30,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "2px 2px 8px #0002",
              outline: "none",
            }}
            title="Wyczyść całą stronę"
            aria-label="Wyczyść całą stronę"
          >
            <span
              style={{
                display: "inline-block",
                transform: "rotate(20deg) translateX(-5px) ",
              }}
            >
              &#128465;
            </span>
          </button>
        </div>
      </div>
      {/* STOPKA */}
      <p
        style={{
          width: "100%",
          background: "#000",
          color: "#969498",
          textAlign: "center",
          fontSize: 13,
          letterSpacing: 0.2,
          fontFamily: "inherit",
          padding: "12px 0 8px 0",
          flexShrink: 0,
          marginTop: "auto",
          marginBottom: "0px",
          userSelect: "none",
        }}
      >
        <b>ZECER</b> - gra edukacyjna{" "}
        <a
          href="https://mkalodz.pl"
          target="_blank"
          rel="noopener"
          style={{
            color: "#fafafa",
            textDecoration: "none",
            transition: "color 0.45s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#ff0000")}
          onMouseLeave={(e) => (e.target.style.color = "#969498")}
          onTouchStart={(e) => (e.target.style.color = "#ff0000")}
          onTouchEnd={(e) => (e.target.style.color = "#969498")}
        >
          Muzeum Książki Artystycznej w Łodzi
        </a>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; produkcja:{" "}
        <a
          href="https://peterwolf.pl"
          target="_blank"
          rel="noopener"
          style={{
            color: "#fafafa",
            textDecoration: "none",
            transition: "color 0.45s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#ff0000")}
          onMouseLeave={(e) => (e.target.style.color = "#969498")}
          onTouchStart={(e) => (e.target.style.color = "#ff0000")}
          onTouchEnd={(e) => (e.target.style.color = "#969498")}
        >
          peterwolf.pl
        </a>
      </p>
    </div>
  );
}
