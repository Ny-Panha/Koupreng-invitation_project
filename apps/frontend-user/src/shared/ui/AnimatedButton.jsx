import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * AnimatedButton — link-styled button with hover/tap motion.
 */
export function AnimatedButton({ to, children, className = "", ...props }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{ display: "inline-block" }}
        >
            <Link to={to} className={className} {...props}>
                {children}
            </Link>
        </motion.div>
    );
}

export default AnimatedButton;
