const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:  { type: String, required: true, trim: true },
    image: { type: String, default: "Assets/Users/default.png" },
    birthDate: { type: Date, required:true,
        validate:{ //VALID BIRTH DATE 
            validator: function(date){
                const now = new Date();
                const min = new Date();
                min.setFullYear(now.getFullYear() - 120);  //120 years backwards
                return date <= now && date >= min;
            }, message: "תאריך לידה לא תקין"
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);