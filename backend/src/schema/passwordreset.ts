import { InferSchemaType, model, Schema } from "mongoose";

const passwordresetSchema = new Schema({
    userid: { type: String, required: true },
    resetflg: { type: Number, required: true },
    requestAt: { type: Date, required: true},
}, { timestamps: { createdAt: false, updatedAt: 'resetAt' }});

type PasswordReset = InferSchemaType<typeof passwordresetSchema>;
export default model<PasswordReset>("PasswordReset", passwordresetSchema);