import React, { useEffect, useState } from "react";

const TITLES = [
  "Empowering you to take control of your schedule—because your time matters.",
  "Designed by a colleague, for colleagues—simplifying the entire swap process for a smoother scheduling experience.",
  "Your work-life balance, your way—effortlessly manage shifts and preferences with ease.",
  "Streamline your scheduling—making shift swaps and preferences a breeze.",
  "Your schedule, your rules—take charge of your work-life balance effortlessly.",
  "Simplifying shift management—because your time is valuable.",
  "Effortless scheduling at your fingertips—designed to fit your lifestyle.",
  "Empowering you to manage your shifts with confidence and ease.",
  "Your time, your choice—experience seamless scheduling like never before.",
  "Revolutionizing shift swaps—bringing simplicity and efficiency to your schedule."
];

const LandingTitle = () => {
  const [titleIndex, setTitleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    let timeout = null;
    let titleInterval = null;
    titleInterval = setInterval(() => {
      const index = (titleIndex + 1) % TITLES.length;
      setTitleIndex(index);
      setFadeIn(true);
      timeout = setTimeout(() => {
        setFadeIn(false);
      }, 5000);
    }, 7000);

    timeout = setTimeout(() => {
      setFadeIn(false);
    }, 4000);

    return function cleanup() {
      clearInterval(titleInterval);
      clearTimeout(timeout);
    };
  }, [titleIndex]);

  return (
    <p className={fadeIn ? "title-fade-in" : "title-fade-out"}>
      {TITLES[titleIndex]}
    </p>
  );
};

export default LandingTitle;
