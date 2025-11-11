import React from "react";
import { useRef } from "react";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const AnimatedHeaderSection = ({
  subTitle,
  title,
  text,
  textColor,
  withScrollTrigger = false,
  explosionProgress = 0,
}) => {
  const contextRef = useRef(null);
  const headerRef = useRef(null);
  const shouldSplitTitle = title.includes(" ");
  const titleParts = shouldSplitTitle ? title.split(" ") : [title];

  // Function to get letter color based on distance from center
  const getLetterColor = (letterIndex, totalLetters) => {
    const middle = totalLetters / 2;
    const distanceFromMiddle = Math.abs(letterIndex - middle);
    const maxDistance = Math.ceil(totalLetters / 2);
    
    // Calculate which letters should be green based on explosion progress
    const threshold = (1 - explosionProgress) * maxDistance;
    
    if (distanceFromMiddle < threshold) {
      return "text-green-400";
    }
    return "text-white";
  };
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: withScrollTrigger
        ? {
            trigger: contextRef.current,
          }
        : undefined,
    });
    tl.from(contextRef.current, {
      y: "50vh",
      duration: 1,
      ease: "circ.out",
    });
    tl.from(
      headerRef.current,
      {
        opacity: 0,
        y: "200",
        duration: 1,
        ease: "circ.out",
      },
      "<+0.2"
    );
  }, []);
  return (
    <div ref={contextRef}>
      <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
        <div
          ref={headerRef}
          className="flex flex-col justify-center gap-12 pt-16 sm:gap-16"
        >
          <p
            className={`text-sm font-light tracking-[0.5rem] uppercase px-10 ${textColor}`}
          >
            {subTitle}
          </p>
          <div className="px-10">
            <h1
              className={`flex flex-col gap-12 uppercase banner-text-responsive sm:gap-16 md:block`}
            >
              {titleParts.map((part, partIndex) => {
                const letters = part.split("");
                const totalLetters = title.replace(/\s/g, "").length;
                let globalLetterIndex = 0;
                
                // Calculate starting index for this word
                for (let i = 0; i < partIndex; i++) {
                  globalLetterIndex += titleParts[i].length;
                }
                
                return (
                  <span key={partIndex} className="inline-block">
                    {letters.map((letter, letterIndex) => {
                      const currentIndex = globalLetterIndex + letterIndex;
                      return (
                        <span
                          key={letterIndex}
                          className={explosionProgress > 0 ? getLetterColor(currentIndex, totalLetters) : textColor}
                          style={{ transition: "color 0.3s ease" }}
                        >
                          {letter}
                        </span>
                      );
                    })}
                    {" "}
                  </span>
                );
              })}
            </h1>
          </div>
        </div>
      </div>
      <div className={`relative px-10 ${textColor}`}>
        <div className="absolute inset-x-0 border-t-2" />
        <div className="py-12 sm:py-16 text-end">
          <AnimatedTextLines
            text={text}
            className={`font-light uppercase value-text-responsive ${textColor}`}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeaderSection;
