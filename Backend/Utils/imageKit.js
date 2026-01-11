import ImageKit from "imagekit";

let imagekit;

export const getImageKit = () => {
    if (!imagekit) {
        if (
            !process.env.IMAGEKIT_PUBLIC_KEY ||
            !process.env.IMAGEKIT_PRIVATE_KEY ||
            !process.env.IMAGEKIT_URL_ENDPOINT
        ) {
            throw new Error("ImageKit env variables are missing");
        }

        imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });
    }

    return imagekit;
};
