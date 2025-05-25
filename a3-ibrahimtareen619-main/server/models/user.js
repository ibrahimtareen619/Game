import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {type: String,required: true,unique: true},password: {type: String,required: true},
  profile_picture_url: {type: String,default: ''},
  coins: {type: Number,default: 1000},
  win: {type: Number,default: 0},loss: { type: Number,default: 0},
  draw: {type: Number,default: 0}
});

const User = mongoose.model('User', UserSchema);
export default User;
