import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const ProductReviewsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { productId, productName } = route.params || {};
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/product/${productId}`);
      const data = res.data.data || {};
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      
      // Find user's review
      const userRev = data.reviews?.find(r => r.user?._id === user?._id);
      setUserReview(userRev || null);
      if (userRev) {
        setRating(userRev.rating);
        setComment(userRev.comment || '');
      }
    } catch (error) {
      console.error('Fetch reviews:', error);
      Toast.show({ type: 'error', text1: 'Failed to load reviews' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || rating < 1) {
      Toast.show({ type: 'error', text1: 'Please select a rating' });
      return;
    }

    if (!user) {
      Toast.show({ type: 'error', text1: 'Please login to review' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        product: productId,
        rating,
        comment: comment.trim(),
      });
      Toast.show({ type: 'success', text1: userReview ? 'Review updated' : 'Review submitted' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      Toast.show({ 
        type: 'error', 
        text1: error.response?.data?.message || 'Failed to submit review' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/reviews/${userReview._id}`);
              Toast.show({ type: 'success', text1: 'Review deleted' });
              setUserReview(null);
              setRating(0);
              setComment('');
              fetchReviews();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Failed to delete review' });
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating, size = 16, interactive = false, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && onPress && onPress(star)}
            activeOpacity={interactive ? 0.7 : 1}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? '#fbbf24' : theme.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <View style={styles.summaryTop}>
            <View style={styles.ratingDisplay}>
              <Text style={[styles.avgRating, { color: theme.text }]}>
                {avgRating.toFixed(1)}
              </Text>
              {renderStars(Math.round(avgRating), 24)}
              <Text style={[styles.totalReviews, { color: theme.textSecondary }]}>
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Rating Distribution */}
          <View style={styles.distribution}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <View key={star} style={styles.distributionRow}>
                  <Text style={[styles.distributionLabel, { color: theme.textSecondary }]}>
                    {star} star
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${percentage}%`,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.distributionCount, { color: theme.textSecondary }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Write Review Button */}
        {user && (
          <TouchableOpacity
            style={[styles.writeReviewBtn, { backgroundColor: theme.primary }]}
            onPress={() => setShowReviewForm(!showReviewForm)}
          >
            <Ionicons name={showReviewForm ? 'close' : 'create'} size={20} color="#0f172a" />
            <Text style={styles.writeReviewText}>
              {showReviewForm ? 'Cancel' : userReview ? 'Edit Review' : 'Write a Review'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Review Form */}
        {showReviewForm && user && (
          <View style={[styles.reviewForm, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Your Rating</Text>
            {renderStars(rating, 32, true, setRating)}
            
            <Text style={[styles.formTitle, { color: theme.text, marginTop: 20 }]}>Your Review</Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Share your experience..."
              placeholderTextColor={theme.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />

            <View style={styles.formActions}>
              {userReview && (
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: theme.error }]}
                  onPress={handleDeleteReview}
                >
                  <Text style={[styles.deleteBtnText, { color: theme.error }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmitReview}
                disabled={submitting || !rating}
              >
                {submitting ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            All Reviews ({totalReviews})
          </Text>
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No reviews yet. Be the first to review!
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review._id} style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>
                      {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={[styles.reviewerName, { color: theme.text }]}>
                      {review.user?.name || 'Anonymous'}
                    </Text>
                    <View style={styles.reviewMeta}>
                      {renderStars(review.rating, 14)}
                      <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                {review.comment && (
                  <Text style={[styles.reviewComment, { color: theme.text }]}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  summaryTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingDisplay: {
    alignItems: 'center',
  },
  avgRating: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    marginTop: 4,
  },
  distribution: {
    gap: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionLabel: {
    fontSize: 12,
    width: 50,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  writeReviewText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewForm: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  deleteBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsList: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ProductReviewsScreen;
