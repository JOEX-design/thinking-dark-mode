import React, { useState, useEffect, useRef } from 'react';
import './Count.css';

interface CountProps {
  floor: number;
  target: number;
}

const Count: React.FC<CountProps> = ({ floor, target }) => {
  const counterRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(floor);

  useEffect(() => {
    const update = () => {
      if (count < target) {
        setCount(prevCount => {
          const increment = target - prevCount >= 10 ? 10 : target - prevCount;
          return prevCount + increment;
        });
      }
    };
  
    if (count < target) {
      const frameId = requestAnimationFrame(update);
  
      // Return a cleanup function to cancel the animation frame on unmount or update
      return () => cancelAnimationFrame(frameId);
    } else {
    }
  }, [count, target]);

  return (
    <div
      ref={counterRef}
      className="counter"
      style={{ '--number': count } as React.CSSProperties}
    >
      {count}
    </div>
  );
};

export default Count;