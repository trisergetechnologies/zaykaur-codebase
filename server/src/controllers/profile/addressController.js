export const getMyAddresses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = req.user.addresses.length;
    const addresses = req.user.addresses.slice(skip, skip + limit).map((addr, i) => ({
      ...addr.toObject ? addr.toObject() : addr,
      index: skip + i
    }));

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: {
        items: addresses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !street) {
      return res.status(200).json({
        success: false,
        message: "fullName, phone and street are required",
        data: null
      });
    }

    if (isDefault) {
      req.user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    req.user.addresses.push({
      fullName,
      phone,
      street,
      city: city || "",
      state: state || "",
      postalCode: postalCode || "",
      country: country || "India",
      isDefault: !!isDefault
    });

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: req.user.addresses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const index = Number(req.params.index);
    if (index < 0 || index >= req.user.addresses.length) {
      return res.status(200).json({
        success: false,
        message: "Address not found",
        data: null
      });
    }

    const address = req.user.addresses[index];
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (isDefault) {
      req.user.addresses.forEach((addr, i) => {
        addr.isDefault = i === index;
      });
    }

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const index = Number(req.params.index);
    if (index < 0 || index >= req.user.addresses.length) {
      return res.status(200).json({
        success: false,
        message: "Address not found",
        data: null
      });
    }

    req.user.addresses.splice(index, 1);
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const index = Number(req.params.index);
    if (index < 0 || index >= req.user.addresses.length) {
      return res.status(200).json({
        success: false,
        message: "Address not found",
        data: null
      });
    }

    req.user.addresses.forEach((addr, i) => {
      addr.isDefault = i === index;
    });
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated",
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
