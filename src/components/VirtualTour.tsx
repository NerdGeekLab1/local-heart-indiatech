import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirtualTourProps {
  siteName: string;
  siteType: string;
  images?: string[];
}

const tourImages: Record<string, string[]> = {
  "Amber Fort": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80",
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80",
  ],
  "Hawa Mahal": [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
    "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=1200&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80",
    "https://images.unsplash.com/photo-1506461883276-594a12b09fe70e?w=1200&q=80",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
  ],
};

const VirtualTour = ({ siteName, siteType, images }: VirtualTourProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const tourImgs = images || tourImages[siteName] || tourImages.default;

  const next = () => { setCurrentIndex((currentIndex + 1) % tourImgs.length); setZoom(1); setRotation(0); };
  const prev = () => { setCurrentIndex((currentIndex - 1 + tourImgs.length) % tourImgs.length); setZoom(1); setRotation(0); };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="rounded-full gap-2">
        <Eye className="w-4 h-4" /> Virtual Tour
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[95vw] h-[90vh] max-w-6xl rounded-2xl overflow-hidden bg-card"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-foreground/50 to-transparent">
                <div>
                  <h3 className="text-lg font-bold text-primary-foreground">{siteName}</h3>
                  <p className="text-sm text-primary-foreground/70 capitalize">{siteType} • Virtual Tour</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-foreground/60 bg-primary-foreground/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    {currentIndex + 1} / {tourImgs.length}
                  </span>
                  <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image */}
              <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, scale: zoom, rotate: rotation }}
                  transition={{ duration: 0.5 }}
                  src={tourImgs[currentIndex]}
                  alt={`${siteName} view ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Navigation Arrows */}
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20">
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-foreground/60 backdrop-blur-md rounded-full px-4 py-2">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center text-primary-foreground">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-primary-foreground/80 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center text-primary-foreground">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-primary-foreground/20" />
                <button onClick={() => setRotation(rotation + 90)} className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center text-primary-foreground">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                {tourImgs.map((img, i) => (
                  <button key={i} onClick={() => { setCurrentIndex(i); setZoom(1); setRotation(0); }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? "border-primary scale-110" : "border-primary-foreground/30 opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VirtualTour;
