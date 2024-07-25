import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
