import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({isOpen, onClose, children}){
    const modalRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            console.log(event.target)
          if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
          }
        }
    
        function handleEscape(event) {
          if (event.key === "Escape") {
            onClose();
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("keydown", handleEscape);
        };
      }, [onClose]);

    if(!isOpen)return null;
    return(
        <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-gradient-to-br from-purple-700 via-pink-600 to-yellow-400 p-6 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
}