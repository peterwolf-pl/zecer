import React from "react";

export default function Intro({ onSelect }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1 style={{ fontFamily: "GrohmanGrotesk-Classic", fontSize: "2.5rem" }}>
        ZECER Muzeum Książki Artystycznej w Łodzi
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "1rem",
        }}
      >
        <img
          src="/assets/kaszta.png"
          alt="Kaszta"
          style={{ width: "200px", cursor: "pointer" }}
          onClick={() => onSelect("kaszta")}
        />
        <img
          src="/assets/kaszta_szuflada.png"
          alt="Kaszta szuflada"
          style={{ width: "200px", cursor: "pointer" }}
          onClick={() => onSelect("szuflada")}
        />
      </div>
    </div>
  );
}
