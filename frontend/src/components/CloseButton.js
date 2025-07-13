import React from "react";

function CloseButton({ onClick }) {
  return (
    <button className="close-button" onClick={onClick} aria-label="Close">
      &times;
    </button>
  );
}

export default CloseButton;
