import User from "../models/user.model.js";
import { generateAadhaarOtp, verifyAadhaarOtp, verifyPanDetails } from "../services/sandbox.service.js";
import asyncHandler from "../utils/asyncHandler.js";


const REQUEST_TIMEOUT = 30000; // 30 seconds max for controller-level timeout

export const requestAadhaarOtp = asyncHandler(async (req, res) => {
        const { aadhaarNumber } = req.body;
        const userId = req.userId;

        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            return res.status(400).json({ success: false, message: "Invalid Aadhaar number" });
        }

        // Set a controller-level timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("OTP request timeout - Sandbox API is taking too long")), REQUEST_TIMEOUT)
        );

        const result = await Promise.race([
            generateAadhaarOtp({
                aadhaarNumber,
                consent: "Y",
                reason: "Identity Verification for User Profile"
            }),
            timeoutPromise
        ]);

        if (result.status === 200 || result.status === 201) {
            return res.status(200).json({
                success: true,
                message: "OTP sent successfully to your Aadhaar-linked mobile number",
                data: result.data.data // contains reference_id
            });
        } else {
            return res.status(result.status).json({
                success: false,
                message: result.data?.message || "Failed to generate OTP",
                error: result.data
            });
        }
});

export const verifyAadhaar = asyncHandler(async (req, res) => {
        const { reference_id, otp } = req.body;
        const userId = req.userId;

        if (!reference_id || !otp) {
            return res.status(400).json({ success: false, message: "Reference ID and OTP are required" });
        }

        // Set a controller-level timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("OTP verification timeout - Sandbox API is taking too long")), REQUEST_TIMEOUT)
        );

        const result = await Promise.race([
            verifyAadhaarOtp({
                reference_id: String(reference_id),
                otp: String(otp)
            }),
            timeoutPromise
        ]);

        if (result.status === 200 || result.status === 201) {
            // Success! Update user in database
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            user.aadhaarVerified = true;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Aadhaar verified successfully",
                data: result.data.data
            });
        } else {
            console.error("Aadhaar Verify Error:", JSON.stringify(result, null, 2));
            return res.status(result.status || 400).json({
                success: false,
                message: result.data?.message || "OTP verification failed (Invalid Request Body)",
                error: result.data
            });
        }
});

// PAN Card Verification
export const verifyPan = asyncHandler(async (req, res) => {
        const { pan, nameAsPerPan, dateOfBirth } = req.body;
        const userId = req.userId;

        // Validation
        if (!pan || pan.length !== 10) {
            return res.status(400).json({ success: false, message: "Invalid PAN number. PAN must be 10 characters." });
        }

        if (!nameAsPerPan || nameAsPerPan.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Name as per PAN is required" });
        }

        if (!dateOfBirth || dateOfBirth.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Date of birth is required. Format: DD/MM/YYYY" });
        }

        // Set a controller-level timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("PAN verification timeout - Sandbox API is taking too long")), REQUEST_TIMEOUT)
        );

        const result = await Promise.race([
            verifyPanDetails({
                pan: pan.toUpperCase().trim(),
                nameAsPerPan: nameAsPerPan.trim(),
                dateOfBirth: dateOfBirth.trim(),
                consent: "Y",
                reason: "Identity Verification for User Profile"
            }),
            timeoutPromise
        ]);

        if (result.status === 200 || result.status === 201) {
            // Success! Update user in database
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            user.panVerified = true;
            user.panNumber = pan.toUpperCase().trim();
            user.panVerificationData = result.data?.data || result.data;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "PAN verified successfully",
                data: result.data?.data || result.data
            });
        } else {
            console.error("PAN Verify Error:", JSON.stringify(result, null, 2));
            return res.status(result.status || 400).json({
                success: false,
                message: result.data?.message || "PAN verification failed. Please check your details.",
                error: result.data
            });
        }
});
