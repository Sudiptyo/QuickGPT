import { User } from "../Models/auth.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.AccessToken;
        console.log("COOKIE TOKEN:", req.cookies?.AccessToken);
        // console.log("HEADER TOKEN:", req.header("Authorization"));

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Access",
            error: err.message
        })
    }
})