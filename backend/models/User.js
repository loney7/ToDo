import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let User = new Schema({
    username: {
        type: String,
        unique: true
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Issue' }]
});

export default mongoose.model('User', User);