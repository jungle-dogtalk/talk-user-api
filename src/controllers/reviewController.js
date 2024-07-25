import reviewService from '../services/reviewService.js';

export const submitReview = async (req, res) => {
    try {
        const { sessionId, reviews } = req.body;
        await reviewService.submitReview(sessionId, reviews);
        res.status(200).json({ message: 'Reviews submitted successfully' });
    } catch (error) {
        console.error('Error submitting reviews:', error);
        res.status(500).json({ message: 'Error submitting reviews', error });
    }
};

export default { submitReview };
