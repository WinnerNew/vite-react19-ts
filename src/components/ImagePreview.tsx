
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  src: string | null;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onClose }) => {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-6 left-6 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          <motion.img
            layoutId={`post-img-${src}`}
            src={src}
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreview;
