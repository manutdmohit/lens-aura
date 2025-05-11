import mongoose from 'mongoose';

const aboutUsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  vision: {
    type: String,
    required: true,
  },
  values: [{
    title: String,
    description: String,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AboutUs || mongoose.model('AboutUs', aboutUsSchema); 