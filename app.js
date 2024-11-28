const express = require("express");
const bodyParser = require("body-parser");
const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient({ keyFilename: "pinsight-407e0a5a5b00.json" });

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/analyze", async (req, res) => {
    const imageUrl = req.body.imageUrl;
    try {
        const [result] = await client.annotateImage({
            image: { source: { imageUri: imageUrl } },
            features: [{ type: "FACE_DETECTION" }, { type: "LABEL_DETECTION" }],
        });
        const analysis = {
            emotions: result.faceAnnotations.map((face) => face.joyLikelihood),
            labels: result.labelAnnotations.map((label) => label.description),
        };
        // Save analysis to Firestore
        res.send(analysis);
    } catch (error) {
        res.status(500).send("Error analyzing image: " + error.message);
    }
});

app.listen(8080, () => console.log("App running on port 8080"));


const passport = require("passport");
const PinterestStrategy = require("passport-pinterest");

passport.use(
    new PinterestStrategy(
        {
            clientID: "1508318",
            clientSecret: "null",
            callbackURL: "http://localhost:8080/auth/callback",
            scope: ["read_public", "read_relationships"],
        },
        function (accessToken, refreshToken, profile, done) {
            return done(null, { accessToken, profile });
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
