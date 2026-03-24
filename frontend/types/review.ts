export interface Review {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
      };
  roomId:
    | string
    | {
        _id: string;
        name?: string;
        location?: string;
      };
  bookingId?: string | null;
  rating: number;
  comment: string;
  isHidden: boolean;
  isDeleted: boolean;
  status: "active" | "hidden" | "deleted" | "flagged";
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RatingSummaryItem {
  _id: string | { day: string };
  totalReviews: number;
  averageRating: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface RatingSummaryResponse {
  success: boolean;
  overall: {
    totalReviews: number;
    averageRating: number;
  };
  data: RatingSummaryItem[];
}
