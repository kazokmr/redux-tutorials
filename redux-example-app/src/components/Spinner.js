import React from "react";

export const Spinner = ({text = '', size = ''}) => {
  const header = text ? <h4>{text}</h4> : null
  return (
    <div className="spinner">
      {header}
      <div className="loader" style={{height: size, width: size}}/>
    </div>
  );
};
