const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    profileimage: {
        type: String,
        default:
            "https://cdn.dribbble.com/users/1104126/screenshots/6737246/team.gif",
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    restToken: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    folderCreatedeDated:{
        type: String,
    },
    resetToken: {
        type: String,
        default: '',
    },
    resetTokenExpiry: {
        type: Date,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
})

userSchema.pre('save', async function (next) {

    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 12);
            //console.log(this)
            // await this.save();
            next();
        }

    } catch (err) {
        console.log(err)
    }

})
userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, process.env.JWT_TOKEN);
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (err) {
        return false;
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;