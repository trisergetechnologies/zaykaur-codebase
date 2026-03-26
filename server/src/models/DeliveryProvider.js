import mongoose from "mongoose";

/**
 * Third-party delivery providers. When isIntegrated=true, Server uses API; else manual.
 * See docs/database/collections/order-tracking-delivery.md
 */
const deliveryProviderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    isIntegrated: { type: Boolean, required: true, default: false },
    apiConfig: { type: String, default: "" }, // ref to vault or encrypted; never plain keys
    webhookUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const DeliveryProvider = mongoose.model("DeliveryProvider", deliveryProviderSchema);
export default DeliveryProvider;
