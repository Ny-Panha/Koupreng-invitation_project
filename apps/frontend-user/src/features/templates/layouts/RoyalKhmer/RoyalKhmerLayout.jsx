import KhmerCelestialLayout from "../KhmerCelestial/KhmerCelestialLayout";

/**
 * Legacy RoyalKhmerLayout has been replaced by the modern flagship KhmerCelestialLayout.
 * Forwarding all props ensures backward compatibility with zero legacy artifacts or archaic gates.
 */
export default function RoyalKhmerLayout(props) {
  return <KhmerCelestialLayout {...props} />;
}
