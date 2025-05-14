import { useMemo } from "react";

/**
 * A global page footer that shows persistent brand text on the left
 * and a randomly-selected phrase centred on every page load.
 */
export const Footer = () => {
  const phrase = useMemo(() => {
    const phrases = [
      "Stay sharp, stay prickly.",
      "Growing strong, one spine at a time.",
      "Rooted in resilience.",
      "Bloom where you're planted.",
      "Desert vibes, global reach.",
      "Making tech a little more succulent.",
      "Watered weekly with caffeine.",
      "Cacti never quit.",
      "Always room for one more needle.",
      "Living on the sunny side.",
    ] as const;

    return phrases[Math.floor(Math.random() * phrases.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once per full page load

  return (
    <footer className="border-t bg-white py-8 md:py-12 text-sm text-center">
      <div className="container mx-auto relative flex items-center justify-center px-6 py-4">
        <span className="italic">{phrase}</span>
      </div>
    </footer>
  );
};
