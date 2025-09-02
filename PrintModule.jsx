import React, { useEffect, useState } from "react";

const A4_WIDTH = 796;
const A4_HEIGHT = 1123;

export default function PrintModule({ lines, onBack }) {
  const [pageW, setPageW] = useState(A4_WIDTH);
  const [animReady, setAnimReady] = useState(false);

  // Dynamiczne skalowanie dwóch kartek w oknie
  useEffect(() => {
    function handleResize() {
      const maxW = window.innerWidth * 0.95;
      const stopkaH = 40 + 18;
      const maxH = window.innerHeight - stopkaH - 32;
      // Cała szerokość na DWA A4 + margines między nimi
      const cards = 2 * A4_WIDTH + 48;
      const byHeight = maxH * (cards / (1.5 * A4_HEIGHT));
      setPageW(Math.min(A4_WIDTH, (maxW - 48) / 2, byHeight / 2, A4_WIDTH));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = pageW / A4_WIDTH;
  const pageH = pageW * (A4_HEIGHT / A4_WIDTH);
  const clampH = 80 * scale;
  const [clampTop, setClampTop] = useState(pageH - clampH);

  useEffect(() => {
    setClampTop(pageH - clampH);
    const t = setTimeout(() => setClampTop(0), 1000);
    return () => clearTimeout(t);
  }, [pageH]);

  useEffect(() => {
    const t = setTimeout(() => setAnimReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Lustrzane odbicie: linie od dołu, każda linia od końca i flipped poziomo
  const mirroredLines = [...lines];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "stretch",
        overflow: "visible",
        boxSizing: "border-box"
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
            overflow: "visible",
            position: "relative",
          }}
        >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 88 * scale,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: pageH
          }}
        >
          {/* Kartka A4 LEWA */}
          <div
            style={{
              background: "none",
              border: "none",
              borderRadius: 0,
              width: pageW,
              height: pageH,
              boxShadow: "0 6px 48px #0003",
              position: "relative",
              overflow: "visible",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              paddingTop: 200 * scale,
              paddingRight: 270 * scale
            }}
          >
            <img
              src="/assets/korektor.png"
              alt="korektor"
              style={{
                position: "absolute",
                top: -400 * scale,
                left: 0,
                width: "100%",
                height: pageH + 800 * scale,
                objectFit: "cover",
                pointerEvents: "none",
                transform: "translateY(11.5%) scale(0.85)",
                transformOrigin: "top left",
                zIndex: 0
              }}
            />
            <img
              src="/assets/docisk.png"
              alt="docisk"
              style={{
                position: "absolute",
                left: `-${230 * scale}px`,
                top: clampTop,
                width: `calc(100% + ${300 * scale}px)`,
                height: `calc(100% * ${scale}px)`,
                transition: "top 1s ease-in-out",
                zIndex: 2
              }}
            />
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  margin: `${0 * scale}px 0 ${12 * scale}px 0`,
                  minHeight: 96/3 * scale,
                  maxWidth: "100%"
                }}
              >
                {line.map((letter, j) => (
                  <img
                    key={j}
                    src={letter.img}
                    alt={letter.char}
                    width={letter.width/3 * scale}
                    height={96/3 * scale}
                    style={{ marginLeft: 0 * scale }}
                    draggable={false}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Kartka A4 PRAWA (Lustrzane odbicie) */}
          <div
            style={{
              background: "#fff",
              width: pageW,
              height: pageH,
              boxShadow: "none",
              border: "none",
              borderRadius: 0,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              transform: animReady
                ? "translateX(0) rotateX(0deg)"
                : `translateX(-${pageW + 48 * scale}px) rotateX(180deg)`,
              "--dx": `${pageW + 48 * scale}px`,
              animation: animReady
                ? "right-page-flip 1s ease forwards"
                : "none",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingTop: 80 * scale,
                paddingLeft: 60 * scale
              }}
            >
              {mirroredLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    transform: "scaleX(-1)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    margin: `${0 * scale}px 0 ${12 * scale}px 0`,
                    minHeight: 96/3 * scale,
                    filter: "invert(1)",
                    maxWidth: "100%"
                  }}
                >
                  {[...line].map((letter, j) => (
                    <img
                      key={j}
                      src={letter.img}
                      alt={letter.char}
                      width={letter.width/3 * scale}
                      height={96/3 * scale}
                    // style={{ filter: invert(1), }} 
                      draggable={false}

                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Panel boczny (lewy) */}
        <div
          style={{
            position: "absolute",
            left: 10,
            bottom: 70,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "#222",
              color: "#fff",
              border: "2px solid #888",
              borderRadius: "10%",
              width: 39,
              height: 39,
              fontSize: 24,
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "2px 2px 8px #0002",
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Powrót"
            aria-label="Powrót"
          >
          <span
            style={{
              display: "inline-block",
              transform: "rotate(180deg) translateY(2px)",
              fontFamily: "Arial, sans-serif",
            }}
          >
            &#8594;
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
          userSelect: "none"
        }}
      >
        <b>ZECER</b> -  {" "}
        <a
          href="https://mkalodz.pl"
          target="_blank"
          rel="noopener"
          style={{
            color: "#fafafa",
            textDecoration: "none",
            transition: "color 0.45s"
          }}
          onMouseEnter={e => (e.target.style.color = "#ff0000")}
          onMouseLeave={e => (e.target.style.color = "#969498")}
          onTouchStart={e => (e.target.style.color = "#ff0000")}
          onTouchEnd={e => (e.target.style.color = "#969498")}
        >
         &nbsp; &nbsp;  |    &nbsp; &nbsp;   &nbsp; &nbsp;   MKA Łódź
        </a>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; |  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; code:{" "}
        <a
          href="https://peterwolf.pl"
          target="_blank"
          rel="noopener"
          style={{
            color: "#fafafa",
            textDecoration: "none",
            transition: "color 0.45s"
          }}
          onMouseEnter={e => (e.target.style.color = "#ff0000")}
          onMouseLeave={e => (e.target.style.color = "#969498")}
          onTouchStart={e => (e.target.style.color = "#ff0000")}
          onTouchEnd={e => (e.target.style.color = "#969498")}
        >
          peterwolf.pl
        </a>
      </p>
    </div>
  );
}
