const Policy = require("../models/Policy");

// GET /api/policies - Publicly fetch current policies
exports.getPolicies = async (req, res) => {
  try {
    let policy = await Policy.findOne({ key: "default_policies" });
    if (!policy) {
      policy = await Policy.create({ key: "default_policies" });
    }
    return res.status(200).json({
      success: true,
      policies: policy,
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve policies",
      error: error.message,
    });
  }
};

// PUT /api/policies - Admin updates policies
exports.updatePolicies = async (req, res) => {
  try {
    const { termsAndConditions, privacyPolicy, refundPolicy, printOnOrderNotice, printOnOrderTitle } = req.body;

    let policy = await Policy.findOne({ key: "default_policies" });
    if (!policy) {
      policy = new Policy({ key: "default_policies" });
    }

    if (termsAndConditions !== undefined) policy.termsAndConditions = termsAndConditions;
    if (privacyPolicy !== undefined) policy.privacyPolicy = privacyPolicy;
    if (refundPolicy !== undefined) policy.refundPolicy = refundPolicy;
    if (printOnOrderNotice !== undefined) policy.printOnOrderNotice = printOnOrderNotice;
    if (printOnOrderTitle !== undefined) policy.printOnOrderTitle = printOnOrderTitle;

    await policy.save();

    return res.status(200).json({
      success: true,
      message: "Policies updated successfully",
      policies: policy,
    });
  } catch (error) {
    console.error("Error updating policies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update policies",
      error: error.message,
    });
  }
};
