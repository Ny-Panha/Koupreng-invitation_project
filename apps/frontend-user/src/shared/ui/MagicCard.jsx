import { motion } from "framer-motion";

/**
 * MagicCard — card container with subtle hover lift.
 */
export function MagicCard({ children, className = "", ...props }) {
    return (
        <motion.div
            className={className}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export default MagicCard;
