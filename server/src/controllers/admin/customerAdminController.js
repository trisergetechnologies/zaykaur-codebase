import User from "../../models/User.js";

export const getAdminCustomers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : "";

    const query = { role: "customer", isDeleted: { $ne: true } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(query)
        .select("name email phone createdAt isBlocked")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const blockUnblockCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const block = req.body.block === true;

    const user = await User.findOne({
      _id: customerId,
      role: "customer",
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Customer not found",
        data: null,
      });
    }

    user.isBlocked = block;
    await user.save();

    return res.status(200).json({
      success: true,
      message: block ? "Customer blocked successfully" : "Customer unblocked successfully",
      data: { _id: user._id, isBlocked: user.isBlocked },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
