import { Sparkles } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__orb">
        <Sparkles className="loading__spinner" />
      </div>
      <span className="loading__text">Loading</span>
    </div>
  );
};

export default Loading;
