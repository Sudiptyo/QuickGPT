import { User } from "../Models/auth.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
}


// const options = {
//     httpOnly: true,
//     secure: false,
//     sameSite: "none"
// }

const generateAccessAndRefreshToken = async (userId, res) => {
    try {
        const user = await User.findById(userId)
        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();

        user.refreshToken = RefreshToken
        await user.save({ validateBeforeSave: false })

        return { AccessToken, RefreshToken }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
        return null;
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    console.log(req.body);

    if ([username, email, password].some((item) => item?.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "All fields are Required"
        })
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        return res.status(409).json({
            success: false,
            message: "User already Exists"
        })
    }

    const user = await User.create({
        username,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        return res.status(500).json({
            success: false,
            message: "User not Created",
        })
    }

    return res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        data: createdUser
    })

})
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if ([email, password].some((item) => item?.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "All fields are Required"
        })
    }

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not Found"
        })
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid Password"
        })
    }

    const token = await generateAccessAndRefreshToken(user._id, res)
    if (!token) return;

    const { AccessToken, RefreshToken } = token;

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    if (!loggedInUser) {
        return res.status(500).json({
            success: false,
            message: "User not found"
        });
    }

    return res.status(200)
        .cookie("AccessToken", AccessToken, options)
        .cookie("RefreshToken", RefreshToken, options)
        .json({
            success: true,
            message: "User logged in successfully",
            data: loggedInUser
        })

})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    res.status(200)
        .clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json({
            success: true,
            message: "User logged out successfully"
        })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.RefreshToken
    if (!incomingRefreshToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const token = await generateAccessAndRefreshToken(user._id, res)
        if (!token) return;

        const { AccessToken, RefreshToken } = token;
        return res.status(200)
            .cookie("AccessToken", AccessToken, options)
            .cookie("RefreshToken", RefreshToken, options)
            .json({
                success: true,
                message: "Access token refreshed successfully",
                data: {
                    AccessToken: AccessToken
                }
            })

    } catch (err) {
        res.status(403).json({
            success: false,
            message: "Forbidden"
        })
    }
})

const getUser = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            data: user
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, getUser }