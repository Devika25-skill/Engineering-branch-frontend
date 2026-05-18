
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { College } from "@/types/college";

interface VirtualTourProps {
  college: College;
  onClose: () => void;
}

const VirtualTour = ({ college, onClose }: VirtualTourProps) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Sample media data - in a real app, this would come from the college data
  const mediaItems = [
    { type: "image", url: "/placeholder.svg", title: "Main Campus Building" },
    { type: "image", url: "/placeholder.svg", title: "Library" },
    { type: "video", url: "#", title: "Campus Tour Video" },
    { type: "image", url: "/placeholder.svg", title: "Sports Complex" },
    { type: "image", url: "/placeholder.svg", title: "Cafeteria" },
    { type: "image", url: "/placeholder.svg", title: "Computer Lab" },
  ];

  const currentMedia = mediaItems[activeMediaIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={20} />
              Back to Details
            </Button>
            <div>
              <h1 className="text-white font-bold text-xl">{college.name}</h1>
              <p className="text-gray-300 text-sm">Virtual Tour</p>
            </div>
          </div>
          {college.website && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <a href={college.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full pt-20">
        {/* Media Display */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
            {currentMedia.type === "image" ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.title}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isVideoPlaying ? (
                      <Pause size={32} />
                    ) : (
                      <Play size={32} />
                    )}
                  </div>
                  <p className="text-lg font-semibold">{currentMedia.title}</p>
                  <p className="text-gray-300 text-sm mt-2">Video content would be displayed here</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  >
                    {isVideoPlaying ? "Pause" : "Play"} Video
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setActiveMediaIndex(Math.max(0, activeMediaIndex - 1))}
              disabled={activeMediaIndex === 0}
            >
              <ChevronLeft size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setActiveMediaIndex(Math.min(mediaItems.length - 1, activeMediaIndex + 1))}
              disabled={activeMediaIndex === mediaItems.length - 1}
            >
              <ChevronRight size={24} />
            </Button>

            {/* Media Title */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                <h3 className="text-white font-semibold">{currentMedia.title}</h3>
                <p className="text-gray-300 text-sm">
                  {activeMediaIndex + 1} of {mediaItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar with thumbnails */}
        <div className="w-80 bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">Gallery</h3>
          <div className="space-y-2">
            {mediaItems.map((item, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  index === activeMediaIndex
                    ? "ring-2 ring-blue-500 bg-blue-500/10"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => setActiveMediaIndex(index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">
                        {item.type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* College Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-white font-semibold mb-3">About {college.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                <span className="text-white">Location:</span> {college.city}, Maharashtra
              </div>
              <div className="text-gray-300">
                <span className="text-white">Established:</span> {college.established}
              </div>
              <div className="text-gray-300">
                <span className="text-white">Type:</span> {college.type}
              </div>
              <div className="text-gray-300">
                <span className="text-white">Rating:</span> {college.rating}/5
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
