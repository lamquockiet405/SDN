import { Room } from "@/types/room";
import { Star, Users, Zap } from "lucide-react";
import Link from "next/link";

interface RoomCardProps {
  room: Room;
  onBook?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBook }) => {
  const rating = room.rating ?? 0;
  const equipment = room.equipment || [];

  return (
    <div className="bg-white rounded-card shadow-soft-md hover:shadow-soft-lg transition-all hover:-translate-y-1 overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
        <div className="text-center">
          <BookOpen size={32} className="mb-2 mx-auto" />
          <p className="text-sm font-medium">{room.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{room.name}</h3>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Room Info */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={16} />
            <span>{room.capacity}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Star size={16} className="text-warning" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="text-right font-semibold text-primary">
            €{room.pricePerHour}/hr
          </div>
        </div>

        {/* Equipment Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {equipment.slice(0, 2).map((item, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {item}
            </span>
          ))}
          {equipment.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{equipment.length - 2}
            </span>
          )}
        </div>

        {/* Status & Action */}
        <div className="flex items-center gap-2">
          {room.isAvailable ? (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <div className="w-2 h-2 bg-success rounded-full" />
              Available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-danger">
              <div className="w-2 h-2 bg-danger rounded-full" />
              Unavailable
            </span>
          )}
        </div>

        {/* Book Button */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/rooms/${room.id}?tab=reviews`}
            className="text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-btn transition-colors"
          >
            Xem feedback
          </Link>
          <button
            onClick={onBook}
            disabled={!room.isAvailable}
            className="bg-primary hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 rounded-btn transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

import { BookOpen } from "lucide-react";
