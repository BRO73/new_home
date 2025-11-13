import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { toast } from "sonner";
import { MessageSquareHeart, Send, Sparkles } from "lucide-react";
import {  createReview } from "@/api/review.api"; // Adjust import path
import { getCustomerByPhoneNumber } from "@/api/customer.api"; // Adjust import path

const FeedBack = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating", {
        description: "We'd love to know your rating first!",
      });
      return;
    }

    // Get user phone from localStorage
    const userPhone = localStorage.getItem("userPhone");
    if (!userPhone) {
      toast.error("Authentication required", {
        description: "Please log in to submit feedback",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Get customer by phone number
      const customer = await getCustomerByPhoneNumber(userPhone);
      
      // Step 2: Create review with customerId
      const reviewRequest = {
        customerId: customer.id,
        ratingScore: rating,
        comment: comment,
        // Add other required fields based on your ReviewRequest interface
      };

      await createReview(reviewRequest);
      
      toast.success("Thank you for your feedback!", {
        description: "We appreciate your time and input.",
        icon: <Sparkles className="w-5 h-5" />,
      });

      // Reset form
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback", {
        description: error.response?.data?.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingMessage = (rating: number) => {
    const messages = {
      5: { text: "Excellent! We're thrilled!", emoji: "🎉" },
      4: { text: "Great! Thank you!", emoji: "😊" },
      3: { text: "Good, we'll do better!", emoji: "👍" },
      2: { text: "We can improve!", emoji: "💪" },
      1: { text: "Sorry to hear that", emoji: "😔" }
    };
    return messages[rating as keyof typeof messages] || null;
  };

  const ratingMsg = rating > 0 ? getRatingMessage(rating) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#2563ea]/5 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#2563ea]/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl hover:shadow-2xl transition-all duration-500 border border-blue-100 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#2563ea]/20 to-[#2563ea]/10 rounded-2xl mb-5 md:mb-6 shadow-lg animate-float border border-[#2563ea]/10">
              <MessageSquareHeart className="w-8 h-8 md:w-10 md:h-10 text-[#2563ea]" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              We value your feedback!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Your opinion helps us improve and serve you better
            </p>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Star Rating */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-center text-sm sm:text-base font-semibold text-gray-800">
                How would you rate your experience?
              </label>
              <StarRating rating={rating} onRatingChange={setRating} />
              {ratingMsg && (
                <div className="text-center animate-scale-in">
                  <p className="text-lg font-medium text-[#2563ea] inline-flex items-center gap-2 bg-[#2563ea]/10 px-4 py-2 rounded-full border border-[#2563ea]/20">
                    <span>{ratingMsg.emoji}</span>
                    <span>{ratingMsg.text}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Comment Textarea */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label 
                htmlFor="comment" 
                className="block text-sm sm:text-base font-semibold text-gray-800"
              >
                Share your thoughts
                <span className="text-gray-500 font-normal ml-1">(optional)</span>
              </label>
              <Textarea
                id="comment"
                placeholder="Write your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] md:min-h-[140px] resize-none text-base bg-white border-2 border-gray-200 focus:border-[#2563ea] focus:bg-white transition-all duration-300 rounded-xl focus:ring-2 focus:ring-[#2563ea]/20"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {comment.length > 0 && `${comment.length}/500 characters`}
                </p>
                {comment.length > 400 && (
                  <p className="text-xs text-[#2563ea] animate-fade-in font-medium">
                    Almost at the limit!
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-14 text-base md:text-lg font-semibold bg-[#2563ea] hover:bg-[#1d4ed8] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group border-0"
                style={{ backgroundColor: '#2563ea' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit Feedback
                    <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 px-4 animate-fade-in">
          🔒 Your feedback is confidential and helps us enhance our services
        </p>
      </div>
    </div>
  );
};

export default FeedBack;