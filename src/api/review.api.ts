import api from "@/api/axiosInstance";
import { ReviewResponse, Review, ReviewRequest } from "@/types";


const mapToReview = (response: ReviewResponse): Review => ({
    id: response.id,
    ratingScore: response.ratingScore,
    comment: response.comment,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
    deleted: response.deleted,
    activated: response.activated,
    customerName: response.customerName,
    customerEmail: response.customerEmail,
    customerPhone: response.customerPhone,
});

export const getTop5Reviews = async (): Promise<Review[]> => {
    const { data } = await api.get<ReviewResponse[]>("/reviews/5-reviews");
    return data.map(mapToReview);
};

export const createReview = async (request: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>("/reviews", request);
    return response.data;
};